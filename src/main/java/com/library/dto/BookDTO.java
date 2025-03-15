package com.library.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Data
public class BookDTO {
    private Long id;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Author is required")
    private String author;
    
    @NotBlank(message = "ISBN is required")
    private String isbn;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;
    
    private Integer availableQuantity;
    
    @NotBlank(message = "Publisher is required")
    private String publisher;
    
    @NotNull(message = "Publication year is required")
    @Min(value = 1000, message = "Invalid publication year")
    private Integer publicationYear;
} 