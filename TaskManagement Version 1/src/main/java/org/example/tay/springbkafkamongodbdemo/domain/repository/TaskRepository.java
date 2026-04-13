package org.example.tay.springbkafkamongodbdemo.domain.repository;

import org.example.tay.springbkafkamongodbdemo.domain.model.Task;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

/**
 * DOMAIN LAYER — Repository Interface
 *
 * This interface lives in the domain layer and defines WHAT operations are needed.
 * It does NOT define HOW they are implemented (that is in the infrastructure layer).
 *
 * Extends ReactiveMongoRepository for non-blocking Mono/Flux operations.
 * All methods return Mono<T> or Flux<T> — never blocking types.
 */
public interface TaskRepository extends ReactiveMongoRepository<Task, String> {
    // existsById is already provided by ReactiveMongoRepository
    // Additional query methods can be declared here as needed
}
