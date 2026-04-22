package com.bank.util;

public class LuhnUtil {
    public static boolean validate(String cardNo) {
        if (cardNo == null || cardNo.length() < 13 || cardNo.length() > 19) {
            return false;
        }
        int sum = 0;
        boolean alternate = false;
        for (int i = cardNo.length() - 1; i >= 0; i--) {
            int n = Character.getNumericValue(cardNo.charAt(i));
            if (n < 0 || n > 9) return false;
            if (alternate) {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sum += n;
            alternate = !alternate;
        }
        return sum % 10 == 0;
    }
}
