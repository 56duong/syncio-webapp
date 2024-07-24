package online.syncio.backend.utils;

import jakarta.mail.internet.MimeMessage;
import online.syncio.backend.setting.EmailSettingBag;
import online.syncio.backend.setting.SettingService;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.messaging.MessagingException;

import java.io.UnsupportedEncodingException;

public class CustomerForgetPasswordUtil {
    public static void sendEmail(String link, String email, SettingService settingService)
            throws UnsupportedEncodingException, MessagingException, jakarta.mail.MessagingException {


        EmailSettingBag emailSettings = settingService.getEmailSettings();



        JavaMailSenderImpl mailSender = CustomerRegisterUtil.prepareMailSender(emailSettings);



        String toAddress = email;
        String subject = "Here's the link to reset your password";

        String content = "<p>Hello,</p>"
                + "<p>You have requested to reset your password.</p>"
                + "Click the link below to change your password:</p>"
                + "<p><a href=\"" + link + "\">Change my password</a></p>"
                + "<br>"
                + "<p>You have "+ link + "</p>"
                + "<p>Ignore this email if you do remember your password, "
                + "or you have not made the request.</p>";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

        helper.setFrom(emailSettings.getFromAddress(), emailSettings.getSenderName());
        helper.setTo(toAddress);
        helper.setSubject(subject);

        helper.setText(content, true);



        mailSender.send(message);
    }

    public static void sendEmailTokenRegister(String link, String email, SettingService settingService)
            throws UnsupportedEncodingException, MessagingException, jakarta.mail.MessagingException {


        EmailSettingBag emailSettings = settingService.getEmailSettings();



        JavaMailSenderImpl mailSender = CustomerRegisterUtil.prepareMailSender(emailSettings);



        String toAddress = email;
        String subject = "Here's the link verify account";

        String content = "<p>Hello,</p>"
                + "<p>You have requested to verify your account.</p>"
                + "<p>Please click the link below to confirm your email address and complete the verification process:</p>"
                + "<p><a href='" + link + "' style='color: #4A90E2; text-decoration: none; font-weight: bold;'>Verify Your Account</a></p>"
                + "<br>"
                + "<p>If you did not request this verification, please ignore this email. This request will be ignored if you do not verify your account.</p>"
                + "<p>Thank you!</p>"
                + "<p>The SyncioWeb Team</p>";
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

        helper.setFrom(emailSettings.getFromAddress(), emailSettings.getSenderName());
        helper.setTo(toAddress);
        helper.setSubject(subject);

        helper.setText(content, true);



        mailSender.send(message);
    }
}
