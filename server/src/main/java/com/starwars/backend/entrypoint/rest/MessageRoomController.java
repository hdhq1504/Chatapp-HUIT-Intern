package com.starwars.backend.entrypoint.rest;

import com.starwars.backend.core.usecase.MessageRoomService;
import com.starwars.backend.core.usecase.UserService;
import com.starwars.backend.entrypoint.dto.request.CreateMessageRoomRequest;
import com.starwars.backend.entrypoint.dto.response.ApiResponse;
import com.starwars.backend.entrypoint.dto.response.MessageRoomResponse;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/messagerooms")
public class MessageRoomController {

    private final MessageRoomService messageRoomService;
    private final UserService userService;

    @GetMapping("/find-message-room-at-least-one-content/{userId}")
    public ResponseEntity<ApiResponse<List<MessageRoomResponse>>> findMessageRoomAtLeastOneContent(
            @Valid @PathVariable String userId) {
        try {
            UUID uid = UUID.fromString(userId);
            List<MessageRoomResponse> messageRooms = messageRoomService.findMessageRoomAtLeastOneContent(uid);
            return ResponseEntity.ok(ApiResponse.success("Danh sách phòng chat có ít nhất 1 tin nhắn", messageRooms));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("400", "Invalid UUID: " + userId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("500", "Lỗi server: " + e.getMessage()));
        }
    }

    @PostMapping("/create-room")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponse<MessageRoomResponse>> createMessageRoom(
            @Valid @RequestBody CreateMessageRoomRequest request) {
        if (request.getMembers() == null || request.getMembers().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("400", "Danh sách thành viên không được rỗng"));
        }

        String creatorId = userService.getCurrentUser().getId();
        MessageRoomResponse room = messageRoomService.createMessageRoom(request.getMembers(), creatorId);
        return ResponseEntity.ok(ApiResponse.success("Tạo phòng chat thành công", room));
    }

}