package com.library.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class BorrowingDTO {
    private Long id;
    
    @NotNull(message = "Book ID is required")
    private Long bookId;
    
    @NotNull(message = "Member ID is required")
    private Long memberId;
    
    private LocalDate borrowDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private boolean returned;
    private double fineAmount;
    
    // Additional fields for response
    private String bookTitle;
    private String memberName;
} 