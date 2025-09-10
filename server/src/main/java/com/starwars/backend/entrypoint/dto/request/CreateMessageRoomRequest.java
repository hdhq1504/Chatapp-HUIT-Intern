package com.starwars.backend.entrypoint.dto.request;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateMessageRoomRequest {
    @NotEmpty(message = "Member IDs cannot be empty")
    private List<String> members;
}
