package online.syncio.backend.config;

import online.syncio.backend.utils.JobQueue;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.core.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

@Service
public class RabbitQueueDefine {

    @Autowired
    @Qualifier("amqpAdmin")
    AmqpAdmin rabbitAdminMain;

    @Bean
    public void declareQueues() {
        JobQueue.queueNameList.forEach(queueName -> {
            try {
                Queue queue = new Queue(queueName, true, false, false, null);
                rabbitAdminMain.declareQueue(queue);
            } catch (AmqpException e) {
                // Log the error or handle it according to your application's requirements
                System.err.println("Failed to declare queue: " + queueName + ", error: " + e.getMessage());
            }
        });
    }

    @Bean
    public void declareExchanges() {
        JobQueue.exchangeNameList.forEach(exchangeName -> {
            Exchange exchange = new DirectExchange(exchangeName, true, false);
            rabbitAdminMain.declareExchange(exchange);
        });
    }
    @Bean
    public void setupBindings() {

        for (int i = 0; i < JobQueue.queueNameList.size(); i++) {
            Binding binding = BindingBuilder
                    .bind(new Queue(JobQueue.queueNameList.get(i), true))
                    .to(new DirectExchange(JobQueue.exchangeNameList.get(i), true, false))
                    .with(JobQueue.routingKeyList.get(i));
            rabbitAdminMain.declareBinding(binding);
        }
    }

    @Bean
    public Queue responseQueue() {
        Queue queue = new Queue("image_verification_response_queue_springboot", true, false, false, null);
        rabbitAdminMain.declareQueue(queue);
        return queue;
    }

}
