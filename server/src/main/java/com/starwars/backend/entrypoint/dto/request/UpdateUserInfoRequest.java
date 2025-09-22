package com.starwars.backend.entrypoint.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.starwars.backend.common.PatternConstants;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserInfoRequest {

    private String name;

    @Email(message = "Email format is invalid")
    private String email;

    @Pattern(regexp = PatternConstants.PHONE_REGEX, message = "Phone format is invalid")
    private String phone;

    private String avatar;
}