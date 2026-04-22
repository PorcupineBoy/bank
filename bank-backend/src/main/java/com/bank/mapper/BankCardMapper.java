package com.bank.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.bank.entity.BankCard;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface BankCardMapper extends BaseMapper<BankCard> {
    @Select("SELECT * FROM bank_card WHERE user_id = #{userId} AND status = 0 ORDER BY is_default DESC, bind_time DESC")
    List<BankCard> selectActiveByUserId(@Param("userId") Long userId);
}
