package com.library.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String phoneNumber;
    
    @Column(nullable = false)
    private String address;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;
    
    @Column(nullable = false)
    private LocalDate membershipStartDate = LocalDate.now();
    
    @Column(nullable = false)
    private LocalDate membershipEndDate = LocalDate.now().plusYears(1);
    
    private boolean active = true;
    
    // Student specific fields
    private String studentId;
    private String course;
    private String semester;
    
    // Teacher specific fields
    private String employeeId;
    private String department;
    private String designation;
    
    // Maximum allowed books based on role
    @Column(nullable = false)
    private int maxAllowedBooks;
    
    // Maximum allowed days for borrowing
    @Column(nullable = false)
    private int maxAllowedDays;
    
    @PrePersist
    public void setDefaultValues() {
        switch (role) {
            case USER -> {
                maxAllowedBooks = 2;
                maxAllowedDays = 14;
            }
            case ADMIN -> {
                maxAllowedBooks = 10;
                maxAllowedDays = 30;
            }
        }
    }
} 