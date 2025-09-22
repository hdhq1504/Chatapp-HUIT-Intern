package com.starwars.backend.entrypoint.rest;

import com.starwars.backend.core.domain.MessageRoomMember;
import com.starwars.backend.core.domain.User;
import com.starwars.backend.core.usecase.MessageContentService;
import com.starwars.backend.core.usecase.MessageRoomService;
import com.starwars.backend.core.usecase.UserService;
import com.starwars.backend.core.usecase.MessagePinService;
import com.starwars.backend.dataprovider.repository.MessageContentRepository;
import com.starwars.backend.dataprovider.repository.MessageRoomMemberRepository;
import com.starwars.backend.dataprovider.repository.MessageRoomRepository;
import com.starwars.backend.dataprovider.repository.UserRepository;
import com.starwars.backend.entrypoint.dto.request.AddMembersRequest;
import com.starwars.backend.entrypoint.dto.request.AdminRequest;
import com.starwars.backend.entrypoint.dto.request.CreateMessageRoomRequest;
import com.starwars.backend.entrypoint.dto.request.PinRequest;
import com.starwars.backend.entrypoint.dto.request.ReadReceiptRequest;
import com.starwars.backend.entrypoint.dto.request.UpdateRoomRequest;
import com.starwars.backend.entrypoint.dto.response.ApiResponse;
import com.starwars.backend.entrypoint.dto.response.MessageContentResponse;
import com.starwars.backend.entrypoint.dto.response.MessageRoomResponse;
import com.starwars.backend.entrypoint.dto.response.MessageRoomSummaryResponse;
import com.starwars.backend.entrypoint.dto.response.UserResponse;
import com.starwars.backend.entrypoint.event.TypingPayload;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/messagerooms")
public class MessageRoomController {

    private final MessageRoomService messageRoomService;
    private final UserService userService;
    private final MessageContentService messageContentService;
    private final MessagePinService messagePinService;
    private final UserRepository userRepository;
    private final MessageRoomRepository messageRoomRepository;
    private final MessageRoomMemberRepository messageRoomMemberRepository;
    private final MessageContentRepository messageContentRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/create-room")
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

    @GetMapping("/{roomId}")
    public ResponseEntity<ApiResponse<MessageRoomResponse>> getRoom(@PathVariable String roomId) {
        var uuid = UUID.fromString(roomId);
        var room = messageRoomService.getRoomById(uuid);
        return ResponseEntity.ok(ApiResponse.success("Chi tiết phòng", room));
    }

    @PatchMapping("/{roomId}")
    public ResponseEntity<ApiResponse<MessageRoomResponse>> updateRoom(@PathVariable String roomId,
            @Valid @RequestBody UpdateRoomRequest request) {
        var uuid = UUID.fromString(roomId);
        var me = userService.getCurrentUser();
        var updated = messageRoomService.updateRoom(uuid, me.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật phòng thành công", updated));
    }

    @GetMapping("/find-message-room-at-least-one-content/{userId}")
    public ResponseEntity<ApiResponse<List<MessageRoomResponse>>> findMessageRoomAtLeastOneContent(
            @Valid @PathVariable String userId) {
        try {
            UUID uid = UUID.fromString(userId);
            List<MessageRoomResponse> messageRooms = messageRoomService.findMessageRoomAtLeastOneContent(uid);
            return ResponseEntity.ok(ApiResponse.success("Danh sách phòng 1-n có ít nhất 1 tin nhắn", messageRooms));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("400", "Invalid UUID: " + userId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("500", "Lỗi server: " + e.getMessage()));
        }
    }

    @PostMapping("/{roomId}/add-members")
    public ResponseEntity<ApiResponse<MessageRoomResponse>> addMembers(@PathVariable String roomId,
            @Valid @RequestBody AddMembersRequest request) {
        var uuid = UUID.fromString(roomId);
        var me = userService.getCurrentUser();
        var updated = messageRoomService.addMembers(uuid, request.getUserIds(), me.getId());
        return ResponseEntity.ok(ApiResponse.success("Thêm thành viên thành công", updated));
    }

    @DeleteMapping("/{roomId}/remove-members/{userId}")
    public ResponseEntity<ApiResponse<MessageRoomResponse>> removeMember(@PathVariable String roomId,
            @PathVariable String userId) {
        var uuid = UUID.fromString(roomId);
        var target = UUID.fromString(userId);
        var me = userService.getCurrentUser();
        var updated = messageRoomService.removeMember(uuid, target, UUID.fromString(me.getId()));
        return ResponseEntity.ok(ApiResponse.success("Xóa thành viên thành công", updated));
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<ApiResponse<MessageRoomResponse>> leaveRoom(@PathVariable String roomId) {
        var uuid = UUID.fromString(roomId);
        var me = userService.getCurrentUser();
        var updated = messageRoomService.leaveRoom(uuid, UUID.fromString(me.getId()));
        return ResponseEntity.ok(ApiResponse.success("Rời phòng thành công", updated));
    }

    @PostMapping("/{roomId}/admins")
    public ResponseEntity<ApiResponse<MessageRoomResponse>> addAdmin(
            @PathVariable String roomId,
            @RequestBody AdminRequest body) {
        var uuid = UUID.fromString(roomId);
        var me = userService.getCurrentUser();
        var updated = messageRoomService.addAdmin(uuid, UUID.fromString(body.userId), UUID.fromString(me.getId()));
        return ResponseEntity.ok(ApiResponse.success("Thêm admin thành công", updated));
    }

    @DeleteMapping("/{roomId}/admins/{userId}")
    public ResponseEntity<ApiResponse<MessageRoomResponse>> removeAdmin(
            @PathVariable String roomId,
            @PathVariable String userId) {
        var uuid = UUID.fromString(roomId);
        var me = userService.getCurrentUser();
        var updated = messageRoomService.removeAdmin(uuid, UUID.fromString(userId), UUID.fromString(me.getId()));
        return ResponseEntity.ok(ApiResponse.success("Gỡ admin thành công", updated));
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<ApiResponse<String>> deleteRoom(@PathVariable String roomId) {
        var uuid = UUID.fromString(roomId);
        var me = userService.getCurrentUser();
        messageRoomService.deleteRoom(uuid, UUID.fromString(me.getId()));
        return ResponseEntity.ok(ApiResponse.success("Xóa phòng thành công", "OK"));
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<ApiResponse<List<MessageContentResponse>>> getMessages(
            @PathVariable String roomId,
            @RequestParam(name = "before", required = false) String before,
            @RequestParam(name = "limit", required = false, defaultValue = "50") int limit) {

        LocalDateTime beforeTime = null;
        if (before != null && !before.isBlank()) {
            beforeTime = LocalDateTime.parse(before);
        }

        var uuid = UUID.fromString(roomId);
        var page = PageRequest.of(0, Math.max(1, Math.min(limit, 100)));
        var items = messageContentService.getMessagesByRoomIdPaginated(uuid, beforeTime, page);
        return ResponseEntity.ok(ApiResponse.success("Danh sách tin nhắn", items));
    }

    @PostMapping("/{roomId}/read-receipts")
    public ResponseEntity<ApiResponse<String>> postReadReceipt(
            @PathVariable String roomId,
            @RequestBody ReadReceiptRequest requestBody) {
        var uuid = UUID.fromString(roomId);
        var me = userService.getCurrentUser();

        java.time.LocalDateTime cutoff = null;
        if (requestBody != null && requestBody.messageId != null && !requestBody.messageId.isBlank()) {
            messageContentRepository.findById(java.util.UUID.fromString(requestBody.messageId))
                    .ifPresent(mc -> {
                        // use array to mutate outer variable
                    });
            var msgOpt = messageContentRepository.findById(java.util.UUID.fromString(requestBody.messageId));
            if (msgOpt.isPresent()) {
                cutoff = msgOpt.get().getSendedAt();
            }
        }
        if (cutoff == null && requestBody != null && requestBody.timestamp != null
                && !requestBody.timestamp.isBlank()) {
            cutoff = java.time.LocalDateTime.parse(requestBody.timestamp);
        }
        if (cutoff == null) {
            cutoff = java.time.LocalDateTime.now();
        }

        // Persist lastSeen per member using MessageRoomMember.lastSeen
        final java.time.LocalDateTime finalCutoff = cutoff;
        var memberList = messageRoomMemberRepository.findByMessageRoomId(uuid);
        memberList.stream()
                .filter(m -> m.getUserId().toString().equals(me.getId()))
                .findFirst()
                .ifPresent(m -> {
                    var current = m.getLastSeen();
                    if (current == null || current.isBefore(finalCutoff)) {
                        m.setLastSeen(finalCutoff);
                        messageRoomMemberRepository.save(m);
                    }
                });

        // WS broadcast read receipt update
        var payload = new java.util.HashMap<String, Object>();
        payload.put("userId", me.getId());
        payload.put("roomId", roomId);
        payload.put("lastSeen", cutoff.toString());
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/read-receipts", payload);

        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái đọc thành công", "OK"));
    }

    @GetMapping("/{roomId}/read-receipts")
    public ResponseEntity<ApiResponse<List<MessageRoomMember>>> getReadReceipts(@PathVariable String roomId) {
        var uuid = UUID.fromString(roomId);
        var members = messageRoomMemberRepository.findByMessageRoomId(uuid);
        return ResponseEntity.ok(ApiResponse.success("Trạng thái đọc theo thành viên", members));
    }

    @PostMapping("/{roomId}/pins")
    public ResponseEntity<ApiResponse<String>> pinMessage(
            @PathVariable String roomId,
            @RequestBody PinRequest body) {
        var me = userService.getCurrentUser();
        var uuid = UUID.fromString(roomId);
        messagePinService.pin(uuid, java.util.UUID.fromString(body.messageId), java.util.UUID.fromString(me.getId()));
        return ResponseEntity.ok(ApiResponse.success("Đã ghim tin nhắn", "OK"));
    }

    @GetMapping("/{roomId}/pins")
    public ResponseEntity<ApiResponse<java.util.List<MessageContentResponse>>> listPins(@PathVariable String roomId) {
        var uuid = UUID.fromString(roomId);
        var items = messagePinService.listPins(uuid);
        return ResponseEntity.ok(ApiResponse.success("Danh sách tin nhắn đã ghim", items));
    }

    @MessageMapping("/typing.{roomId}")
    public void typing(@DestinationVariable String roomId, TypingPayload payload) {
        // Broadcast to /topic/typing.{roomId}
        var out = new java.util.HashMap<String, Object>();
        out.put("userId", payload != null ? payload.userId : null);
        out.put("isTyping", payload != null && payload.isTyping);
        messagingTemplate.convertAndSend("/topic/typing." + roomId, out);
    }

    @PostMapping("/{roomId}/messages")
    public ResponseEntity<ApiResponse<MessageContentResponse>> sendMessageToRoom(
            @PathVariable String roomId,
            @Valid @RequestBody com.starwars.backend.entrypoint.dto.request.SendRoomMessageRequest request) {
        var uuid = UUID.fromString(roomId);
        var me = userService.getCurrentUser();
        var message = messageContentService.sendMessageToRoom(uuid, me.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Gửi tin nhắn thành công", message));
    }

    @GetMapping("/me/rooms")
    public ResponseEntity<ApiResponse<List<MessageRoomSummaryResponse>>> myRooms() {
        var me = userService.getCurrentUser();
        var myId = UUID.fromString(me.getId());

        var myMemberships = messageRoomMemberRepository.findByUserId(myId);
        var roomIds = myMemberships.stream().map(MessageRoomMember::getMessageRoomId).collect(Collectors.toSet());
        var rooms = messageRoomRepository.findAllById(roomIds);

        var summaries = rooms.stream().map(room -> {
            var lastMessageOpt = messageContentRepository
                    .findTopByRecivedMessageRoomIdOrderBySendedAtDesc(room.getId());

            MessageContentResponse lastMessage = lastMessageOpt.map(mc -> MessageContentResponse.builder()
                    .id(mc.getId().toString())
                    .content(mc.getContent())
                    .dateSent(mc.getSendedAt())
                    .messageType(mc.getMessageType())
                    .userId(mc.getSendUserId().toString())
                    .build()).orElse(null);

            int unread = 0;

            return MessageRoomSummaryResponse.builder()
                    .roomId(room.getId().toString())
                    .name(room.getName())
                    .createdAt(room.getCreatedAt())
                    .createdBy(room.getCreatedBy().toString())
                    .lastMessage(lastMessage)
                    .unreadCount(unread)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Danh sách phòng của tôi", summaries));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserResponse>>> search(
            @RequestParam("query") String query,
            @RequestParam(name = "page", defaultValue = "0") @Min(0) int page,
            @RequestParam(name = "limit", defaultValue = "20") @Min(1) int limit) {
        var exact = userRepository.findByEmailOrPhone(query).map(java.util.List::of).orElse(java.util.List.of());
        List<User> users;
        if (!exact.isEmpty()) {
            users = exact;
        } else {
            users = userRepository.findAll().stream()
                    .filter(u -> (u.getName() != null && u.getName().toLowerCase().contains(query.toLowerCase()))
                            || (u.getEmail() != null && u.getEmail().toLowerCase().contains(query.toLowerCase()))
                            || (u.getPhone() != null && u.getPhone().toLowerCase().contains(query.toLowerCase())))
                    .skip((long) page * limit)
                    .limit(limit)
                    .collect(Collectors.toList());
        }

        var result = users.stream().map(u -> UserResponse.builder()
                .id(u.getId().toString())
                .email(u.getEmail())
                .name(u.getName())
                .roles(u.getRoles().stream().map(r -> r.getName()).collect(Collectors.toSet()))
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Kết quả tìm kiếm người dùng", result));
    }

}