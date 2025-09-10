package com.starwars.backend.entrypoint.dto.response;

import com.starwars.backend.entrypoint.dto.Status;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompletedResponse {
    private Status status;
}


