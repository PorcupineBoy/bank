package com.bank.util;

import org.mindrot.jbcrypt.BCrypt;

public class PasswordUtil {
    public static String hash(String plainPassword) {
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(12));
    }

    public static boolean verify(String plainPassword, String hashedPassword) {
        return BCrypt.checkpw(plainPassword, hashedPassword);
    }

    public static boolean isValidLoginPassword(String password) {
        if (password == null || password.length() < 8 || password.length() > 20) {
            return false;
        }
        int typeCount = 0;
        if (password.matches(".*[A-Z].*")) typeCount++;
        if (password.matches(".*[a-z].*")) typeCount++;
        if (password.matches(".*\\d.*")) typeCount++;
        if (typeCount < 2) return false;

        for (int i = 0; i < password.length() - 2; i++) {
            if (password.charAt(i) == password.charAt(i + 1) &&
                password.charAt(i) == password.charAt(i + 2)) {
                return false;
            }
        }
        return true;
    }

    public static boolean isValidTradePassword(String password) {
        if (password == null || !password.matches("^\\d{6}$")) {
            return false;
        }
        if (password.equals("123456") || password.equals("111111") ||
            password.equals("000000") || password.equals("222222") ||
            password.equals("333333") || password.equals("444444") ||
            password.equals("555555") || password.equals("666666") ||
            password.equals("777777") || password.equals("888888") ||
            password.equals("999999")) {
            return false;
        }
        if (isConsecutive(password)) return false;
        return true;
    }

    private static boolean isConsecutive(String s) {
        boolean inc = true, dec = true;
        for (int i = 0; i < s.length() - 1; i++) {
            if (s.charAt(i + 1) - s.charAt(i) != 1) inc = false;
            if (s.charAt(i + 1) - s.charAt(i) != -1) dec = false;
        }
        return inc || dec;
    }
}
