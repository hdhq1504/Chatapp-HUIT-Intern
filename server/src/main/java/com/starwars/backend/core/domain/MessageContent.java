package com.starwars.backend.core.domain;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;

import com.starwars.backend.common.enums.MessageType;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "message_content")
public class MessageContent {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    private UUID id;

    @NotNull
    private String content;

    @CreatedDate
    private LocalDateTime sendedAt;

    @Enumerated(EnumType.STRING)
    private MessageType messageType;

    private UUID recivedMessageRoomId;
    private UUID recivedMessageUserId;

    @NotNull
    private UUID sendUserId;

    private Boolean edited;
    private Boolean deleted;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
