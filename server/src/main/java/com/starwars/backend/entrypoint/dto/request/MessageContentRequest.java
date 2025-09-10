package com.starwars.backend.entrypoint.dto.request;

import java.util.UUID;

import com.starwars.backend.common.enums.MessageType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageContentRequest {
    private String content;
    private MessageType messageType;
    private UUID recivedMessageRoomId;
    private UUID recivedMessageUserId;
    private UUID sendUserId;
}
