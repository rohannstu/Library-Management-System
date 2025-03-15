package com.library.repository;

import com.library.entity.Borrowing;
import com.library.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDate;

public interface BorrowingRepository extends JpaRepository<Borrowing, Long> {
    List<Borrowing> findByMemberAndReturnedFalse(Member member);
    List<Borrowing> findByReturnedFalse();
    long countByReturnedFalse();
    long countByReturnedFalseAndDueDateBefore(LocalDate date);
} 