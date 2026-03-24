package org.example.tay.springbkafkamongodbdemo.shared.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.tay.springbkafkamongodbdemo.domain.model.TaskStatus;

/**
 * SHARED LAYER — Status-Only Update DTO
 *
 * Used by PATCH /api/tasks/{id}/status
 * Allows the user to change ONLY the status without touching any other field.
 *
 * Example request body:
 * {
 *   "status": "IN_PROGRESS"
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskStatusUpdateDTO {

    @NotNull(message = "Status must not be null")
    private TaskStatus status;
}
