package com.starwars.backend.dataprovider.repository;

import com.starwars.backend.core.domain.MessageContent;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

        @Query("SELECT mc FROM MessageContent mc WHERE mc.recivedMessageRoomId = :roomId"
                        + " ORDER BY mc.sendedAt DESC")
        List<MessageContent> findByRoomId(@Param("roomId") UUID roomId, Pageable pageable);

        @Query("SELECT mc FROM MessageContent mc WHERE mc.recivedMessageRoomId = :roomId"
                        + " AND mc.sendedAt < :before"
                        + " ORDER BY mc.sendedAt DESC")
        List<MessageContent> findByRoomBefore(@Param("roomId") UUID roomId,
                        @Param("before") java.time.LocalDateTime before,
                        Pageable pageable);

        @Query("SELECT mc FROM MessageContent mc WHERE mc.recivedMessageRoomId IS NULL"
                        + " AND ((mc.sendUserId = :userId1 AND mc.recivedMessageUserId = :userId2)"
                        + " OR (mc.sendUserId = :userId2 AND mc.recivedMessageUserId = :userId1))"
                        + " ORDER BY mc.sendedAt DESC")
        List<MessageContent> findChatBetweenUsers(@Param("userId1") UUID userId1,
                        @Param("userId2") UUID userId2,
                        Pageable pageable);

        // Sửa lại: recivedMessageUserId trong message_content chính là ID của
        // message_user (phòng 1-1)
        @Query("SELECT mc FROM MessageContent mc WHERE mc.recivedMessageUserId = :messageUserId"
                        + " ORDER BY mc.sendedAt DESC")
        List<MessageContent> findByMessageUserId(@Param("messageUserId") UUID messageUserId,
                        Pageable pageable);
}