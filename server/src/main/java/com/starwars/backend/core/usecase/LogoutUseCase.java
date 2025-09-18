package com.starwars.backend.core.usecase;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Service;

import com.starwars.backend.common.enums.UserStatus;
import com.starwars.backend.core.domain.User;
import com.starwars.backend.dataprovider.repository.TokenRepository;
import com.starwars.backend.dataprovider.repository.UserRepository;

@Service
public class LogoutUseCase implements LogoutHandler {

    private final TokenRepository tokenRepository;
    private final UserRepository userRepository;

    public LogoutUseCase(TokenRepository tokenRepository, UserRepository userRepository) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String jwt;
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return;
        }
        jwt = authHeader.substring(7);
        var storedToken = tokenRepository.findByTokenAndExpiredIsFalseAndRevokedIsFalse(jwt).orElse(null);
        if (storedToken != null) {
            storedToken.setExpired(true);
            storedToken.setRevoked(true);
            tokenRepository.save(storedToken);

            User user = storedToken.getUser();
            if (user != null) {
                user.setStatus(UserStatus.OFFLINE);
                userRepository.save(user);
            }

            SecurityContextHolder.clearContext();
        }
    }

}
