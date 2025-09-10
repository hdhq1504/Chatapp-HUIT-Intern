package com.starwars.backend.entrypoint.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private String status;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>("200", message, data);
    }

    public static <T> ApiResponse<T> error(String status, String message) {
        return new ApiResponse<>(status, message, null);
    }
}
