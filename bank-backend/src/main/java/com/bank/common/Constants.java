package com.bank.common;

public class Constants {
    public static final String TOKEN_HEADER = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String REDIS_TOKEN_KEY = "token:";
    public static final String REDIS_SMS_KEY = "sms:";
    public static final String REDIS_SMS_LOCK_KEY = "sms_lock:";
    public static final String REDIS_LOGIN_FAIL_KEY = "login_fail:";
    public static final String REDIS_TRADE_FAIL_KEY = "trade_fail:";
    public static final String REDIS_TRANSFER_LOCK_KEY = "transfer_lock:";
    public static final String REDIS_DAILY_TRANSFER_KEY = "daily_transfer:";

    public static final int SMS_EXPIRE_MINUTES = 5;
    public static final int SMS_RESEND_SECONDS = 60;
    public static final int SMS_MAX_FAIL = 5;
    public static final int SMS_LOCK_MINUTES = 30;
    public static final int LOGIN_MAX_FAIL = 5;
    public static final int LOGIN_LOCK_MINUTES = 30;
    public static final int TRADE_MAX_FAIL = 5;
    public static final int TRADE_LOCK_HOURS = 24;
    public static final int TRANSFER_INTERVAL_SECONDS = 30;

    public static final int USER_STATUS_NORMAL = 0;
    public static final int USER_STATUS_LOCKED = 1;
    public static final int USER_STATUS_CANCELLED = 2;

    public static final int CARD_TYPE_DEBIT = 1;
    public static final int CARD_TYPE_CREDIT = 2;
    public static final int CARD_STATUS_NORMAL = 0;
    public static final int CARD_STATUS_UNBOUND = 1;

    public static final int TRANS_TYPE_TRANSFER = 1;
    public static final int TRANS_TYPE_BILL = 2;
    public static final int TRANS_TYPE_INCOME = 3;
    public static final int TRANS_STATUS_PROCESSING = 0;
    public static final int TRANS_STATUS_SUCCESS = 1;
    public static final int TRANS_STATUS_FAILED = 2;

    public static final int DEFAULT_SINGLE_LIMIT = 50000;
    public static final int DEFAULT_DAILY_LIMIT = 200000;
}
