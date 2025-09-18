package com.starwars.backend.dataprovider.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.starwars.backend.core.domain.MessageRoomMember;

@Repository
public interface MessageRoomMemberRepository extends JpaRepository<MessageRoomMember, UUID> {
    List<MessageRoomMember> findByMessageRoomId(UUID messageRoomId);

    List<MessageRoomMember> findByUserId(UUID userId);

    void deleteByMessageRoomIdAndUserId(UUID messageRoomId, UUID userId);

    boolean existsByMessageRoomIdAndUserId(UUID messageRoomId, UUID userId);
}
