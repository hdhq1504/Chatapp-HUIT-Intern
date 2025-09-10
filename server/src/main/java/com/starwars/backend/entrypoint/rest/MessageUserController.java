// ...existing code...
package com.starwars.backend.entrypoint.rest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.starwars.backend.core.usecase.MessageUserService;
import com.starwars.backend.entrypoint.dto.response.ApiResponse;
import com.starwars.backend.entrypoint.dto.response.MessageUserResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/messageroomUsers")
public class MessageUserController {

    private final MessageUserService messageUserService;

    @GetMapping("/find-message-user-at-least-one-content/{userId}")
    public ResponseEntity<ApiResponse<List<MessageUserResponse>>> findMessageUserAtLeastOneContent(
            @Valid @PathVariable String userId) {
        try {
            UUID uid = UUID.fromString(userId);
            List<MessageUserResponse> messageUsers = messageUserService.findMessageUserAtLeastOneContent(uid);
            return ResponseEntity.ok(ApiResponse.success("Danh sách người dùng có ít nhất 1 tin nhắn", messageUsers));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("400", "Invalid UUID: " + userId));
        }
    }

}