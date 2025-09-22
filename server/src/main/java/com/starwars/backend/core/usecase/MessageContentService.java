package com.starwars.backend.core.usecase;

import com.starwars.backend.common.enums.MessageType;
import com.starwars.backend.core.domain.MessageContent;
import com.starwars.backend.core.domain.User;
import com.starwars.backend.dataprovider.repository.MessageContentRepository;
import com.starwars.backend.dataprovider.repository.UserRepository;
import com.starwars.backend.entrypoint.dto.request.MessageContentRequest;
import com.starwars.backend.entrypoint.dto.response.MessageContentResponse;
import com.starwars.commonmessage.common.CustomExceptionHandler;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageContentService {

    private final MessageContentRepository messageContentRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final CustomExceptionHandler exceptionHandler;
    private final SimpMessagingTemplate messagingTemplate;
    private static final long EDIT_WINDOW_MINUTES = 30; // configurable

    @Transactional
    public MessageContentResponse sendMessage(MessageContentRequest request) {
        if (request.getContent() == null || request.getContent().isBlank()) {
            throw exceptionHandler.invalidRequest("Nội dung tin nhắn không được rỗng");
        }
        if (request.getSendUserId() == null) {
            throw exceptionHandler.invalidRequest("ID người gửi không được rỗng");
        }

        // Kiểm tra xem là tin nhắn phòng hay tin nhắn trực tiếp
        if (request.getRecivedMessageRoomId() == null && request.getRecivedMessageUserId() == null) {
            throw exceptionHandler.invalidRequest("Phải có ID phòng chat hoặc ID người nhận");
        }

        MessageContent message = MessageContent.builder()
                .content(request.getContent())
                .sendedAt(LocalDateTime.now())
                .messageType(request.getMessageType() != null ? request.getMessageType() : MessageType.TEXT)
                .recivedMessageRoomId(request.getRecivedMessageRoomId())
                .recivedMessageUserId(request.getRecivedMessageUserId())
                .sendUserId(request.getSendUserId())
                .edited(false)
                .deleted(false)
                .build();
        message = messageContentRepository.save(message);

        MessageContentResponse response = modelMapper.map(message, MessageContentResponse.class);
        response.setId(message.getId().toString());
        response.setUserId(message.getSendUserId().toString());
        response.setDateSent(message.getSendedAt());
        response.setEdited(message.getEdited());
        response.setDeleted(message.getDeleted());

        // Broadcast tin nhắn qua WebSocket
        if (request.getRecivedMessageRoomId() != null) {
            // Tin nhắn phòng - broadcast tới tất cả thành viên trong phòng
            messagingTemplate.convertAndSend(
                    "/topic/room/" + request.getRecivedMessageRoomId(),
                    response);
        } else if (request.getRecivedMessageUserId() != null) {
            // Tin nhắn trực tiếp - gửi tới người nhận cụ thể
            messagingTemplate.convertAndSendToUser(
                    request.getRecivedMessageUserId().toString(),
                    "/queue/messages",
                    response);

            // Cũng gửi cho người gửi để sync trên các device khác nhau
            messagingTemplate.convertAndSendToUser(
                    request.getSendUserId().toString(),
                    "/queue/messages",
                    response);
        }

        return response;
    }

    @Transactional(readOnly = true)
    public java.util.List<MessageContentResponse> getMessagesByRoomIdPaginated(
            java.util.UUID roomId,
            java.time.LocalDateTime before,
            Pageable pageable) {
        if (roomId == null) {
            throw exceptionHandler.invalidRequest("ID phòng chat không được rỗng");
        }

        // Sử dụng query khác nhau tùy theo before có null hay không
        List<MessageContent> messages;
        if (before == null) {
            messages = messageContentRepository.findByRoomId(roomId, pageable);
        } else {
            messages = messageContentRepository.findByRoomBefore(roomId, before, pageable);
        }

        return messages.stream()
                .map(this::mapToMessageContentResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Lấy tin nhắn theo room với pagination (không cần before time)
     */
    @Transactional(readOnly = true)
    public java.util.List<MessageContentResponse> getMessagesByRoom(
            java.util.UUID roomId,
            Pageable pageable) {
        return getMessagesByRoomIdPaginated(roomId, null, pageable);
    }

    /**
     * Lấy tin nhắn chat 1-1 với user khác (2 chiều)
     */
    @Transactional(readOnly = true)
    public java.util.List<MessageContentResponse> getMessagesByUser(
            java.util.UUID otherUserId,
            Pageable pageable) {
        if (otherUserId == null) {
            throw exceptionHandler.invalidRequest("ID người dùng không được rỗng");
        }

        // Lấy current user từ security context
        var currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UUID currentUserId = currentUser.getId();

        return messageContentRepository.findChatBetweenUsers(currentUserId, otherUserId, pageable)
                .stream()
                .map(this::mapToMessageContentResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Lấy tin nhắn chat 1-1 theo message_user.id (đúng logic hệ thống)
     */
    @Transactional(readOnly = true)
    public java.util.List<MessageContentResponse> getMessagesByMessageUser(
            java.util.UUID messageUserId,
            Pageable pageable) {
        if (messageUserId == null) {
            throw exceptionHandler.invalidRequest("ID message user không được rỗng");
        }

        return messageContentRepository.findByMessageUserId(messageUserId, pageable)
                .stream()
                .map(this::mapToMessageContentResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Helper method để map MessageContent thành MessageContentResponse với thông
     * tin user
     */
    private MessageContentResponse mapToMessageContentResponse(MessageContent message) {
        MessageContentResponse response = modelMapper.map(message, MessageContentResponse.class);
        response.setId(message.getId().toString());
        response.setUserId(message.getSendUserId().toString());
        response.setDateSent(message.getSendedAt());

        // Set edited và deleted nếu có
        if (message.getEdited() != null) {
            response.setEdited(message.getEdited());
        }
        if (message.getDeleted() != null) {
            response.setDeleted(message.getDeleted());
        }

        // Lấy thông tin user
        User sender = userRepository.findById(message.getSendUserId()).orElse(null);
        if (sender != null) {
            response.setUserName(sender.getName());
            response.setUserAvatar(sender.getAvatar());
        }

        return response;
    }

    @Transactional
    public MessageContentResponse sendMessageToRoom(
            java.util.UUID roomId,
            String senderId,
            com.starwars.backend.entrypoint.dto.request.SendRoomMessageRequest request) {
        if (roomId == null) {
            throw exceptionHandler.invalidRequest("ID phòng chat không được rỗng");
        }
        if (senderId == null) {
            throw exceptionHandler.invalidRequest("ID người gửi không được rỗng");
        }
        if (request.getContent() == null || request.getContent().isBlank()) {
            throw exceptionHandler.invalidRequest("Nội dung tin nhắn không được rỗng");
        }

        MessageContent message = MessageContent.builder()
                .content(request.getContent())
                .sendedAt(java.time.LocalDateTime.now())
                .messageType(request.getMessageType() != null ? request.getMessageType()
                        : com.starwars.backend.common.enums.MessageType.TEXT)
                .recivedMessageRoomId(roomId)
                .recivedMessageUserId(null)
                .sendUserId(java.util.UUID.fromString(senderId))
                .edited(false)
                .deleted(false)
                .build();
        message = messageContentRepository.save(message);

        MessageContentResponse response = modelMapper.map(message, MessageContentResponse.class);
        response.setId(message.getId().toString());
        response.setUserId(message.getSendUserId().toString());
        response.setDateSent(message.getSendedAt());
        response.setEdited(message.getEdited());
        response.setDeleted(message.getDeleted());

        // Broadcast to room topic
        messagingTemplate.convertAndSend("/topic/room/" + roomId, response);
        return response;
    }

    @Transactional(readOnly = true)
    public List<MessageContentResponse> getMessagesByRoomId(UUID roomId) {
        if (roomId == null) {
            throw exceptionHandler.invalidRequest("ID phòng chat không được rỗng");
        }

        return messageContentRepository.findByRecivedMessageRoomIdOrderBySendedAt(roomId)
                .stream()
                .map(message -> {
                    MessageContentResponse response = modelMapper.map(message, MessageContentResponse.class);
                    response.setId(message.getId().toString());
                    response.setUserId(message.getSendUserId().toString());
                    response.setDateSent(message.getSendedAt());
                    response.setEdited(message.getEdited());
                    response.setDeleted(message.getDeleted());
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageContentResponse editMessage(UUID messageId, UUID editorId, String newContent) {
        if (newContent == null || newContent.isBlank()) {
            throw exceptionHandler.invalidRequest("Nội dung không được rỗng");
        }
        var msg = messageContentRepository.findById(messageId)
                .orElseThrow(() -> exceptionHandler.notFoundException("Không tìm thấy tin nhắn"));
        if (!msg.getSendUserId().equals(editorId)) {
            throw exceptionHandler.invalidRequest("Chỉ người gửi mới được sửa");
        }
        if (msg.getDeleted() != null && msg.getDeleted()) {
            throw exceptionHandler.invalidRequest("Tin nhắn đã bị xóa");
        }
        var deadline = msg.getSendedAt() != null ? msg.getSendedAt().plusMinutes(EDIT_WINDOW_MINUTES) : null;
        if (deadline != null && java.time.LocalDateTime.now().isAfter(deadline)) {
            throw exceptionHandler.invalidRequest("Hết thời gian cho phép chỉnh sửa");
        }

        msg.setContent(newContent);
        msg.setEdited(true);
        msg.setUpdatedAt(java.time.LocalDateTime.now());
        msg = messageContentRepository.save(msg);

        var resp = modelMapper.map(msg, MessageContentResponse.class);
        resp.setId(msg.getId().toString());
        resp.setUserId(msg.getSendUserId().toString());
        resp.setDateSent(msg.getSendedAt());
        resp.setEdited(msg.getEdited());
        resp.setDeleted(msg.getDeleted());

        var roomId = msg.getRecivedMessageRoomId();
        if (roomId != null) {
            messagingTemplate.convertAndSend("/topic/room/" + roomId, resp);
        }
        return resp;
    }

    @Transactional
    public MessageContentResponse deleteMessage(UUID messageId, UUID requesterId) {
        var msg = messageContentRepository.findById(messageId)
                .orElseThrow(() -> exceptionHandler.notFoundException("Không tìm thấy tin nhắn"));
        if (!msg.getSendUserId().equals(requesterId)) {
            throw exceptionHandler.invalidRequest("Chỉ người gửi mới được xóa");
        }
        if (msg.getDeleted() != null && msg.getDeleted()) {
            // idempotent
        } else {
            msg.setDeleted(true);
            msg.setDeletedAt(java.time.LocalDateTime.now());
            // Optionally clear content or replace with placeholder
            msg.setContent("");
            messageContentRepository.save(msg);
        }

        var resp = modelMapper.map(msg, MessageContentResponse.class);
        resp.setId(msg.getId().toString());
        resp.setUserId(msg.getSendUserId().toString());
        resp.setDateSent(msg.getSendedAt());
        resp.setEdited(msg.getEdited());
        resp.setDeleted(msg.getDeleted());

        var roomId = msg.getRecivedMessageRoomId();
        if (roomId != null) {
            messagingTemplate.convertAndSend("/topic/room/" + roomId, resp);
        }
        return resp;
    }

    @Transactional
    public void reportMessage(UUID messageId, UUID reporterId, String reason) {
        // For now, just log or later persist to a MessageReport table
        // Could integrate with moderation workflows
        if (reason == null || reason.isBlank()) {
            reason = "unspecified";
        }
        // no-op persistence at the moment
    }

}