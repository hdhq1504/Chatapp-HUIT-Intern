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
public class MessageRoomService1 {

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
                    .name("Chat 1-1 với " + members.stream()
                            .filter(m -> !m.getId().toString().equals(creatorId))
                            .findFirst()
                            .map(User::getName)
                            .orElse("Người dùng"))
                    .createdAt(messageUser.getCreatedDate())
                    .createdBy(creatorId)
                    .isGroup(false)
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
                .name(room.getName())
                .createdAt(room.getCreatedAt())
                .createdBy(room.getCreatedBy().toString())
                .isGroup(members.size() > 2)
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

}