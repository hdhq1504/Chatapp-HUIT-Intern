package com.starwars.backend.configuration.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtProperties jwtProperties;
    private static final String ISSUER = "hathyo.com";

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, jwtProperties.getExpiration());
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(
                new HashMap<>(), userDetails, jwtProperties.getRefreshToken().getExpiration());
    }

    // private String buildToken(
    // Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
    // return Jwts.builder()
    // .setClaims(extraClaims)
    // .setIssuer(ISSUER)
    // .setSubject(userDetails.getUsername())
    // .setIssuedAt(new Date(System.currentTimeMillis()))
    // .setExpiration(new Date(System.currentTimeMillis() + expiration))
    // .signWith(getSignInKey(), SignatureAlgorithm.HS256)
    // .compact();
    // }

    public String generateTokenWithoutExpiration(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, -1);
    }

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
        JwtBuilder jwtBuilder = Jwts.builder()
                .setClaims(extraClaims)
                .setIssuer(ISSUER)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256);

        if (expiration > 0) {
            jwtBuilder.setExpiration(new Date(System.currentTimeMillis() + expiration));
        }

        return jwtBuilder.compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        Date expiration = extractExpiration(token);

        // Nếu expiration là null hoặc -1 thì token không hết hạn
        if (expiration == null || expiration.getTime() == -1) {
            return false;
        }

        // Kiểm tra nếu token đã hết hạn
        return expiration.before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.getSecretKey());
        return Keys.hmacShaKeyFor(keyBytes);
    }

}
