// ...existing code...
package com.starwars.backend.core.usecase;

import com.starwars.backend.core.domain.MessageUser;
import com.starwars.backend.dataprovider.repository.MessageUserRepository;
import com.starwars.backend.entrypoint.dto.response.MessageUserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageUserService {

    private final MessageUserRepository messageUserRepository;

    public List<MessageUserResponse> findMessageUserAtLeastOneContent(final UUID userId) {
        return messageUserRepository.findMessageUserAtLeastOneContent(userId)
                .stream()
                .map(this::mapToMessageUserResponse)
                .collect(Collectors.toList());
    }

    private MessageUserResponse mapToMessageUserResponse(MessageUser messageUser) {
        return MessageUserResponse.builder()
                .userId1(messageUser.getUserId1())
                .userId2(messageUser.getUserId2())
                .createdDate(messageUser.getCreatedDate())
                .build();
    }

}