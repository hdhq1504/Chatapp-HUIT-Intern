package com.starwars.backend.dataprovider.repository;

import com.starwars.backend.core.domain.MessageRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageRoomRepository extends JpaRepository<MessageRoom, UUID> {

        @Query("SELECT mr FROM MessageRoom mr WHERE mr.id IN " +
                        "(SELECT mrm.messageRoomId FROM MessageRoomMember mrm " +
                        "WHERE mrm.userId IN :memberIds " +
                        "GROUP BY mrm.messageRoomId " +
                        "HAVING COUNT(DISTINCT mrm.userId) = :size)")
        Optional<MessageRoom> findMessageRoomByMembers(@Param("memberIds") List<UUID> memberIds,
                        @Param("size") long size);

        @Query("SELECT mr FROM MessageRoom mr WHERE mr.id IN " +
                        "(SELECT mrm.messageRoomId FROM MessageRoomMember mrm " +
                        "WHERE mrm.userId = :userId) AND " +
                        "EXISTS (SELECT mc FROM MessageContent mc WHERE mc.recivedMessageRoomId = mr.id)")
        List<MessageRoom> findMessageRoomAtLeastOneContent(@Param("userId") UUID userId);

}