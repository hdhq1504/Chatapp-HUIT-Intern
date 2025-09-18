package com.starwars.backend.entrypoint.rest;

import com.starwars.backend.core.domain.MessageRoomMember;
import com.starwars.backend.core.domain.User;
import com.starwars.backend.core.usecase.MessageContentService;
import com.starwars.backend.core.usecase.MessageRoomService;
import com.starwars.backend.core.usecase.UserService;
import com.starwars.backend.dataprovider.repository.MessageContentRepository;
import com.starwars.backend.dataprovider.repository.MessageRoomMemberRepository;
import com.starwars.backend.dataprovider.repository.MessageRoomRepository;
import com.starwars.backend.dataprovider.repository.UserRepository;
import com.starwars.backend.entrypoint.dto.request.AddMembersRequest;
import com.starwars.backend.entrypoint.dto.request.CreateMessageRoomRequest;
import com.starwars.backend.entrypoint.dto.request.UpdateRoomRequest;
import com.starwars.backend.entrypoint.dto.response.ApiResponse;
import com.starwars.backend.entrypoint.dto.response.MessageContentResponse;
import com.starwars.backend.entrypoint.dto.response.MessageRoomResponse;
import com.starwars.backend.entrypoint.dto.response.MessageRoomSummaryResponse;
import com.starwars.backend.entrypoint.dto.response.UserResponse;

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
    private final UserRepository userRepository;
    private final MessageRoomRepository messageRoomRepository;
    private final MessageRoomMemberRepository messageRoomMemberRepository;
    private final MessageContentRepository messageContentRepository;

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
        var room = messageRoomService.findMessageRoomAtLeastOneContent(uuid)
                .stream().findFirst().orElse(null);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật tạm thời (chưa thực thi)", room));
    }

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

    @PostMapping("/{roomId}/members")
    public ResponseEntity<ApiResponse<MessageRoomResponse>> addMembers(@PathVariable String roomId,
            @Valid @RequestBody AddMembersRequest request) {
        var uuid = UUID.fromString(roomId);
        var me = userService.getCurrentUser();
        var updated = messageRoomService.addMembers(uuid, request.getUserIds(), me.getId());
        return ResponseEntity.ok(ApiResponse.success("Thêm thành viên thành công", updated));
    }

    @DeleteMapping("/{roomId}/members/{userId}")
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

    @GetMapping("/me/rooms")
    public ResponseEntity<ApiResponse<List<MessageRoomSummaryResponse>>> myRooms() {
        var me = userService.getCurrentUser();
        var myId = UUID.fromString(me.getId());

        var myMemberships = messageRoomMemberRepository.findByUserId(myId);
        var roomIds = myMemberships.stream().map(MessageRoomMember::getMessageRoomId).collect(Collectors.toSet());
        var rooms = messageRoomRepository.findAllById(roomIds);

        var summaries = rooms.stream().map(room -> {
            var members = messageRoomMemberRepository.findByMessageRoomId(room.getId());
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
                    .isGroup(members.size() > 2)
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