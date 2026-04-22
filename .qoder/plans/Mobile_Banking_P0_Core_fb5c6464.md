# Mobile Banking System - P0 Core Implementation Plan

## Architecture Overview

**Backend:** Spring Boot 2.7 + MyBatis-Plus + MySQL 8 + Redis + JWT (jjwt) + BCrypt
**Frontend:** Vue 2 + Vant 2 + Vue Router 3 + Vuex 3 + Axios

---

## Task 1: Backend Project Scaffold & Configuration

Create `bank-backend/` with Spring Boot structure.

**Files to create:**
- `pom.xml` - dependencies: spring-boot-starter-web, mybatis-plus-boot-starter, mysql-connector, redis, jjwt, lombok, bcrypt, validation
- `src/main/resources/application.yml` - DB, Redis, JWT config
- `src/main/java/com/bank/BankApplication.java`
- `src/main/java/com/bank/config/` - MyBatisPlusConfig, RedisConfig, WebConfig, JwtConfig
- `src/main/java/com/bank/common/` - Result (unified response wrapper), Constants
- `src/main/java/com/bank/exception/` - GlobalExceptionHandler, BusinessException
- `src/main/java/com/bank/interceptor/` - JwtInterceptor
- `src/main/java/com/bank/aspect/` - OperationLogAspect
- `src/main/java/com/bank/util/` - JwtUtil, AESUtil, LuhnUtil, PasswordUtil

**Database scripts:**
- `sql/init_schema.sql` - create tables: user, bank_card, transaction, operation_log

---

## Task 2: Backend Entity & Mapper Layer

**Files to create:**
- `entity/User.java` - user entity matching data dictionary
- `entity/BankCard.java` - bank card entity
- `entity/Transaction.java` - transaction record entity
- `entity/OperationLog.java` - operation log entity
- `mapper/UserMapper.java`, `UserMapper.xml`
- `mapper/BankCardMapper.java`, `BankCardMapper.xml`
- `mapper/TransactionMapper.java`, `TransactionMapper.xml`
- `mapper/OperationLogMapper.java`, `OperationLogMapper.xml`

---

## Task 3: Backend Auth Module (F-AUTH)

**APIs to implement:**
- `POST /api/auth/sms/send` - send SMS OTP (mock, store in Redis with 5min TTL, 60s resend lock)
- `POST /api/auth/register` - user registration with validation rules
- `POST /api/auth/login/password` - password login, JWT issuance, single-device login tracking in Redis
- `POST /api/auth/login/sms` - SMS code login
- `POST /api/auth/logout` - invalidate JWT / Redis session

**Files to create:**
- `dto/` - RegisterRequest, LoginRequest, SmsSendRequest
- `vo/` - LoginVO (token + user info)
- `service/AuthService.java`, `AuthServiceImpl.java`
- `controller/AuthController.java`

**Business rules:**
- Password: 8-20 chars, at least 2 of uppercase/lowercase/digit, no 3+ consecutive same chars
- Phone uniqueness check
- SMS wrong > 5 times = 30min lock
- Login wrong > 5 times = 30min lock
- JWT 30min with sliding refresh
- Single device login (store token hash in Redis per user)

---

## Task 4: Backend Card Management Module (F-CARD)

**APIs to implement:**
- `POST /api/cards/bind` - bind bank card (Luhn check, max 10 cards, name match, no duplicate)
- `POST /api/cards/{cardId}/unbind` - unbind (check no in-progress transactions, require trade password)
- `GET /api/cards` - list user cards with masked numbers
- `GET /api/cards/{cardId}` - card detail
- `PUT /api/cards/{cardId}/default` - set default card
- `GET /api/cards/{cardId}/balance` - query balance (mock external bank call)

**Files to create:**
- `dto/CardBindRequest.java`
- `vo/BankCardVO.java`, `BalanceVO.java`
- `service/BankCardService.java`, `BankCardServiceImpl.java`
- `controller/BankCardController.java`

---

## Task 5: Backend Transaction Module (F-TRANS)

**APIs to implement:**
- `GET /api/transactions` - query transaction list with filters (time range, type) + pagination
- `GET /api/transactions/{transId}` - transaction detail
- `POST /api/transactions/transfer` - transfer (limit check, balance check, trade password, anti-replay 30s)

**Files to create:**
- `dto/TransferRequest.java`, `TransactionQueryRequest.java`
- `vo/TransactionVO.java`, `TransactionPageVO.java`
- `service/TransactionService.java`, `TransactionServiceImpl.java`
- `controller/TransactionController.java`

**Business rules:**
- Default limits: single 50,000, daily cumulative 200,000
- Amount precision: 0.01 yuan min
- Recipient card Luhn check
- Same payee interval >= 30s (Redis lock)
- Record operation log for every transfer

---

## Task 6: Backend Security Module (F-SEC)

**APIs to implement:**
- `POST /api/user/security/trade-password` - set trade password (6 digits, not simple, not same as login password)
- `GET /api/user/security/limits` - get user's transaction limits
- `PUT /api/user/security/limits` - update limits (SMS + trade password verification)

**Files to create:**
- `dto/TradePasswordRequest.java`, `LimitUpdateRequest.java`
- `vo/SecurityLimitVO.java`
- `service/SecurityService.java`, `SecurityServiceImpl.java`
- `controller/SecurityController.java`

**Security controls:**
- Trade password: 6 digits, not 123456/111111/etc., not same as login password
- Wrong trade password > 5 times = freeze 24h
- Transfer >= 10,000: risk warning (frontend + backend flag)
- New payee warning
- Anti-replay: timestamp + nonce check

---

## Task 7: Frontend Project Scaffold

Create `bank-frontend/` with Vue 2 + Vant 2.

**Files to create:**
- `package.json` - vue@2, vant@2, vue-router@3, vuex@3, axios
- `vue.config.js` - devServer proxy to backend
- `public/index.html`
- `src/main.js` - Vue init, Vant import
- `src/App.vue` - root layout
- `src/utils/request.js` - Axios interceptor (JWT header, auto logout on 401)
- `src/utils/auth.js` - token storage helpers
- `src/utils/validate.js` - form validation rules
- `src/store/index.js` - Vuex store (user state)
- `src/router/index.js` - route definitions + navigation guard
- `src/api/` - auth.js, card.js, transaction.js, security.js

---

## Task 8: Frontend Pages - Auth

**Pages to create:**
- `src/views/login/Login.vue` - password login / SMS login tabs
- `src/views/login/Register.vue` - register stepper (phone -> SMS -> password -> identity)

**Features:**
- SMS countdown (60s)
- Password visibility toggle
- Form validation with Vant Form
- Auto-redirect to home after login

---

## Task 9: Frontend Pages - Home & Cards

**Pages to create:**
- `src/views/home/Home.vue` - account overview, total assets, quick actions
- `src/views/card/CardList.vue` - card list with masked numbers, default badge
- `src/views/card/CardDetail.vue` - card info, balance query, unbind action
- `src/views/card/CardBind.vue` - bind new card form

**Features:**
- Eye icon to hide/show balance
- Pull-to-refresh on lists
- Dialog confirmation for unbind (trade password input)

---

## Task 10: Frontend Pages - Transactions & Transfer

**Pages to create:**
- `src/views/transaction/TransactionList.vue` - transaction list with filters (time, type)
- `src/views/transaction/TransactionDetail.vue` - detail view
- `src/views/transfer/Transfer.vue` - transfer form (select card, enter payee info, amount, remark)
- `src/views/transfer/TransferConfirm.vue` - confirm page with risk warning if >= 10,000, trade password input
- `src/views/transfer/TransferResult.vue` - success/processing/failure result

**Features:**
- Infinite scroll for transaction list
- Filter popup for time range and type
- Trade password numeric keyboard (Vant NumberKeyboard)
- Anti-double-click on submit

---

## Task 11: Frontend Pages - Security

**Pages to create:**
- `src/views/security/SecurityCenter.vue` - security settings menu
- `src/views/security/TradePassword.vue` - set/modify trade password
- `src/views/security/LimitSetting.vue` - adjust transaction limits

**Features:**
- Numeric keyboard for trade password
- SMS verification for sensitive changes

---

## Task 12: Integration & Testing Checklist

**Verification steps:**
1. Backend starts successfully, DB tables created
2. Redis connection works
3. Register -> Login -> View cards -> Bind card -> Query balance -> Transfer -> View transactions flow works end-to-end
4. JWT expiration and auto-logout works
5. Trade password wrong lock works
6. Transfer limit enforcement works
7. Single-device login kicks old session
8. Frontend responsive on mobile viewport
9. All sensitive data masked in UI

---

## Key Design Decisions

1. **Mock SMS:** No real SMS gateway; codes stored in Redis with key `sms:{phone}:{type}` and returned in dev mode or logged.
2. **Mock Bank Balance:** Balance stored in `bank_card` table (`balance` column added) to simulate external bank queries.
3. **AES Encryption:** Simple AES-256-CBC with configurable key for id_card and card_no encryption. In production, use KMS.
4. **Transaction Status:** Transfers execute synchronously for simplicity; status can be success/failure directly.
5. **Operation Log:** Async AOP logging to avoid blocking main thread.
6. **Frontend Proxy:** `vue.config.js` proxy `/api` to `http://localhost:8080` during development.