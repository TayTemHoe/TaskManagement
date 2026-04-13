package org.example.tay.springbkafkamongodbdemo.infrastructure.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.tay.springbkafkamongodbdemo.domain.event.TaskCreatedEvent;
import org.example.tay.springbkafkamongodbdemo.domain.event.TaskDeletedEvent;
import org.example.tay.springbkafkamongodbdemo.domain.event.TaskUpdatedEvent;
import org.example.tay.springbkafkamongodbdemo.shared.dto.TaskEventDTO;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * INFRASTRUCTURE LAYER — Kafka Event Handler
 *
 * Listens to domain events published by TaskController via
 * ApplicationEventPublisher, then forwards them to Kafka.
 *
 * MENTOR'S EDA FLOW:
 *
 *   TaskController
 *       │ publishes TaskCreatedEvent (via ApplicationEventPublisher)
 *       ▼
 *   KafkaEventHandler  ← YOU ARE HERE
 *       │ converts domain event → TaskEventDTO
 *       │ calls KafkaProducerService
 *       ▼
 *   Kafka Topic: task-events
 *       ▼
 *   KafkaConsumerService (saves to MongoDB)
 *
 * KEY POINT: The full task payload is passed in the event
 * so the consumer has everything it needs to persist the task.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaEventHandler {

    private final KafkaProducerService kafkaProducerService;

    @Async
    @EventListener
    public void handleTaskCreated(TaskCreatedEvent event) {
        log.info("Handling TaskCreatedEvent for task: {}", event.getTaskId());
        kafkaProducerService.publishEvent(TaskEventDTO.builder()
                .eventType("TASK_CREATED")
                .taskId(event.getTaskId())
                .title(event.getTitle())
                .description(event.getDescription())
                .status(event.getStatus())
                .priority(event.getPriority())
                .dueDate(event.getDueDate())
                .timestamp(LocalDateTime.now())
                .build());
    }

    @Async
    @EventListener
    public void handleTaskUpdated(TaskUpdatedEvent event) {
        log.info("Handling TaskUpdatedEvent for task: {}", event.getTaskId());
        kafkaProducerService.publishEvent(TaskEventDTO.builder()
                .eventType("TASK_UPDATED")
                .taskId(event.getTaskId())
                .title(event.getTitle())
                .description(event.getDescription())
                .status(event.getStatus())
                .priority(event.getPriority())
                .dueDate(event.getDueDate())
                .timestamp(LocalDateTime.now())
                .build());
    }

    @Async
    @EventListener
    public void handleTaskDeleted(TaskDeletedEvent event) {
        log.info("Handling TaskDeletedEvent for task: {}", event.getTaskId());
        kafkaProducerService.publishEvent(TaskEventDTO.builder()
                .eventType("TASK_DELETED")
                .taskId(event.getTaskId())
                .title(event.getTitle())
                .timestamp(LocalDateTime.now())
                .build());
    }
}
