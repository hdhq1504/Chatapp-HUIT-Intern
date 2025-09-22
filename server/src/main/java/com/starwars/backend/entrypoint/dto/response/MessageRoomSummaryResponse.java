package com.starwars.backend.entrypoint.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageRoomSummaryResponse {
    private String roomId;
    private String name;
    private LocalDateTime createdAt;
    private String createdBy;
    private MessageContentResponse lastMessage;
    private Integer unreadCount;
}
