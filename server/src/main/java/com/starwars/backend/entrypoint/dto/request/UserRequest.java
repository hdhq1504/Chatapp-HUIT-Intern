package com.starwars.backend.entrypoint.dto.request;

import com.starwars.backend.common.enums.UserStatus;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserRequest {
    private String email;
    @Enumerated(EnumType.STRING)
    private UserStatus status;
}
