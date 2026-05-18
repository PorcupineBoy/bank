package com.bank.mapper;

import com.bank.entity.BankCard;
import com.bank.vo.BankCardLookupVO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface BankCardMapper extends BaseMapper<BankCard> {
    @Select("SELECT * FROM bank_card WHERE user_id = #{userId} AND status = 0 ORDER BY is_default DESC, bind_time DESC")
    List<BankCard> selectActiveByUserId(@Param("userId") Long userId);

    /**
     * 根据收款人真实姓名模糊查找其名下银行卡（仅查询正常状态的卡）
     */
    @Select("SELECT u.user_id, u.real_name, bc.card_id, bc.bank_name, bc.card_no_masked, bc.card_type " +
            "FROM user u INNER JOIN bank_card bc ON u.user_id = bc.user_id " +
            "WHERE u.real_name LIKE CONCAT('%', #{name}, '%') AND bc.status = 0 AND u.status = 0 " +
            "ORDER BY u.real_name, bc.is_default DESC")
    List<BankCardLookupVO> lookupByName(@Param("name") String name);
}
