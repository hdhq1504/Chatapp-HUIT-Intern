package com.starwars.backend.dataprovider.repository;

import com.starwars.backend.core.domain.MessagePin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessagePinRepository extends JpaRepository<MessagePin, UUID> {
    List<MessagePin> findByRoomId(UUID roomId);

    void deleteByRoomIdAndMessageId(UUID roomId, UUID messageId);
}
