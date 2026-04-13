package org.example.tay.springbkafkamongodbdemo.domain.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * DOMAIN LAYER — Domain Event for Task Deletion
 * Only taskId and title needed — deletion only requires the ID.
 */
@Getter
@AllArgsConstructor
public class TaskDeletedEvent {
    private final String taskId;
    private final String title;
    private final LocalDateTime occurredAt;
}
