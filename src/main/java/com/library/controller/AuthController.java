package com.library.controller;

import com.library.dto.LoginRequest;
import com.library.dto.SignUpRequest;
import com.library.entity.Member;
import com.library.security.JwtTokenProvider;
import com.library.security.UserPrincipal;
import com.library.service.MemberService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final MemberService memberService;

    public AuthController(AuthenticationManager authenticationManager,
                         JwtTokenProvider tokenProvider,
                         MemberService memberService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.memberService = memberService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);
            
            // Get the user principal from the authentication
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            
            // Get member details
            var memberDTO = memberService.getMemberById(userPrincipal.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", jwt);
            response.put("tokenType", "Bearer");
            
            // Add user information to the response
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", memberDTO.getId());
            userInfo.put("name", memberDTO.getName());
            userInfo.put("email", memberDTO.getEmail());
            userInfo.put("role", memberDTO.getRole().name());
            response.put("user", userInfo);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error during authentication: ", e);
            Map<String, String> response = new HashMap<>();
            response.put("error", "Invalid email or password");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        try {
            logger.info("Attempting to register new user with email: {}", signUpRequest.getEmail());
            Member member = memberService.createMember(signUpRequest);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("email", member.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error during user registration: ", e);
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            if (userPrincipal == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }
            
            try {
                // Get member by ID using the service
                var memberDTO = memberService.getMemberById(userPrincipal.getId());
                
                Map<String, Object> response = new HashMap<>();
                response.put("id", memberDTO.getId());
                response.put("name", memberDTO.getName());
                response.put("email", memberDTO.getEmail());
                response.put("role", memberDTO.getRole().name());
                
                return ResponseEntity.ok(response);
            } catch (EntityNotFoundException e) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
        } catch (Exception e) {
            logger.error("Error fetching current user: ", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch user information"));
        }
    }
} 