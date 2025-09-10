package com.starwars.backend.entrypoint.rest;

import com.starwars.backend.core.usecase.MessageContentService;
import com.starwars.backend.entrypoint.dto.request.MessageContentRequest;
import com.starwars.backend.entrypoint.dto.response.ApiResponse;
import com.starwars.backend.entrypoint.dto.response.MessageContentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping(path = "api/v1/messageContents")
@Slf4j
public class MessageContentController {

    private final MessageContentService messageContentService;

    /**
     * WebSocket endpoint để gửi tin nhắn realtime
     * Client gửi tới: /app/sendMessage
     */
    @MessageMapping("/sendMessage")
    public MessageContentResponse sendMessage(@Valid @Payload MessageContentRequest request) {
        try {
            log.info("=== WEBSOCKET DEBUG ===");
            log.info("Received request: {}", request);
            log.info("Content: {}", request.getContent());
            log.info("SenderId: {}", request.getSendUserId());
            log.info("ReceiverUserId: {}", request.getRecivedMessageUserId());
            log.info("RoomId: {}", request.getRecivedMessageRoomId());

            MessageContentResponse response = messageContentService.sendMessage(request);

            log.info("=== WEBSOCKET SUCCESS ===");
            log.info("Response ID: {}", response.getId());
            log.info("Message saved successfully!");

            return response;
        } catch (Exception e) {
            log.error("=== WEBSOCKET ERROR ===");
            log.error("Error: {}", e.getMessage());
            log.error("Stack trace: ", e);
            throw e;
        }
    }

    /**
     * REST API để gửi tin nhắn (test với Postman)
     */
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<MessageContentResponse>> sendMessageRest(
            @Valid @RequestBody MessageContentRequest request) {
        MessageContentResponse response = messageContentService.sendMessage(request);
        return ResponseEntity.ok(ApiResponse.success("Gửi tin nhắn thành công", response));
    }

}