package org.example.tay.springbkafkamongodbdemo.infrastructure.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/**
 * INFRASTRUCTURE LAYER — Kafka Configuration
 *
 * Creates the Kafka topic automatically on startup if it does not exist.
 * Topic name is read from application.properties via @Value.
 */
@Configuration
public class KafkaConfig {

    @Value("${kafka.topic.name}")
    private String taskEventsTopic;

    @Bean
    public NewTopic taskEventsTopic() {
        return TopicBuilder.name(taskEventsTopic)
                .partitions(1)
                .replicas(1)
                .build();
    }
}
