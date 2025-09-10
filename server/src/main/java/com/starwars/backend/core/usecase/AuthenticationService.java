package com.starwars.backend.core.usecase;

import com.starwars.backend.common.PatternConstants;
import com.starwars.backend.common.SecurityUtils;
import com.starwars.backend.configuration.jwt.JwtService;
import com.starwars.backend.core.domain.Role;
import com.starwars.backend.core.domain.Token;
import com.starwars.backend.core.domain.User;
import com.starwars.backend.dataprovider.repository.RoleRepository;
import com.starwars.backend.dataprovider.repository.TokenRepository;
import com.starwars.backend.dataprovider.repository.UserRepository;
import com.starwars.backend.entrypoint.dto.request.AuthenticationPhoneRequest;
import com.starwars.backend.entrypoint.dto.request.AuthenticationRequest;
import com.starwars.backend.entrypoint.dto.request.InitPasswordRequest;
import com.starwars.backend.entrypoint.dto.request.RegisterRequest;
import com.starwars.backend.entrypoint.dto.request.ResetPasswordRequest;
import com.starwars.backend.entrypoint.dto.request.UserActivateRequest;
import com.starwars.backend.entrypoint.dto.response.ActivedResponse;
import com.starwars.backend.entrypoint.dto.response.AuthenticationResponse;
import com.starwars.backend.exception.Exceptions;
import com.starwars.commonmessage.common.CustomExceptionHandler;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AuthenticationService {
        private final PasswordEncoder passwordEncoder;
        private final CustomExceptionHandler exceptionHandler;
        private final AuthenticationManager authManager;
        private final JwtService jwtService;
        private final ModelMapper modelMapper;
        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final TokenRepository tokenRepository;

        private static final String ROLE_USER = "USER";

        private static final Pattern PHONE_PATTERN = Pattern.compile(PatternConstants.PHONE_REGEX);
        private static final Pattern EMAIL_PATTERN = Pattern.compile(PatternConstants.EMAIL_REGEX);

        @Value("${activation.expired-time}")
        private Integer activationExpiredTime;

        @Value("${activation.resend-interval}")
        private Integer activationResendInterval;

        public AuthenticationService(
                        PasswordEncoder passwordEncoder,
                        CustomExceptionHandler exceptionHandler,
                        AuthenticationManager authManager,
                        JwtService jwtService,
                        ModelMapper modelMapper,
                        UserRepository userRepository,
                        RoleRepository roleRepository,
                        TokenRepository tokenRepository) {
                this.passwordEncoder = passwordEncoder;
                this.exceptionHandler = exceptionHandler;
                this.authManager = authManager;
                this.jwtService = jwtService;
                this.modelMapper = modelMapper;
                this.userRepository = userRepository;
                this.roleRepository = roleRepository;
                this.tokenRepository = tokenRepository;
        }

        @Transactional
        public void register(final RegisterRequest request) {
                userRepository.findByEmail(request.getEmail()).ifPresent(existingUser -> {
                        exceptionHandler.throwException(Exceptions.USER_EXISTS.getCode(),
                                        "Email đã được sử dụng: " + request.getEmail());
                });

                userRepository.findByPhone(request.getPhone()).ifPresent(existingUser -> {
                        exceptionHandler.throwException(Exceptions.USER_EXISTS.getCode(),
                                        "Số điện thoại đã được sử dụng: " + request.getPhone());
                });

                Set<Role> roles = new HashSet<>();
                request.getRoles().forEach(roleName -> {
                        Role role = roleRepository.findByName(roleName)
                                        .orElseThrow(() -> exceptionHandler.invalidRequest(
                                                        String.format("Role name %s is invalid!", roleName)));
                        roles.add(role);
                });

                User user = modelMapper.map(request, User.class);
                user.setRoles(roles);
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                user.setActivated(true);

                userRepository.save(user);
        }

        @Transactional
        public void resetPasswordByAdmin(String email, String newPassword) {
                if (!SecurityUtils.isAdmin()) {
                        exceptionHandler.throwException(Exceptions.NOTFOUND_ERROR.getCode(),
                                        "Bạn không có quyền thực hiện hành động này.");
                }

                User user = userRepository.findByEmail(email).orElseThrow();

                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
        }

        @Transactional
        public String sendKey(String email) {
                try {
                        if (!isEmail(email)) {
                                return "Email không chính xác";
                        }

                        Optional<User> optionalUser = userRepository.findByEmail(email);
                        if (optionalUser.isEmpty()) {
                                return "Tài khoản không tồn tại";
                        }

                        User user = optionalUser.get();

                        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                        SecureRandom random = new SecureRandom();
                        StringBuilder keyBuilder = new StringBuilder(4);
                        for (int i = 0; i < 4; i++) {
                                int idx = random.nextInt(chars.length());
                                keyBuilder.append(chars.charAt(idx));
                        }
                        String key = keyBuilder.toString();

                        user.setResetPasswordKey(key);
                        userRepository.save(user);

                        return "Successfully";
                } catch (Exception e) {
                        return "Thông tin không chính xác";
                }
        }

        @Transactional
        public String resetPassword(final ResetPasswordRequest request) {
                try {
                        if (!isEmail(request.getEmail())) {
                                return "Email không chính xác";
                        }

                        var user = getUserByResetPasswordKey(request.getKey(), request.getEmail());
                        if (user == null) {
                                return "Thông tin không chính xác";
                        }

                        user.setPassword(passwordEncoder.encode(request.getPassword()));
                        user.setResetPasswordKey(null);
                        userRepository.save(user);

                        return "Successfully";
                } catch (Exception e) {
                        return "Thông tin không chính xác";
                }
        }

        @Transactional
        public AuthenticationResponse login(final AuthenticationRequest request) {
                Authentication authentication = authManager.authenticate(
                                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

                var user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> exceptionHandler.notFoundException(
                                                String.format("User %s", request.getEmail())));

                if (Boolean.TRUE.equals(user.getBanned())) {
                        throw exceptionHandler.invalidRequest("Your account has been banned.");
                }

                var accessToken = jwtService.generateToken(
                                Map.of(
                                                "authorities", authentication.getAuthorities().stream()
                                                                .map(GrantedAuthority::getAuthority)
                                                                .toList(),
                                                "userId", user.getId().toString(),
                                                "name", user.getName()),
                                user);
                var refreshToken = jwtService.generateRefreshToken(user);

                revokeAllUserTokens(user.getId().toString());
                saveUserToken(user, accessToken, refreshToken);

                return AuthenticationResponse.builder()
                                .accessToken(accessToken)
                                .refreshToken(refreshToken)
                                .build();
        }

        @Transactional
        public AuthenticationResponse loginPhone(final AuthenticationPhoneRequest request) {
                Authentication authentication = authManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getPhone(), request.getPassword()));
                var user = userRepository
                                .findByPhone(request.getPhone())
                                .orElseThrow(
                                                () -> exceptionHandler.notFoundException(
                                                                String.format("User %s", request.getPhone())));
                var accessToken = jwtService.generateToken(
                                Map.of(
                                                "authorities",
                                                authentication.getAuthorities().stream()
                                                                .map(GrantedAuthority::getAuthority)
                                                                .toList(),
                                                "userId",
                                                user.getId().toString(),
                                                "name",
                                                user.getName()),
                                user);
                var refreshToken = jwtService.generateRefreshToken(user);
                revokeAllUserTokens(user.getId().toString());
                saveUserToken(user, accessToken, refreshToken);
                return AuthenticationResponse.builder()
                                .accessToken(accessToken)
                                .refreshToken(refreshToken)
                                .build();
        }

        @Transactional
        public AuthenticationResponse refreshToken(HttpServletRequest request) {
                final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
                final String refreshToken;
                final String userEmail;

                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                        throw new RuntimeException("Refresh token is missing or invalid.");
                }

                refreshToken = authHeader.substring(7);
                userEmail = jwtService.extractUsername(refreshToken);
                if (userEmail == null) {
                        throw new RuntimeException("Invalid refresh token.");
                }

                var user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> exceptionHandler.notFoundException("User %s".formatted(userEmail)));

                if (!jwtService.isTokenValid(refreshToken, user)) {
                        throw new RuntimeException("Refresh token is invalid or expired.");
                }

                var accessToken = jwtService.generateToken(
                                Collections.singletonMap("authorities", user.getAuthorities().stream()
                                                .map(GrantedAuthority::getAuthority)
                                                .toList()),
                                user);

                revokeAllUserTokens(user.getId().toString());
                saveUserToken(user, accessToken, refreshToken);

                return AuthenticationResponse.builder()
                                .accessToken(accessToken)
                                .refreshToken(refreshToken)
                                .build();
        }

        @Transactional
        public ActivedResponse activateUser(final UserActivateRequest request) {
                var user = userRepository
                                .findByActivationKeyAndEmail(request.getKey(), request.getEmail())
                                .orElseThrow(() -> exceptionHandler.notFoundException(
                                                String.format("User with key %s", request.getKey())));
                validateRole(user, ROLE_USER);
                var activateResponse = ActivedResponse.builder().isActive(true).build();
                if (user.getActivated()) {
                        return activateResponse;
                }

                var currentTime = LocalDateTime.now();
                if (currentTime.isAfter(user.getActivationExpiredDate())) {
                        throw exceptionHandler.invalidRequest("Activation key has expired");
                }

                user.setActivated(true);
                user.setActivationKey(null);
                user.setActivationExpiredDate(null);
                user.setNextActivationTime(null);
                userRepository.save(user);
                return activateResponse;
        }

        @Transactional
        public void initPassword(final InitPasswordRequest request) {
                var phoneNumberOrEmail = request.getPhoneOrEmail();
                if (!isValidPhoneNumberOrEmail(phoneNumberOrEmail)) {
                        throw exceptionHandler.invalidRequest("Invalid phone number or email format");
                }

                var isEmail = isEmail(phoneNumberOrEmail);
                var user = isEmail ? getUserByEmail(phoneNumberOrEmail) : getUserByPhone(phoneNumberOrEmail);

                validateRole(user, ROLE_USER);

                if (!user.getActivated()) {
                        throw exceptionHandler.invalidRequest("Your account is not active");
                }

                user.setPassword(passwordEncoder.encode(request.getPassword()));
                userRepository.save(user);
        }

        private void validateRole(final User user, final String role) {
                var userRole = roleRepository
                                .findByName(role)
                                .orElseThrow(() -> exceptionHandler.invalidRequest(
                                                String.format("Role name %s is invalid!", ROLE_USER)));
                if (!user.getRoles().contains(userRole)) {
                        throw exceptionHandler.invalidRequest("Feature not available for your role");
                }
        }

        private void saveUserToken(User user, String accessToken, String refreshToken) {
                var token = Token.builder()
                                .user(user)
                                .token(accessToken)
                                .refreshToken(refreshToken)
                                .expired(false)
                                .revoked(false)
                                .build();
                tokenRepository.save(token);
        }

        public void revokeAllUserTokens(String userId) {
                var validUserTokens = tokenRepository.findAllByUserId(UUID.fromString(userId));
                if (validUserTokens.isEmpty())
                        return;
                validUserTokens.forEach(
                                token -> {
                                        token.setExpired(true);
                                        token.setRevoked(true);
                                });
                tokenRepository.saveAll(validUserTokens);
        }

        private boolean isValidPhoneNumberOrEmail(final String input) {
                return PHONE_PATTERN.matcher(input).matches() || EMAIL_PATTERN.matcher(input).matches();
        }

        private boolean isEmail(String input) {
                return EMAIL_PATTERN.matcher(input).matches();
        }

        private User getUserByEmail(String email) {
                return userRepository.findByEmail(email)
                                .orElseThrow(() -> exceptionHandler.notFoundException(
                                                String.format("User %s not found", email)));
        }

        private User getUserByPhone(String phone) {
                return userRepository.findByPhone(phone)
                                .orElseThrow(() -> exceptionHandler.notFoundException(
                                                String.format("User %s not found", phone)));
        }

        private User getUserByResetPasswordKey(String key, String email) {
                return userRepository.findByResetPasswordKeyAndEmail(key, email).orElseThrow(
                                () -> exceptionHandler.notFoundException(
                                                String.format("User %s not found", key)));
        }
}