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

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "api/v1/users")
public class UserController {

	private final ChangePassUseCase changePassUseCase;
	private final UserService userService;

	@MessageMapping("/user/connect") // Receive message from clients sending to /app/user/connect
	@SendTo("/topic/online") // send the response to all clients subscribe to /topic/online
	public ResponseEntity<ApiResponse<UserResponse>> connect(@RequestBody UserRequest request) {
		UserResponse user = userService.connectCurrentUser();
		return ResponseEntity.ok(ApiResponse.success("Kết nối thành công", user));
	}

	@MessageMapping("/user/disconnect") // Receive message from clients sending to /app/user/disconnect
	@SendTo("/topic/offline") // send the response to all clients subscribe to /topic/offline
	public ResponseEntity<ApiResponse<UserResponse>> disconnect(@RequestBody UserRequest request) {
		UserResponse user = userService.disconnectCurrentUser();
		return ResponseEntity.ok(ApiResponse.success("Ngắt kết nối thành công", user));
	}

	@PostMapping("/change-password")
	public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePassRequest request) {
		changePassUseCase.changePassword(request);
		return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
	}

	@GetMapping("/profile")
	public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
		UserResponse user = userService.getCurrentUser();
		return ResponseEntity.ok(ApiResponse.success("Lấy thông tin user thành công", user));
	}

	@GetMapping("/all-user-online")
	public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersOnline() {
		List<UserResponse> users = userService.getUsersOnline();
		return ResponseEntity.ok(ApiResponse.success("Lấy danh sách user online thành công", users));
	}

}
