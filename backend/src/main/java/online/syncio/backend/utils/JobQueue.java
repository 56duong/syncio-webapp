package online.syncio.backend.utils;

import java.util.Arrays;
import java.util.List;

public class JobQueue {

    public static final String QUEUE_CHECKIMAGE_AI = "imageVerificationQueue";

    public static final List<String> queueNameList = Arrays.asList(QUEUE_CHECKIMAGE_AI);


    public static final String EXCHANGE_CHECKIMAGE_AI = "imageVerificationExchange";

    public static final List<String> exchangeNameList = Arrays.asList(EXCHANGE_CHECKIMAGE_AI);


    public static final String ROUTING_KEY_CHECKIMAGE_AI = "imageVerify";


    public static final List<String> routingKeyList = Arrays.asList(ROUTING_KEY_CHECKIMAGE_AI);
}
