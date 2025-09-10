package com.starwars.backend.entrypoint.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserActivateRequest {
    @NotNull private String email;
    @NotNull private String key;
}
