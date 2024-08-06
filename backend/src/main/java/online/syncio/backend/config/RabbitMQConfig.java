package online.syncio.backend.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.config.RabbitListenerConfigUtils;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.listener.RabbitListenerEndpointRegistrar;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.amqp.rabbit.annotation.RabbitListenerConfigurer;
import org.springframework.context.annotation.Primary;
import org.springframework.web.context.support.GenericWebApplicationContext;

@Configuration
@EnableRabbit
public class RabbitMQConfig implements RabbitListenerConfigurer {
    @Override
    public void configureRabbitListeners(RabbitListenerEndpointRegistrar registrar) {
    }

    public static final String EXCHANGE = "imageVerificationExchange";
    public static final String ROUTING_KEY = "imageVerify";

    @Autowired
    private GenericWebApplicationContext context;

    @Value("${spring.rabbitmq.host}")
    private String rabitHost;

    @Value("${spring.rabbitmq.port}")
    private int rabitPort;

    @Value("${spring.rabbitmq.username}")
    private String rabitUsername;

    @Value("${spring.rabbitmq.password}")
    private String rabitPassword;

    @Value("${spring.rabbitmq.virtual-host}")
    private String virtual_host;


    private CachingConnectionFactory getCachingConnectionFactoryCommon() {
        CachingConnectionFactory connectionFactory = new CachingConnectionFactory(this.rabitHost, this.rabitPort);
        connectionFactory.setUsername(this.rabitUsername);
        connectionFactory.setPassword(this.rabitPassword);
        connectionFactory.setVirtualHost(this.virtual_host);
        return connectionFactory;
    }

    @Primary
    @Bean
    public AmqpAdmin amqpAdmin(ConnectionFactory connectionFactory) {
        RabbitAdmin rabbitAdmin = new RabbitAdmin(connectionFactory);
        return rabbitAdmin;
    }

    @Primary
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        final RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return new RabbitTemplate(connectionFactory);
    }

    @Primary
    @Bean
    public ConnectionFactory connectionFactory() {
        CachingConnectionFactory connectionFactory = this.getCachingConnectionFactoryCommon();

        return connectionFactory;
    }

    @Primary
    @Bean("rabbitListenerContainerFactory")
    public SimpleRabbitListenerContainerFactory containerFactory(ConnectionFactory connectionFactory) {
        final SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setDefaultRequeueRejected(false);
        factory.setConnectionFactory(connectionFactory);
        factory.setDefaultRequeueRejected(false);
        factory.setMessageConverter(jsonMessageConverter());
        return factory;
    }

//    public static final String EXCHANGE = "imageVerificationExchange";
//    public static final String ROUTING_KEY = "imageVerify";
//    public static final String QUEUE_CHECKIMAGE_AI = "imageVerificationQueue";
//    public static final String QUEUE_IMAGE_VERIFICATION = "image_verification_response_queue_spring";
//
//    @Bean
//    Queue queue() {
//        return new Queue(QUEUE_CHECKIMAGE_AI, false);
//    }
//
//    @Bean
//    Queue responseQueue() {
//        return new Queue(QUEUE_IMAGE_VERIFICATION, true);
//    }
//
//    @Bean
//    DirectExchange exchange() {
//        return new DirectExchange(EXCHANGE);
//    }
//
//    @Bean
//    Binding binding(Queue queue, DirectExchange exchange) {
//        return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
//    }
//
//    @Bean
//    Binding responseBinding(Queue responseQueue, DirectExchange exchange) {
//        return BindingBuilder.bind(responseQueue).to(exchange).with("image_verification_response_queue_spring");
//    }
//
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
//    @Bean
//    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(ConnectionFactory connectionFactory) {
//        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
//        factory.setConnectionFactory(connectionFactory);
//        factory.setMessageConverter(jsonMessageConverter());
//        return factory;
//    }




}
