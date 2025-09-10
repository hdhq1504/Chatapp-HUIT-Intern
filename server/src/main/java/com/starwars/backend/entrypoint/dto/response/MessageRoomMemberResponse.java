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
public class MessageRoomMemberResponse {
    private String userId;
    private Boolean isAdmin;
    private LocalDateTime lastSeen;
}
