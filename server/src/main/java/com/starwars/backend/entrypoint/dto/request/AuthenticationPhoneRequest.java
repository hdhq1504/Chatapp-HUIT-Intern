package com.starwars.backend.entrypoint.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

import com.starwars.backend.common.PatternConstants;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationPhoneRequest {
    @NotNull
    @Pattern(regexp = PatternConstants.PHONE_REGEX)
    private String phone;

    @NotNull
    @Length(min = 8, max = 20)
    private String password;
}
