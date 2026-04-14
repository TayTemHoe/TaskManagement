package org.example.tay.taskmanagmentkafkareact.infrastructure.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.tay.taskmanagmentkafkareact.domain.event.TaskCreatedEvent;
import org.example.tay.taskmanagmentkafkareact.domain.event.TaskDeletedEvent;
import org.example.tay.taskmanagmentkafkareact.domain.event.TaskUpdatedEvent;
import org.example.tay.taskmanagmentkafkareact.domain.model.TaskEventType;
import org.example.tay.taskmanagmentkafkareact.shared.dto.TaskEventDTO;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;


//  INFRASTRUCTURE LAYER — Kafka Event Handler
//
//  Listens to domain events published by TaskController via
//  ApplicationEventPublisher, then forwards them to Kafka.
//
//    TaskController
//        │ publishes TaskCreatedEvent (via ApplicationEventPublisher)
//    KafkaEventHandler
//        │ converts domain event → TaskEventDTO
//        │ calls KafkaProducerService
//   Kafka Topic: task-events
//   KafkaConsumerService (saves to MongoDB)

@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaEventHandler {

    private final KafkaProducerService kafkaProducerService;

    @EventListener
    public void handleTaskCreated(TaskCreatedEvent event) {
        log.info("Handling TaskCreatedEvent for task: {} by user: {}",
                event.getTaskId(), event.getCreatedBy());
        kafkaProducerService.publishEvent(
                TaskEventDTO.builder()
                        .eventType(TaskEventType.TASK_CREATED)
                        .taskId(event.getTaskId())
                        .title(event.getTitle())
                        .description(event.getDescription())
                        .status(event.getStatus())
                        .priority(event.getPriority())
                        .dueDate(event.getDueDate())
                        .createdBy(event.getCreatedBy())   // from JWT, not from event (event is immutable snapshot of creation)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @EventListener
    public void handleTaskUpdated(TaskUpdatedEvent event) {
        log.info("Handling TaskUpdatedEvent for task: {} by user: {}",
                event.getTaskId(), event.getUpdatedBy());
        kafkaProducerService.publishEvent(
                TaskEventDTO.builder()
                        .eventType(TaskEventType.TASK_UPDATED)
                        .taskId(event.getTaskId())
                        .title(event.getTitle())           // null = MODE A (status-only)
                        .description(event.getDescription())
                        .status(event.getStatus())
                        .priority(event.getPriority())
                        .dueDate(event.getDueDate())
                        .updatedBy(event.getUpdatedBy())   // from JWT
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @EventListener
    public void handleTaskDeleted(TaskDeletedEvent event) {
        log.info("Handling TaskDeletedEvent for task: {} by user: {}",
                event.getTaskId(), event.getDeletedBy());
        kafkaProducerService.publishEvent(
                TaskEventDTO.builder()
                        .eventType(TaskEventType.TASK_DELETED)
                        .taskId(event.getTaskId())
                        .title(event.getTitle())
                        .updatedBy(event.getDeletedBy())   // who triggered deletion
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}
