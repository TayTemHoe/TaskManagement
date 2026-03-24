package org.example.tay.springbkafkamongodbdemo.shared.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.tay.springbkafkamongodbdemo.domain.model.TaskPriority;
import org.example.tay.springbkafkamongodbdemo.domain.model.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * SHARED LAYER — Kafka Event DTO
 *
 * Carries the FULL task payload inside every Kafka message.
 *
 * WHY full payload is needed:
 * In the mentor's EDA flow, the Kafka Consumer is responsible for
 * saving the task to MongoDB. Without the full data here, the consumer
 * would not know what to persist.
 *
 * This pattern is called "Event-Carried State Transfer":
 * the event itself carries all state, so the consumer is self-sufficient
 * and does not need to call back to any other service.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskEventDTO {

    // ── Event metadata ──────────────────────────────────
    private String eventType;       // TASK_CREATED | TASK_UPDATED | TASK_DELETED
    private LocalDateTime timestamp;

    // ── Full task payload (used by consumer to save/update/delete) ──
    private String taskId;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;
}
