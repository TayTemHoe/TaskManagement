package org.example.tay.springbkafkamongodbdemo.shared.mapper;

import org.example.tay.springbkafkamongodbdemo.domain.model.Task;
import org.example.tay.springbkafkamongodbdemo.shared.dto.TaskResponseDTO;
import org.mapstruct.Mapper;

/**
 * SHARED LAYER — MapStruct Mapper
 *
 * Auto-generates the implementation at compile time.
 * Converts Task (domain entity) → TaskResponseDTO (shared DTO).
 * componentModel = "spring" makes it a Spring bean, injectable anywhere.
 */
@Mapper(componentModel = "spring")
public interface TaskMapper {
    TaskResponseDTO toResponseDTO(Task task);
}
