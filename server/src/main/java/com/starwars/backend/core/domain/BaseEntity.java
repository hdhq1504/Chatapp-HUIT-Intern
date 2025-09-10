package com.starwars.backend.core.domain;

import jakarta.persistence.Column;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

public class BaseEntity implements Serializable {

    @Serial private static final long serialVersionUID = -6200598865028967314L;

    @CreationTimestamp
    @Column(name = "created", nullable = false)
    private LocalDateTime created;

    @UpdateTimestamp
    @Column(name = "updated", nullable = false)
    private LocalDateTime updated;
}
