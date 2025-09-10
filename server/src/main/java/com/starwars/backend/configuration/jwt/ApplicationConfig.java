package com.starwars.backend.configuration.jwt;

import com.starwars.backend.dataprovider.repository.UserRepository;
import com.starwars.commonmessage.common.CustomExceptionHandler;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;

@Configuration
public class ApplicationConfig {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CustomExceptionHandler exceptionHandler;

    public ApplicationConfig(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            CustomExceptionHandler exceptionHandler) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.exceptionHandler = exceptionHandler;
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository
                .findByEmailOrPhone(username)
                .orElseThrow(
                        () -> exceptionHandler.notFoundException(
                                String.format("User %s", username)));
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
