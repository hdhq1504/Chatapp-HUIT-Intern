package com.starwars.backend.dataprovider.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

import com.starwars.backend.core.domain.Token;

import java.util.List;
import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, UUID> {

    Optional<Token> findByTokenAndExpiredIsFalseAndRevokedIsFalse(String token);

    Optional<Token> findByToken(String token);

    List<Token> findAllByUserId(UUID userId);
}
