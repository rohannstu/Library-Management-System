package com.library.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String author;
    
    @Column(nullable = false)
    private String isbn;
    
    @Column(nullable = false)
    private int quantity;
    
    private int availableQuantity;
    
    @Column(nullable = false)
    private String publisher;
    
    @Column(nullable = false)
    private int publicationYear;
} 