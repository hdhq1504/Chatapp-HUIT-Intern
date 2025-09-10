package com.starwars.backend.dataprovider.repository;

import com.starwars.backend.core.domain.MessageUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageUserRepository extends JpaRepository<MessageUser, UUID> {
    @Query("SELECT mu FROM MessageUser mu WHERE (mu.userId1 = :userId1 AND mu.userId2 = :userId2) OR (mu.userId1 = :userId2 AND mu.userId2 = :userId1)")
    Optional<MessageUser> findByUserIds(@Param("userId1") UUID userId1, @Param("userId2") UUID userId2);

    @Query("SELECT mu FROM MessageUser mu WHERE mu.userId1 = :userId OR mu.userId2 = :userId")
    List<MessageUser> findByUserId(@Param("userId") UUID userId);

    @Query("SELECT DISTINCT mu FROM MessageUser mu WHERE " +
            "(mu.userId1 = :userId OR mu.userId2 = :userId) AND " +
            "EXISTS (SELECT mc FROM MessageContent mc WHERE " +
            "(mc.sendUserId = mu.userId1 AND mc.recivedMessageUserId = mu.userId2) OR " +
            "(mc.sendUserId = mu.userId2 AND mc.recivedMessageUserId = mu.userId1))")
    List<MessageUser> findMessageUserAtLeastOneContent(@Param("userId") UUID userId);
}