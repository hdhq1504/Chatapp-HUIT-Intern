package com.starwars.backend.core.usecase;

import com.starwars.backend.common.enums.MessageType;
import com.starwars.backend.core.domain.MessageContent;
import com.starwars.backend.dataprovider.repository.MessageContentRepository;
import com.starwars.backend.entrypoint.dto.request.MessageContentRequest;
import com.starwars.backend.entrypoint.dto.response.MessageContentResponse;
import com.starwars.commonmessage.common.CustomExceptionHandler;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
    private final ModelMapper modelMapper;
    private final CustomExceptionHandler exceptionHandler;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public MessageContentResponse sendMessage(MessageContentRequest request) {
        // Validate request
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
                .build();
        message = messageContentRepository.save(message);

        MessageContentResponse response = modelMapper.map(message, MessageContentResponse.class);
        response.setId(message.getId().toString());
        response.setUserId(message.getSendUserId().toString());
        response.setDateSent(message.getSendedAt());

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
                    return response;
                })
                .collect(Collectors.toList());
    }

}