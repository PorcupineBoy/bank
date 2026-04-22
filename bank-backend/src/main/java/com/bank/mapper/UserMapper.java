package com.bank.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.bank.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
