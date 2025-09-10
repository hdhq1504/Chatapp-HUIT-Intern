package com.starwars.backend.entrypoint.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GetKeyRequest {

    @NotNull
    private String email;
}
