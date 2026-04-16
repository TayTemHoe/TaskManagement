package org.example.tay.taskmanagmentkafkareact.application.service;

import org.example.tay.taskmanagmentkafkareact.shared.dto.TaskEventDTO;
import org.example.tay.taskmanagmentkafkareact.shared.dto.TaskFilterDTO;
import org.example.tay.taskmanagmentkafkareact.shared.dto.TaskResponseDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


//  Separation of concerns is maintained through the flow:
//    Controller -> event -> Kafka -> Consumer -> TaskService (command)
//    Controller -> TaskService (query) -> MongoDB

public interface TaskService {

    // ── QUERY operations (Read) ──────────────────────────────
    Flux<TaskResponseDTO> getAllTasks();
    Mono<TaskResponseDTO> getTaskById(String id);

    /**
     * Returns tasks matching all non-null fields in the filter,
     * sorted by filter.sortBy / filter.sortDir.
     * When all filter fields are null this behaves identically to getAllTasks().
     */
    Flux<TaskResponseDTO> getFilteredTasks(TaskFilterDTO filter);

    // ── VALIDATION operation (New) ───────────────────────────
    // This allows the Controller to check ownership BEFORE Kafka
    Mono<TaskResponseDTO> validateOwnership(TaskResponseDTO task);
    Mono<String> generateTaskId();

    // ── COMMAND operations (Write) — triggered by Kafka Consumer ──
    Mono<Void> handleCreate(TaskEventDTO event);
    Mono<Void> handleUpdate(TaskEventDTO event);
    Mono<Void> handleDelete(TaskEventDTO event);
}
