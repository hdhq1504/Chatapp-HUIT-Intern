package com.starwars.backend.configuration.jwt;

import lombok.Data;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "application.security.jwt")
public class JwtProperties {
    private String secretKey;
    private long expiration;
    private RefreshToken refreshToken;

    @Data
    public static class RefreshToken {
        private long expiration;
    }
}
