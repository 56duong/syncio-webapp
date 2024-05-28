package online.syncio.backend.config;


import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.LocaleResolver;


import java.util.Locale;

@RequiredArgsConstructor
@Component
public class LocalizationUtils {
    private final MessageSource messageSource;
    private final LocaleResolver localeResolver;


    public String getLocalizedMessage(String messageKey, Object... params) {//spread operator
        HttpServletRequest request = WebUtils.getCurrentRequest();
        Locale locale = localeResolver.resolveLocale(request);

        try {
            return messageSource.getMessage(messageKey, params, locale);
        } catch (NoSuchMessageException e) {
            System.err.println("Could not find the message for key: " + messageKey + " with locale: " + locale);
            return messageKey; // Return key by default or throw a custom exception
        }
    }
}
