package com.starwars.backend.entrypoint.dto.request;

import com.starwars.backend.common.enums.MessageType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SendRoomMessageRequest {
    @NotBlank
    private String content;
    private MessageType messageType;
}
