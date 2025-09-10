package com.starwars.backend.configuration.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        logger.info("=== WEBSOCKET CONNECTED ===");
        logger.info("Session ID: {}", event.getMessage().getHeaders().get("simpSessionId"));
        logger.info("Event: {}", event);

    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        logger.info("=== WEBSOCKET DISCONNECTED ===");
        logger.info("Session ID: {}", event.getSessionId());
    }

    @EventListener
    public void handleWebSocketSubscribeListener(SessionSubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        logger.info("=== WEBSOCKET SUBSCRIBE ===");
        logger.info("Destination: {}", headerAccessor.getDestination());
        logger.info("Session ID: {}", headerAccessor.getSessionId());
    }

}