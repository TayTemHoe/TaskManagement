package org.example.tay.springbkafkamongodbdemo.infrastructure.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.tay.springbkafkamongodbdemo.shared.dto.TaskEventDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

/**
 * INFRASTRUCTURE LAYER — Kafka Producer
 *
 * Responsible only for sending messages to the Kafka topic.
 * This class is only called by KafkaEventHandler — NOT by TaskService.
 * This keeps Kafka concerns fully inside the infrastructure layer.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaProducerService {

    private final KafkaTemplate<String, TaskEventDTO> kafkaTemplate;

    @Value("${kafka.topic.name}")
    private String taskEventsTopic;

    public void publishEvent(TaskEventDTO event) {
        kafkaTemplate.send(taskEventsTopic, event.getTaskId(), event);
        log.info("Published Kafka Event: {} for {}", event.getEventType(), event.getTaskId());
    }
}
