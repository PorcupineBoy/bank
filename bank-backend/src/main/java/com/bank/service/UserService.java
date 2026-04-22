package com.bank.service;

import com.bank.vo.UserProfileVO;

public interface UserService {
    UserProfileVO getProfile(Long userId);
}
