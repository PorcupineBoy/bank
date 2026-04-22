package com.bank.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.bank.entity.Transaction;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface TransactionMapper extends BaseMapper<Transaction> {
    List<Transaction> selectByUserAndConditions(@Param("userId") Long userId,
                                                 @Param("transType") Integer transType,
                                                 @Param("startTime") LocalDateTime startTime,
                                                 @Param("endTime") LocalDateTime endTime);
}
