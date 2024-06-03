package online.syncio.backend.utils;

import java.util.regex.Pattern;

public class ValidationUtils {
    public static boolean isValidEmail(String email) {
        // Regular expression pattern for validating email addresses
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,7}$";
        // Create a Pattern object
        Pattern pattern = Pattern.compile(emailRegex);
        // Match the input email with the pattern
        return email != null && pattern.matcher(email).matches();
    }



    public static boolean isValidPassword(String password) {
        // Password validation: At least 3 characters
        return password != null && password.length() >= 3;
    }
}
