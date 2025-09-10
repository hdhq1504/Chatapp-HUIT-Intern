package com.starwars.backend.entrypoint.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangePassRequest {
    @NotNull private String currentPassword;
    @NotNull private String newPassword;
    @NotNull private String confirmationPassword;
}
