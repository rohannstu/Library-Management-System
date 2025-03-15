package com.library.controller;

import com.library.dto.BorrowingDTO;
import com.library.service.BorrowingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/borrowings")
public class BorrowingController {
    private final BorrowingService borrowingService;

    public BorrowingController(BorrowingService borrowingService) {
        this.borrowingService = borrowingService;
    }

    @GetMapping
    public ResponseEntity<List<BorrowingDTO>> getAllBorrowings() {
        return ResponseEntity.ok(borrowingService.getAllBorrowings());
    }

    @PostMapping("/borrow")
    public ResponseEntity<BorrowingDTO> borrowBook(@Valid @RequestBody BorrowingDTO borrowingDTO) {
        return new ResponseEntity<>(borrowingService.borrowBook(borrowingDTO), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<BorrowingDTO> returnBook(@PathVariable Long id) {
        return ResponseEntity.ok(borrowingService.returnBook(id));
    }

    @GetMapping("/active")
    public ResponseEntity<List<BorrowingDTO>> getActiveBorrowings() {
        return ResponseEntity.ok(borrowingService.getActiveBorrowings());
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<BorrowingDTO>> getMemberBorrowings(@PathVariable Long memberId) {
        return ResponseEntity.ok(borrowingService.getMemberBorrowings(memberId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BorrowingDTO> getBorrowing(@PathVariable Long id) {
        return ResponseEntity.ok(borrowingService.getBorrowing(id));
    }
} 