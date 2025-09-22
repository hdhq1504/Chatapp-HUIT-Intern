package com.starwars.backend.core.usecase;

import com.starwars.backend.core.domain.MessagePin;
import com.starwars.backend.dataprovider.repository.MessagePinRepository;
import com.starwars.backend.dataprovider.repository.MessageContentRepository;
import com.starwars.backend.entrypoint.dto.response.MessageContentResponse;
import com.starwars.commonmessage.common.CustomExceptionHandler;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessagePinService {
    private final MessagePinRepository pinRepository;
    private final MessageContentRepository messageContentRepository;
    private final ModelMapper modelMapper;
    private final CustomExceptionHandler exceptionHandler;

    @Transactional
    public void pin(UUID roomId, UUID messageId, UUID userId) {
        messageContentRepository.findById(messageId)
                .orElseThrow(() -> exceptionHandler.notFoundException("Không tìm thấy tin nhắn"));
        var pin = MessagePin.builder()
                .roomId(roomId)
                .messageId(messageId)
                .pinnedBy(userId)
                .createdAt(LocalDateTime.now())
                .build();
        pinRepository.save(pin);
    }

    @Transactional
    public void unpin(UUID roomId, UUID messageId) {
        pinRepository.deleteByRoomIdAndMessageId(roomId, messageId);
    }

    @Transactional(readOnly = true)
    public List<MessageContentResponse> listPins(UUID roomId) {
        var pins = pinRepository.findByRoomId(roomId);
        var ids = pins.stream().map(MessagePin::getMessageId).collect(Collectors.toList());
        return messageContentRepository.findAllById(ids).stream().map(mc -> {
            var resp = modelMapper.map(mc, MessageContentResponse.class);
            resp.setId(mc.getId().toString());
            resp.setUserId(mc.getSendUserId().toString());
            resp.setDateSent(mc.getSendedAt());
            resp.setEdited(mc.getEdited());
            resp.setDeleted(mc.getDeleted());
            return resp;
        }).collect(Collectors.toList());
    }
}
