package com.starwars.backend.core.usecase;

import com.starwars.backend.core.domain.User;
import com.starwars.backend.dataprovider.repository.UserRepository;
import com.starwars.backend.entrypoint.dto.request.ChangePassRequest;
import com.starwars.backend.exception.Exceptions;
import com.starwars.commonmessage.common.CustomExceptionHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChangePassUseCase {

    private final PasswordEncoder passwordEncoder;
    private final CustomExceptionHandler exceptionHandler;
    private final UserRepository repository;
    private final AuthenticationService authenticationService;

    @Transactional
    public void changePassword(final ChangePassRequest request) {
        var user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())
                || !request.getNewPassword().equals(request.getConfirmationPassword())) {
            exceptionHandler.throwException(Exceptions.PASSWORD_INVALID.getMessage(), HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        authenticationService.revokeAllUserTokens(user.getId().toString());
        repository.save(user);
    }
}
