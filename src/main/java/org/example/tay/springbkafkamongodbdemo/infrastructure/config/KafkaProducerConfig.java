package org.example.tay.springbkafkamongodbdemo.infrastructure.config;

import com.fasterxml.jackson.databind.JsonSerializer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.example.tay.springbkafkamongodbdemo.shared.dto.TaskEventDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * INFRASTRUCTURE LAYER — Kafka Producer Configuration
 *
 * Explicitly defines the KafkaTemplate<String, TaskEventDTO> bean.
 * This is required because Spring Boot cannot auto-detect the generic
 * type <String, TaskEventDTO> from application.properties alone.
 *
 * Without this config, Spring throws:
 * "Could not autowire. No beans of KafkaTemplate<String, TaskEventDTO> type found."
 */
@Configuration
public class KafkaProducerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ProducerFactory<String, TaskEventDTO> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        // Key 使用 String 序列化
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        // Value 使用 JSON 序列化
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public KafkaTemplate<String, TaskEventDTO> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
