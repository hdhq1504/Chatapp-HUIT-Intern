package com.starwars.backend.entrypoint.rest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import com.starwars.backend.core.usecase.ChangePassUseCase;
import com.starwars.backend.core.usecase.UserService;
import com.starwars.backend.entrypoint.dto.request.ChangePassRequest;
import com.starwars.backend.entrypoint.dto.request.UserRequest;
import com.starwars.backend.entrypoint.dto.response.ApiResponse;
import com.starwars.backend.entrypoint.dto.response.UserResponse;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "api/v1/users")
public class UserController {

	private final ChangePassUseCase changePassUseCase;
	private final UserService userService;

	@PostMapping("/change-password")
	public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePassRequest request) {
		changePassUseCase.changePassword(request);
		return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
	}

	@GetMapping
	public ResponseEntity<ApiResponse<UserResponse>> getUser() {
		UserResponse user = userService.getCurrentUser();
		return ResponseEntity.ok(ApiResponse.success("Lấy thông tin user thành công", user));
	}

	@GetMapping("/all-user-online")
	public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersOnline() {
		List<UserResponse> users = userService.getUsersOnline();
		return ResponseEntity.ok(ApiResponse.success("Lấy danh sách user online thành công", users));
	}

	// WebSocket API cho connect/disconnect
	@MessageMapping("/user/connect") // Receive message from clients sending to /app/user/connect
	@SendTo("/topic/online") // send the response to all clients subscribe to /topic/user-status
	public UserResponse connect(@RequestBody UserRequest request) {
		UserResponse user = userService.connectCurrentUser();
		return user;
	}

	@MessageMapping("/user/disconnect")
	@SendTo("/topic/offline")
	public UserResponse disconnect(@RequestBody UserRequest request) {
		UserResponse user = userService.disconnectCurrentUser();
		return user;
	}

	// REST API cho connect/disconnect (backup)
	@PostMapping("/connect")
	public ResponseEntity<ApiResponse<UserResponse>> connectRest(@RequestBody UserRequest request) {
		UserResponse user = userService.connectCurrentUser();
		return ResponseEntity.ok(ApiResponse.success("User đã online", user));
	}

	@PostMapping("/disconnect")
	public ResponseEntity<ApiResponse<UserResponse>> disconnectRest(@RequestBody UserRequest request) {
		UserResponse user = userService.disconnectCurrentUser();
		return ResponseEntity.ok(ApiResponse.success("User đã offline", user));
	}

}
