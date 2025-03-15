package com.library.dto;

import com.library.entity.Role;
import lombok.Data;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Data
public class MemberDTO {
    private Long id;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;
    
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
    
    @NotBlank(message = "Address is required")
    private String address;
    
    @NotNull(message = "Role is required")
    private Role role;
    
    @NotNull(message = "Membership start date is required")
    private LocalDate membershipStartDate;
    
    @NotNull(message = "Membership end date is required")
    private LocalDate membershipEndDate;
    
    private boolean active = true;
    
    // Student specific fields
    private String studentId;
    private String course;
    private String semester;
    
    // Teacher specific fields
    private String employeeId;
    private String department;
    private String designation;
    
    // Read-only fields
    private int maxAllowedBooks;
    private int maxAllowedDays;
    
    // Basic validation
    public boolean isValidForRole() {
        return true; // Basic validation is handled by annotations
    }
} 