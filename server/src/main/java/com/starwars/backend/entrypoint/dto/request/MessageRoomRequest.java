package com.starwars.backend.entrypoint.dto.request;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageRoomRequest {
    private String name;
    private LocalDateTime createdAt;
    private UUID createdBy;
}