package com.starwars.backend.entrypoint.dto.response;

import java.time.LocalDateTime;

import com.starwars.backend.common.enums.MessageType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageContentResponse {
    private String id;
    private String content;
    private LocalDateTime dateSent;
    private MessageType messageType;
    private String userId;
    private String userName;
    private String userAvatar;
    private Boolean edited;
    private Boolean deleted;
}
