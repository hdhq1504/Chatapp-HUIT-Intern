package com.starwars.backend.entrypoint.dto.response;

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
public class MessageUserResponse {
    private UUID userId1;
    private UUID userId2;
    private LocalDateTime createdDate;
}
