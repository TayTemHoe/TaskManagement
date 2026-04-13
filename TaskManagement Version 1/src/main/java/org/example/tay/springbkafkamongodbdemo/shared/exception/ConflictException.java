package org.example.tay.springbkafkamongodbdemo.shared.exception;

/**
 * SHARED LAYER — 409 Conflict Exception
 * Thrown when a task ID already exists.
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
