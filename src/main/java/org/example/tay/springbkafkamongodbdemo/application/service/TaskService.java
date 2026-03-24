package org.example.tay.springbkafkamongodbdemo.application.service;

import org.example.tay.springbkafkamongodbdemo.shared.dto.TaskEventDTO;
import org.example.tay.springbkafkamongodbdemo.shared.dto.TaskResponseDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * APPLICATION LAYER — Combined Task Service Interface (CQRS style)
 *
 * Combines both Query and Command operations in one interface.
 *
 * QUERY (Read) — called by TaskController directly:
 *   - getAllTasks()
 *   - getTaskById()
 *
 * COMMAND (Write) — called by KafkaConsumerService after consuming Kafka events:
 *   - handleCreate()  → saves new task to MongoDB
 *   - handleUpdate()  → updates existing task fields or status
 *   - handleDelete()  → removes task from MongoDB
 *
 * Separation of concerns is maintained through the flow:
 *   Controller → event → Kafka → Consumer → TaskService (command)
 *   Controller → TaskService (query) → MongoDB
 */
public interface TaskService {

    // ── QUERY operations (Read) ──────────────────────────────
    Flux<TaskResponseDTO> getAllTasks();
    Mono<TaskResponseDTO> getTaskById(String id);

    // ── COMMAND operations (Write) — triggered by Kafka Consumer ──
    Mono<Void> handleCreate(TaskEventDTO event);
    Mono<Void> handleUpdate(TaskEventDTO event);
    Mono<Void> handleDelete(TaskEventDTO event);
}
