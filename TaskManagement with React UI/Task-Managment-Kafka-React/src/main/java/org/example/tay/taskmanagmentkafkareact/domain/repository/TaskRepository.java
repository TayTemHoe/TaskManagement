package org.example.tay.taskmanagmentkafkareact.domain.repository;

import org.example.tay.taskmanagmentkafkareact.domain.model.Task;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

public interface TaskRepository extends ReactiveMongoRepository<Task, String> {
}
