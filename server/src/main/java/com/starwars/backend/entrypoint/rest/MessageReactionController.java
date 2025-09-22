package com.starwars.backend.entrypoint.rest;

import com.starwars.backend.core.usecase.MessageReactionService;
import com.starwars.backend.core.usecase.MessageContentService;
import com.starwars.backend.core.usecase.UserService;
import com.starwars.backend.entrypoint.dto.request.EditMessageRequest;
import com.starwars.backend.entrypoint.dto.request.ReactionRequest;
import com.starwars.backend.entrypoint.dto.request.ReportRequest;
import com.starwars.backend.entrypoint.dto.response.ApiResponse;
import com.starwars.backend.entrypoint.dto.response.MessageContentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping(path = "/api/v1/messages")
public class MessageReactionController {

        private final MessageReactionService messageReactionService;
        private final MessageContentService messageContentService;
        private final UserService userService;

        @PostMapping("/{messageContentId}/reactions")
        public ResponseEntity<ApiResponse<String>> addReaction(
                        @PathVariable String messageContentId,
                        @RequestBody ReactionRequest request) {
                var me = userService.getCurrentUser();
                messageReactionService.addReaction(
                                UUID.fromString(messageContentId),
                                UUID.fromString(me.getId()),
                                request.emoji);
                return ResponseEntity.ok(ApiResponse.success("Đã thêm reaction", "OK"));
        }

        @DeleteMapping("/{messageContentId}/reactions/{emoji}")
        public ResponseEntity<ApiResponse<String>> removeReaction(
                        @PathVariable String messageContentId,
                        @PathVariable String emoji) {
                var me = userService.getCurrentUser();
                messageReactionService.removeReaction(
                                UUID.fromString(messageContentId),
                                UUID.fromString(me.getId()),
                                emoji);
                return ResponseEntity.ok(ApiResponse.success("Đã gỡ reaction", "OK"));
        }

        @PatchMapping("/{messageContentId}")
        public ResponseEntity<ApiResponse<MessageContentResponse>> editMessage(
                        @PathVariable String messageContentId,
                        @Valid @RequestBody EditMessageRequest body) {
                var me = userService.getCurrentUser();
                var resp = messageContentService.editMessage(UUID.fromString(messageContentId),
                                UUID.fromString(me.getId()),
                                body.getContent());
                return ResponseEntity.ok(ApiResponse.success("Đã sửa tin nhắn", resp));
        }

        @DeleteMapping("/{messageContentId}")
        public ResponseEntity<ApiResponse<MessageContentResponse>> deleteMessage(
                        @PathVariable String messageContentId) {
                var me = userService.getCurrentUser();
                var resp = messageContentService.deleteMessage(UUID.fromString(messageContentId),
                                UUID.fromString(me.getId()));
                return ResponseEntity.ok(ApiResponse.success("Đã xóa tin nhắn", resp));
        }

        @PostMapping("/{messageContentId}/report")
        public ResponseEntity<ApiResponse<String>> reportMessage(
                        @PathVariable String messageContentId,
                        @RequestBody ReportRequest request) {
                var me = userService.getCurrentUser();
                messageContentService.reportMessage(UUID.fromString(messageContentId), UUID.fromString(me.getId()),
                                request.reason);
                return ResponseEntity.ok(ApiResponse.success("Đã báo cáo tin nhắn", "OK"));
        }

}
