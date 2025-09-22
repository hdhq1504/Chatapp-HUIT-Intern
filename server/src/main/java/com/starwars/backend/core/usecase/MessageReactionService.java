package com.starwars.backend.core.usecase;

import com.starwars.backend.core.domain.MessageReaction;
import com.starwars.backend.dataprovider.repository.MessageContentRepository;
import com.starwars.backend.dataprovider.repository.MessageReactionRepository;
import com.starwars.commonmessage.common.CustomExceptionHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageReactionService {

    private final MessageReactionRepository reactionRepository;
    private final MessageContentRepository messageContentRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final CustomExceptionHandler exceptionHandler;

    @Transactional
    public void addReaction(UUID messageContentId, UUID userId, String emoji) {
        var msg = messageContentRepository.findById(messageContentId)
                .orElseThrow(() -> exceptionHandler.notFoundException("Không tìm thấy tin nhắn"));
        var existing = reactionRepository.findByMessageContentIdAndUserIdAndEmoji(messageContentId, userId, emoji);
        if (existing.isPresent()) {
            return;
        }
        var reaction = MessageReaction.builder()
                .messageContentId(messageContentId)
                .userId(userId)
                .emoji(emoji)
                .createdAt(LocalDateTime.now())
                .build();
        reactionRepository.save(reaction);

        var payload = new HashMap<String, Object>();
        payload.put("messageId", messageContentId.toString());
        payload.put("userId", userId.toString());
        payload.put("emoji", emoji);

        var roomId = msg.getRecivedMessageRoomId();
        if (roomId != null) {
            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/reactions", payload);
        }
    }

    @Transactional
    public void removeReaction(UUID messageId, UUID userId, String emoji) {
        var msg = messageContentRepository.findById(messageId)
                .orElseThrow(() -> exceptionHandler.notFoundException("Không tìm thấy tin nhắn"));
        reactionRepository.deleteByMessageContentIdAndUserIdAndEmoji(messageId, userId, emoji);

        var payload = new HashMap<String, Object>();
        payload.put("messageId", messageId.toString());
        payload.put("userId", userId.toString());
        payload.put("emoji", emoji);
        payload.put("removed", true);

        var roomId = msg.getRecivedMessageRoomId();
        if (roomId != null) {
            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/reactions", payload);
        }
    }
}
