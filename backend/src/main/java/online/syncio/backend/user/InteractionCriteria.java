package online.syncio.backend.user;

import java.time.Duration;

public class InteractionCriteria {
    public static final int MIN_POSTS = 1;
    public static final int MIN_LIKES = 0;
    public static final int MIN_COMMENTS = 0;
    public static final Duration TIME_PERIOD = Duration.ofDays(30);
}
