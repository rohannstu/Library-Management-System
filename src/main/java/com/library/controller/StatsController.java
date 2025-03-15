package com.library.controller;

import com.library.repository.BookRepository;
import com.library.repository.BorrowingRepository;
import com.library.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private BorrowingRepository borrowingRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Get total counts
        long totalBooks = bookRepository.count();
        long totalMembers = memberRepository.count();
        long totalBorrowings = borrowingRepository.count();
        
        // Get active borrowings (not returned)
        long activeBorrowings = borrowingRepository.countByReturnedFalse();
        
        // Get overdue borrowings (not returned and due date is before today)
        LocalDate today = LocalDate.now();
        long overdueBorrowings = borrowingRepository.countByReturnedFalseAndDueDateBefore(today);
        
        // Populate stats map
        stats.put("totalBooks", totalBooks);
        stats.put("totalMembers", totalMembers);
        stats.put("totalBorrowings", totalBorrowings);
        stats.put("activeBorrowings", activeBorrowings);
        stats.put("overdueBorrowings", overdueBorrowings);
        
        return ResponseEntity.ok(stats);
    }
} 