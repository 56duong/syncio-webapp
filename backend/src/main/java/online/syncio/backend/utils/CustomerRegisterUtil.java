package online.syncio.backend.utils;

import jakarta.servlet.http.HttpServletRequest;
import online.syncio.backend.setting.EmailSettingBag;
import online.syncio.backend.user.User;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Properties;

public class CustomerRegisterUtil {
    public static String getSiteURL(HttpServletRequest request) {


        String siteURL = request.getRequestURL().toString();



        return siteURL.replace(request.getServletPath(), "");
    }
    public static JavaMailSenderImpl prepareMailSender(EmailSettingBag settings) {

        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

        mailSender.setHost(settings.getHost());
        mailSender.setPort(settings.getPort());
        mailSender.setUsername(settings.getUsername());
        mailSender.setPassword(settings.getPassword());
        mailSender.setDefaultEncoding("utf-8");

        Properties mailProperties = new Properties();
        mailProperties.setProperty("mail.smtp.auth", settings.getSmtpAuth());
        mailProperties.setProperty("mail.smtp.starttls.enable", settings.getSmtpSecured());

        mailSender.setJavaMailProperties(mailProperties);



        return mailSender;
    }
    public static void encodePassword(User customer, PasswordEncoder passwordEncoder) {

        String encodedPassword = passwordEncoder.encode(customer.getPassword());



        customer.setPassword(encodedPassword);
    }
}
