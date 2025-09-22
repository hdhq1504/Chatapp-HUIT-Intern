package com.starwars.backend.entrypoint.rest;

import com.starwars.backend.core.usecase.MessageContentService;
import com.starwars.backend.entrypoint.dto.request.MessageContentRequest;
import com.starwars.backend.entrypoint.dto.response.ApiResponse;
import com.starwars.backend.entrypoint.dto.response.MessageContentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.Min;

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
    @MessageMapping("/sendMessage") // Receive message from clients sending to /app/sendMessage
    @SendTo("/topic/sendMessage") // send the response to all clients subscribe to /topic/sendMessage
    public ResponseEntity<ApiResponse<MessageContentResponse>> sendMessage(
            @Valid @Payload @RequestBody MessageContentRequest request) {
        MessageContentResponse response = messageContentService.sendMessage(request);
        return ResponseEntity.ok(ApiResponse.success("Gửi tin nhắn thành công", response));
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

    /**
     * API để lấy danh sách tin nhắn của phòng với pagination
     * GET /api/v1/messageContents/room/{roomId}?page=0&size=20
     */
    @GetMapping("/room/{roomId}")
    public ResponseEntity<ApiResponse<List<MessageContentResponse>>> getMessagesByRoom(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) int size) {

        UUID roomUUID = UUID.fromString(roomId);
        Pageable pageable = PageRequest.of(page, size);
        List<MessageContentResponse> messages = messageContentService.getMessagesByRoom(roomUUID, pageable);

        return ResponseEntity.ok(ApiResponse.success("Lấy tin nhắn thành công", messages));
    }

    /**
     * API để lấy danh sách tin nhắn chat 1-1 theo message_user.id
     * GET /api/v1/messageContents/user/{messageUserId}?page=0&size=20
     */
    @GetMapping("/user/{messageUserId}")
    public ResponseEntity<ApiResponse<List<MessageContentResponse>>> getMessagesByUser(
            @PathVariable String messageUserId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) int size) {

        UUID messageUserUUID = UUID.fromString(messageUserId);
        Pageable pageable = PageRequest.of(page, size);
        List<MessageContentResponse> messages = messageContentService.getMessagesByMessageUser(messageUserUUID,
                pageable);

        return ResponseEntity.ok(ApiResponse.success("Lấy tin nhắn chat 1-1 thành công", messages));
    }

}