package com.starwars.backend.entrypoint.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageRoomResponse {
  private String name;
  private LocalDateTime createdAt;
  private String createdBy;
  private Boolean isGroup;
  private List<MessageRoomMemberResponse> members;
  private MessageContentResponse lastMessage;
}
