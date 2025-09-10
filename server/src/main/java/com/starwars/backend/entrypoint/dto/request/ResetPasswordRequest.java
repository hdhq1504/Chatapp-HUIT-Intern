package com.starwars.backend.entrypoint.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResetPasswordRequest {
    @NotNull private String key;
    @NotNull private String email;

    @NotNull
    @Length(min = 8, max = 20)
    private String password;
}
