package com.starwars.backend.dataprovider.repository;

import com.starwars.backend.core.domain.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageReactionRepository extends JpaRepository<MessageReaction, UUID> {
    List<MessageReaction> findByMessageContentId(UUID messageContentId);

    Optional<MessageReaction> findByMessageContentIdAndUserIdAndEmoji(UUID messageContentId, UUID userId, String emoji);

    void deleteByMessageContentIdAndUserIdAndEmoji(UUID messageContentId, UUID userId, String emoji);
}
