package com.starwars.backend.entrypoint.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.validator.constraints.Length;

import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    private String name;

    @NotNull private String phone;

    @NotNull @Email private String email;

    @NotNull
    @Length(min = 8, max = 20)
    private String password;

    private Set<String> roles;
}
