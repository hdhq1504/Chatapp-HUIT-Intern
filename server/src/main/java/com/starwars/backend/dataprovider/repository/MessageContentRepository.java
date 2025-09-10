package com.starwars.backend.dataprovider.repository;

import com.starwars.backend.core.domain.MessageContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageContentRepository extends JpaRepository<MessageContent, UUID> {
    Optional<MessageContent> findTopByRecivedMessageRoomIdOrderBySendedAtDesc(final UUID recivedMessageRoomId);

    List<MessageContent> findByRecivedMessageRoomIdOrderBySendedAt(final UUID recivedMessageRoomId);

    List<MessageContent> findByRecivedMessageUserIdAndRecivedMessageRoomIdIsNullOrderBySendedAt(
            final UUID recivedMessageUserId);

    Optional<MessageContent> findTopByRecivedMessageUserIdInAndRecivedMessageRoomIdIsNullOrderBySendedAtDesc(
            final List<UUID> recivedMessageUserIds);
}