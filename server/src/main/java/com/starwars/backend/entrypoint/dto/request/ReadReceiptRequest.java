package com.starwars.backend.entrypoint.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReadReceiptRequest {
  public String messageId; // optional
  public String timestamp; // ISO-8601 optional
}
