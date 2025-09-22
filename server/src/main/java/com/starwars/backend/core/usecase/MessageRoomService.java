package com.starwars.backend.core.usecase;

import com.starwars.backend.common.enums.MessageType;
import com.starwars.backend.core.domain.MessageContent;
import com.starwars.backend.core.domain.MessageRoom;
import com.starwars.backend.core.domain.MessageRoomMember;
import com.starwars.backend.core.domain.MessageUser;
import com.starwars.backend.core.domain.User;
import com.starwars.backend.dataprovider.repository.MessageContentRepository;
import com.starwars.backend.dataprovider.repository.MessageRoomMemberRepository;
import com.starwars.backend.dataprovider.repository.MessageRoomRepository;
import com.starwars.backend.dataprovider.repository.MessageUserRepository;
import com.starwars.backend.dataprovider.repository.UserRepository;
import com.starwars.backend.entrypoint.dto.request.UpdateRoomRequest;
import com.starwars.backend.entrypoint.dto.response.MessageContentResponse;
import com.starwars.backend.entrypoint.dto.response.MessageRoomMemberResponse;
import com.starwars.backend.entrypoint.dto.response.MessageRoomResponse;
import com.starwars.commonmessage.common.CustomExceptionHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageRoomService {

        private final MessageRoomRepository messageRoomRepository;
        private final MessageRoomMemberRepository messageRoomMemberRepository;
        private final MessageContentRepository messageContentRepository;
        private final MessageUserRepository messageUserRepository;
        private final UserRepository userRepository;
        private final CustomExceptionHandler exceptionHandler;
        private final SimpMessagingTemplate messagingTemplate;

        @Transactional
        public MessageRoomResponse createMessageRoom(final List<String> memberIds, final String creatorId) {
                if (memberIds == null || memberIds.isEmpty()) {
                        throw exceptionHandler.invalidRequest("Danh sách thành viên không được rỗng");
                }

                if (!memberIds.contains(creatorId)) {
                        memberIds.add(creatorId);
                }

                List<User> members = memberIds.stream()
                                .map(id -> userRepository.findById(UUID.fromString(id))
                                                .orElseThrow(() -> exceptionHandler
                                                                .notFoundException("Không tìm thấy người dùng: " + id)))
                                .collect(Collectors.toList());

                if (members.size() == 2) {
                        UUID recipientId = members.stream()
                                        .map(User::getId)
                                        .filter(id -> !id.toString().equals(creatorId))
                                        .findFirst()
                                        .orElseThrow(() -> exceptionHandler
                                                        .invalidRequest("Không tìm thấy người nhận trong danh sách"));

                        Optional<MessageUser> existingMessageUser = messageUserRepository
                                        .findByUserIds(UUID.fromString(creatorId), recipientId);

                        MessageUser messageUser;
                        if (existingMessageUser.isPresent()) {
                                messageUser = existingMessageUser.get();
                        } else {
                                messageUser = MessageUser.builder()
                                                .userId1(UUID.fromString(creatorId))
                                                .userId2(recipientId)
                                                .createdDate(LocalDateTime.now())
                                                .build();
                                messageUser = messageUserRepository.save(messageUser);
                        }

                        MessageContent messageContent = MessageContent.builder()
                                        .content("Cuộc trò chuyện 1-1 đã được tạo")
                                        .sendedAt(LocalDateTime.now())
                                        .messageType(MessageType.TEXT)
                                        .recivedMessageRoomId(null)
                                        .recivedMessageUserId(recipientId)
                                        .sendUserId(UUID.fromString(creatorId))
                                        .build();
                        messageContent = messageContentRepository.save(messageContent);

                        MessageRoomResponse response = MessageRoomResponse.builder()
                                        .id(messageUser.getId() != null ? messageUser.getId().toString() : null)
                                        .name("Chat 1-1 với " + members.stream()
                                                        .filter(m -> !m.getId().toString().equals(creatorId))
                                                        .findFirst()
                                                        .map(User::getName)
                                                        .orElse("Người dùng"))
                                        .createdAt(messageUser.getCreatedDate())
                                        .createdBy(creatorId)
                                        .members(members.stream()
                                                        .map(member -> MessageRoomMemberResponse.builder()
                                                                        .userId(member.getId().toString())
                                                                        .isAdmin(member.getId().toString()
                                                                                        .equals(creatorId))
                                                                        .lastSeen(LocalDateTime.now())
                                                                        .build())
                                                        .collect(Collectors.toList()))
                                        .lastMessage(MessageContentResponse.builder()
                                                        .id(messageContent.getId().toString())
                                                        .content(messageContent.getContent())
                                                        .dateSent(messageContent.getSendedAt())
                                                        .messageType(messageContent.getMessageType())
                                                        .userId(messageContent.getSendUserId().toString())
                                                        .build())
                                        .build();

                        messagingTemplate.convertAndSend("/topic/user/" + recipientId, response);

                        return response;
                }

                MessageRoom messageRoom = MessageRoom.builder()
                                .name("Room_" + UUID.randomUUID().toString().substring(0, 8))
                                .createdAt(LocalDateTime.now())
                                .createdBy(UUID.fromString(creatorId))
                                .build();
                messageRoom = messageRoomRepository.save(messageRoom);

                for (User member : members) {
                        MessageRoomMember roomMember = MessageRoomMember.builder()
                                        .userId(member.getId())
                                        .messageRoomId(messageRoom.getId())
                                        .isAdmin(member.getId().toString().equals(creatorId))
                                        .joinedAt(LocalDateTime.now())
                                        .build();
                        messageRoomMemberRepository.save(roomMember);
                }

                MessageContent messageContent = MessageContent.builder()
                                .content("Phòng chat nhóm đã được tạo")
                                .sendedAt(LocalDateTime.now())
                                .messageType(MessageType.TEXT)
                                .recivedMessageRoomId(messageRoom.getId())
                                .recivedMessageUserId(null)
                                .sendUserId(UUID.fromString(creatorId))
                                .build();
                messageContent = messageContentRepository.save(messageContent);

                MessageRoomResponse response = mapToMessageRoomResponse(messageRoom);

                messagingTemplate.convertAndSend("/topic/room-created", response);

                return response;
        }

        private MessageRoomResponse mapToMessageRoomResponse(MessageRoom room) {
                List<MessageRoomMember> members = messageRoomMemberRepository.findByMessageRoomId(room.getId());
                Optional<MessageContent> lastMessageOpt = messageContentRepository
                                .findTopByRecivedMessageRoomIdOrderBySendedAtDesc(room.getId());

                return MessageRoomResponse.builder()
                                .id(room.getId().toString())
                                .name(room.getName())
                                .createdAt(room.getCreatedAt())
                                .createdBy(room.getCreatedBy().toString())
                                .members(members.stream()
                                                .map(member -> MessageRoomMemberResponse.builder()
                                                                .userId(member.getUserId().toString())
                                                                .isAdmin(member.getIsAdmin())
                                                                .lastSeen(member.getLastSeen())
                                                                .build())
                                                .collect(Collectors.toList()))
                                .lastMessage(lastMessageOpt.map(lastMessage -> MessageContentResponse.builder()
                                                .id(lastMessage.getId().toString())
                                                .content(lastMessage.getContent())
                                                .dateSent(lastMessage.getSendedAt())
                                                .messageType(lastMessage.getMessageType())
                                                .userId(lastMessage.getSendUserId().toString())
                                                .build()).orElse(null))
                                .build();
        }

        @Transactional(readOnly = true)
        public MessageRoomResponse getRoomById(final UUID roomId) {
                MessageRoom room = messageRoomRepository.findById(roomId)
                                .orElseThrow(() -> exceptionHandler.notFoundException(
                                                "Không tìm thấy phòng với id: " + roomId));
                return mapToMessageRoomResponse(room);
        }

        @Transactional
        public MessageRoomResponse updateRoom(final UUID roomId, final String performedBy,
                        final UpdateRoomRequest request) {
                MessageRoom room = messageRoomRepository.findById(roomId)
                                .orElseThrow(() -> exceptionHandler.notFoundException(
                                                "Không tìm thấy phòng với id: " + roomId));

                UUID performer = UUID.fromString(performedBy);
                boolean isMember = messageRoomMemberRepository.existsByMessageRoomIdAndUserId(roomId, performer);
                if (!isMember) {
                        throw exceptionHandler.invalidRequest("Bạn không thuộc phòng này");
                }

                boolean isCreator = room.getCreatedBy() != null && room.getCreatedBy().equals(performer);
                boolean isAdmin = messageRoomMemberRepository.findByMessageRoomId(roomId).stream()
                                .anyMatch(m -> m.getUserId().equals(performer) && Boolean.TRUE.equals(m.getIsAdmin()));
                if (!isCreator && !isAdmin) {
                        throw exceptionHandler
                                        .invalidRequest("Chỉ quản trị viên hoặc người tạo phòng mới được cập nhật");
                }

                boolean changed = false;
                if (request.getName() != null && !request.getName().isBlank()) {
                        room.setName(request.getName());
                        changed = true;
                }
                if (request.getImage() != null) {
                        room.setImage(request.getImage());
                        changed = true;
                }
                if (request.getDescription() != null) {
                        room.setDescription(request.getDescription());
                        changed = true;
                }

                if (changed) {
                        room = messageRoomRepository.save(room);
                }
                return mapToMessageRoomResponse(room);
        }

        public List<MessageRoomResponse> findMessageRoomAtLeastOneContent(final UUID userId) {
                return messageRoomRepository.findMessageRoomAtLeastOneContent(userId)
                                .stream()
                                .map(this::mapToMessageRoomResponse)
                                .collect(Collectors.toList());
        }

        @Transactional
        public MessageRoomResponse addMembers(final UUID roomId, final List<String> userIds, final String performedBy) {
                if (userIds == null || userIds.isEmpty()) {
                        throw exceptionHandler.invalidRequest("Danh sách thành viên không được rỗng");
                }

                MessageRoom room = messageRoomRepository.findById(roomId)
                                .orElseThrow(() -> exceptionHandler.notFoundException(
                                                "Không tìm thấy phòng với id: " + roomId));

                UUID performerId = UUID.fromString(performedBy);
                boolean isMember = messageRoomMemberRepository.existsByMessageRoomIdAndUserId(roomId, performerId);
                if (!isMember) {
                        throw exceptionHandler.invalidRequest("Bạn không thuộc phòng này");
                }

                List<UUID> newMemberIds = userIds.stream().map(UUID::fromString).toList();
                var users = userRepository.findAllById(newMemberIds);
                if (users.isEmpty()) {
                        throw exceptionHandler.invalidRequest("Không tìm thấy người dùng để thêm");
                }

                for (var user : users) {
                        boolean alreadyMember = messageRoomMemberRepository
                                        .existsByMessageRoomIdAndUserId(roomId, user.getId());
                        if (alreadyMember) {
                                continue;
                        }
                        MessageRoomMember roomMember = MessageRoomMember.builder()
                                        .userId(user.getId())
                                        .messageRoomId(room.getId())
                                        .isAdmin(false)
                                        .joinedAt(LocalDateTime.now())
                                        .build();
                        messageRoomMemberRepository.save(roomMember);
                }

                return mapToMessageRoomResponse(room);
        }

        @Transactional
        public MessageRoomResponse removeMember(final UUID roomId, final UUID targetUserId, final UUID performedBy) {
                MessageRoom room = messageRoomRepository.findById(roomId)
                                .orElseThrow(() -> exceptionHandler.notFoundException(
                                                "Không tìm thấy phòng với id: " + roomId));

                boolean performerIsMember = messageRoomMemberRepository.existsByMessageRoomIdAndUserId(roomId,
                                performedBy);
                if (!performerIsMember) {
                        throw exceptionHandler.invalidRequest("Bạn không thuộc phòng này");
                }

                if (!performedBy.equals(targetUserId)) {
                        boolean isAdmin = messageRoomMemberRepository.findByMessageRoomId(roomId).stream()
                                        .anyMatch(m -> m.getUserId().equals(performedBy)
                                                        && Boolean.TRUE.equals(m.getIsAdmin()));
                        boolean isCreator = room.getCreatedBy() != null && room.getCreatedBy().equals(performedBy);
                        if (!isAdmin && !isCreator) {
                                throw exceptionHandler.invalidRequest(
                                                "Chỉ quản trị viên hoặc người tạo phòng mới được xóa thành viên khác");
                        }
                }

                boolean targetIsMember = messageRoomMemberRepository.existsByMessageRoomIdAndUserId(roomId,
                                targetUserId);
                if (!targetIsMember) {
                        throw exceptionHandler.invalidRequest("Thành viên cần xóa không thuộc phòng này");
                }

                messageRoomMemberRepository.deleteByMessageRoomIdAndUserId(roomId, targetUserId);
                return mapToMessageRoomResponse(room);
        }

        @Transactional
        public MessageRoomResponse leaveRoom(final UUID roomId, final UUID userId) {
                // Self-removal
                return removeMember(roomId, userId, userId);
        }

        @Transactional
        public MessageRoomResponse addAdmin(final UUID roomId, final UUID targetUserId, final UUID performedBy) {
                MessageRoom room = messageRoomRepository.findById(roomId)
                                .orElseThrow(() -> exceptionHandler.notFoundException(
                                                "Không tìm thấy phòng với id: " + roomId));
                boolean performerIsMember = messageRoomMemberRepository.existsByMessageRoomIdAndUserId(roomId,
                                performedBy);
                if (!performerIsMember) {
                        throw exceptionHandler.invalidRequest("Bạn không thuộc phòng này");
                }
                boolean isCreator = room.getCreatedBy() != null && room.getCreatedBy().equals(performedBy);
                boolean isAdmin = messageRoomMemberRepository.findByMessageRoomId(roomId).stream()
                                .anyMatch(m -> m.getUserId().equals(performedBy)
                                                && Boolean.TRUE.equals(m.getIsAdmin()));
                if (!isCreator && !isAdmin) {
                        throw exceptionHandler
                                        .invalidRequest("Chỉ quản trị viên hoặc người tạo phòng mới được thêm admin");
                }

                var members = messageRoomMemberRepository.findByMessageRoomId(roomId);
                members.stream().filter(m -> m.getUserId().equals(targetUserId)).findFirst().ifPresent(m -> {
                        m.setIsAdmin(true);
                        messageRoomMemberRepository.save(m);
                });
                return mapToMessageRoomResponse(room);
        }

        @Transactional
        public MessageRoomResponse removeAdmin(final UUID roomId, final UUID targetUserId, final UUID performedBy) {
                MessageRoom room = messageRoomRepository.findById(roomId)
                                .orElseThrow(() -> exceptionHandler.notFoundException(
                                                "Không tìm thấy phòng với id: " + roomId));
                boolean performerIsMember = messageRoomMemberRepository.existsByMessageRoomIdAndUserId(roomId,
                                performedBy);
                if (!performerIsMember) {
                        throw exceptionHandler.invalidRequest("Bạn không thuộc phòng này");
                }
                boolean isCreator = room.getCreatedBy() != null && room.getCreatedBy().equals(performedBy);
                if (!isCreator) {
                        throw exceptionHandler.invalidRequest("Chỉ người tạo phòng mới được gỡ admin");
                }
                var members = messageRoomMemberRepository.findByMessageRoomId(roomId);
                members.stream().filter(m -> m.getUserId().equals(targetUserId)).findFirst().ifPresent(m -> {
                        m.setIsAdmin(false);
                        messageRoomMemberRepository.save(m);
                });
                return mapToMessageRoomResponse(room);
        }

        @Transactional
        public void deleteRoom(final UUID roomId, final UUID performedBy) {
                MessageRoom room = messageRoomRepository.findById(roomId)
                                .orElseThrow(() -> exceptionHandler.notFoundException(
                                                "Không tìm thấy phòng với id: " + roomId));
                boolean isCreator = room.getCreatedBy() != null && room.getCreatedBy().equals(performedBy);
                if (!isCreator) {
                        throw exceptionHandler.invalidRequest("Chỉ người tạo phòng mới được xóa phòng");
                }
                // delete members and messages then room
                var members = messageRoomMemberRepository.findByMessageRoomId(roomId);
                messageRoomMemberRepository.deleteAll(members);
                var messages = messageContentRepository.findByRecivedMessageRoomIdOrderBySendedAt(roomId);
                messageContentRepository.deleteAll(messages);
                messageRoomRepository.delete(room);
        }

}