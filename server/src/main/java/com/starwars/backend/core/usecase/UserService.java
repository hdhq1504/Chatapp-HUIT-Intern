package com.starwars.backend.core.usecase;

import com.starwars.backend.common.enums.UserStatus;
import com.starwars.backend.core.domain.Role;
import com.starwars.backend.core.domain.User;
import com.starwars.backend.dataprovider.repository.UserRepository;
import com.starwars.backend.entrypoint.dto.request.UserRequest;
import com.starwars.backend.entrypoint.dto.response.UserResponse;
import com.starwars.commonmessage.common.CustomExceptionHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
        private final CustomExceptionHandler exceptionHandler;
        private final UserRepository userRepository;

        public UserResponse getCurrentUser() {
                var principal = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
                String currentEmail = principal.getUsername();
                User user = userRepository
                                .findByEmail(currentEmail)
                                .orElseThrow(() -> exceptionHandler.notFoundException(
                                                String.format("User with email: %s", currentEmail)));
                return UserResponse.builder()
                                .id(user.getId().toString())
                                .email(user.getEmail())
                                .name(user.getName())
                                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                                .build();
        }

        public List<UserResponse> getUsersOnline() {
                List<User> onlineUsers = userRepository.findByStatus(UserStatus.ONLINE);

                return onlineUsers.stream()
                                .map(user -> UserResponse.builder()
                                                .id(user.getId().toString())
                                                .email(user.getEmail())
                                                .name(user.getName())
                                                .roles(user.getRoles().stream()
                                                                .map(Role::getName)
                                                                .collect(Collectors.toSet()))
                                                .build())
                                .collect(Collectors.toList());
        }

        @Transactional
        public UserResponse connect(UserRequest request) {
                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> exceptionHandler
                                                .notFoundException("User not found: " + request.getEmail()));

                user.setStatus(UserStatus.ONLINE);
                userRepository.save(user);

                UserResponse response = UserResponse.builder()
                                .id(user.getId().toString())
                                .email(user.getEmail())
                                .name(user.getName())
                                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                                .build();

                return response;
        }

        @Transactional
        public UserResponse disconnect(UserRequest request) {
                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> exceptionHandler
                                                .notFoundException("User not found: " + request.getEmail()));

                user.setStatus(UserStatus.OFFLINE);
                userRepository.save(user);

                UserResponse response = UserResponse.builder()
                                .id(user.getId().toString())
                                .email(user.getEmail())
                                .name(user.getName())
                                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                                .build();

                return response;
        }

        @Transactional
        public UserResponse connectCurrentUser() {
                var principal = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
                String currentEmail = principal.getUsername();
                User user = userRepository.findByEmail(currentEmail)
                                .orElseThrow(() -> exceptionHandler.notFoundException("Current user not found"));

                UserRequest userRequest = UserRequest.builder()
                                .email(user.getEmail())
                                .status(user.getStatus())
                                .build();

                return connect(userRequest);
        }

        @Transactional
        public UserResponse disconnectCurrentUser() {
                var principal = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
                String currentEmail = principal.getUsername();
                User user = userRepository.findByEmail(currentEmail)
                                .orElseThrow(() -> exceptionHandler.notFoundException("Current user not found"));

                UserRequest userRequest = UserRequest.builder()
                                .email(user.getEmail())
                                .status(user.getStatus())
                                .build();

                return disconnect(userRequest);
        }
}
