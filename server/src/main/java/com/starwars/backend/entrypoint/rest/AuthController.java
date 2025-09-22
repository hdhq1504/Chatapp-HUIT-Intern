package com.starwars.backend.entrypoint.rest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.starwars.backend.core.usecase.AuthenticationService;
import com.starwars.backend.core.usecase.LogoutUseCase;
import com.starwars.backend.core.usecase.UserService;
import com.starwars.backend.entrypoint.dto.Status;
import com.starwars.backend.entrypoint.dto.request.AuthenticationPhoneRequest;
import com.starwars.backend.entrypoint.dto.request.AuthenticationRequest;
import com.starwars.backend.entrypoint.dto.request.GetKeyRequest;
import com.starwars.backend.entrypoint.dto.request.InitPasswordRequest;
import com.starwars.backend.entrypoint.dto.request.RegisterRequest;
import com.starwars.backend.entrypoint.dto.request.ResetPasswordRequest;
import com.starwars.backend.entrypoint.dto.request.UserActivateRequest;
import com.starwars.backend.entrypoint.dto.response.ActivedResponse;
import com.starwars.backend.entrypoint.dto.response.ApiResponse;
import com.starwars.backend.entrypoint.dto.response.AuthenticationResponse;
import com.starwars.backend.entrypoint.dto.response.CompletedResponse;

@RestController
@RequestMapping(path = "api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authService;
    private final LogoutUseCase logoutUseCase;
    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Successfully", "Đăng ký thành công!"));
    }

    @PostMapping("/signin")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> login(
            @RequestBody @Valid AuthenticationRequest request) {
        AuthenticationResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Successfully", response));
    }

    @PostMapping("/signout")
    public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            userService.disconnectCurrentUser();
        } catch (Exception ignored) {
        }
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        logoutUseCase.logout(request, response, authentication);
        return ResponseEntity.ok(ApiResponse.success("Logout successful", "OK"));
    }

    @PostMapping("/activate")
    public ResponseEntity<ApiResponse<ActivedResponse>> activateUser(
            @Valid @RequestBody UserActivateRequest request) {
        ActivedResponse response = authService.activateUser(request);
        return ResponseEntity.ok(ApiResponse.success("Successfully", response));
    }

    @PostMapping("/init-password")
    public ResponseEntity<ApiResponse<CompletedResponse>> initPassword(
            @Valid @RequestBody InitPasswordRequest request) {
        authService.initPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Successfully",
                CompletedResponse.builder().status(Status.SUCCESS).build()));
    }

    @PostMapping("/send-key")
    public ResponseEntity<ApiResponse<String>> sendKey(@Valid @RequestBody GetKeyRequest request) {
        String result = authService.sendKey(request.getEmail());
        if (result.length() == 4 && result.matches("[A-Z0-9]+")) {
            return ResponseEntity.ok(ApiResponse.success("Gửi key thành công", result));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("400", result));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String result = authService.resetPassword(request);

        if ("Successfully".equals(result)) {
            return ResponseEntity.ok(ApiResponse.success("Successfully", null));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("400", result));
        }
    }

    @PostMapping("/signin/phone")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> loginPhone(
            @RequestBody @Valid AuthenticationPhoneRequest request) {
        AuthenticationResponse response = authService.loginPhone(request);
        return ResponseEntity.ok(ApiResponse.success("Successfully", response));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> refreshToken(HttpServletRequest request) {
        AuthenticationResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Refresh token successful", response));
    }

    @PostMapping("/set-password-user")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @RequestParam String email,
            @RequestParam String newPassword) {
        authService.resetPasswordByAdmin(email, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Successfully", null));
    }

}
