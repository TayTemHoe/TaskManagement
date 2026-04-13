package org.example.tay.taskmanagmentkafkareact.infrastructure.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.tay.taskmanagmentkafkareact.application.service.TaskService;
import org.example.tay.taskmanagmentkafkareact.shared.dto.TaskEventDTO;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;


//  INFRASTRUCTURE LAYER — Kafka Consumer
//
//  Thin consumer — receives events from Kafka topic and
//  delegates ALL business logic to TaskService (command methods).
//
//  Consumer only decides: "Which method to call based on event type?"
//  TaskServiceImpl decides: "How to validate and persist the task."
@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaConsumerService {

    private final TaskService taskService;

    @KafkaListener(
            topics = "${kafka.topic.name}",
            groupId = "${spring.kafka.consumer.group-id}"
    )
    public void consumeEvent(TaskEventDTO event) {
        log.info("Received Kafka Event: {} for {}", event.getEventType(), event.getTaskId());

        switch (event.getEventType()) {
            case "TASK_CREATED" -> taskService.handleCreate(event)
                    .subscribe(
                            null,
                            err -> log.error("CONSUMER ERROR - Create [{}]: {}", event.getTaskId(), err.getMessage(), err)
                    );

            case "TASK_UPDATED" -> taskService.handleUpdate(event)
                    .subscribe(
                            null,
                            err -> log.error("CONSUMER ERROR - Update [{}]: {}", event.getTaskId(), err.getMessage(), err)
                    );

            case "TASK_DELETED" -> taskService.handleDelete(event)
                    .subscribe(
                            null,
                            err -> log.error("CONSUMER ERROR - Delete [{}]: {}", event.getTaskId(), err.getMessage(), err)
                    );

            default -> log.warn("Unknown event type received: {}", event.getEventType());
        }
    }
}
