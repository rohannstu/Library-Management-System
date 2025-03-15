package com.library.controller;

import com.library.dto.BorrowingDTO;
import com.library.service.BorrowingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BorrowingController.class)
public class BorrowingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BorrowingService borrowingService;

    @Autowired
    private ObjectMapper objectMapper;

    private BorrowingDTO testBorrowing;

    @BeforeEach
    void setUp() {
        testBorrowing = new BorrowingDTO();
        testBorrowing.setId(1L);
        testBorrowing.setBookId(1L);
        testBorrowing.setMemberId(1L);
        testBorrowing.setBorrowDate(LocalDate.now());
        testBorrowing.setDueDate(LocalDate.now().plusDays(14));
        testBorrowing.setReturned(false);
        testBorrowing.setFineAmount(0.0);
        testBorrowing.setBookTitle("Test Book");
        testBorrowing.setMemberName("John Doe");
    }

    @Test
    void borrowBook_ShouldCreateBorrowing() throws Exception {
        when(borrowingService.borrowBook(any(BorrowingDTO.class))).thenReturn(testBorrowing);

        mockMvc.perform(post("/api/borrowings/borrow")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBorrowing)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bookId").value(testBorrowing.getBookId()))
                .andExpect(jsonPath("$.memberId").value(testBorrowing.getMemberId()));
    }

    @Test
    void borrowBook_WithoutRequiredFields_ShouldReturnBadRequest() throws Exception {
        BorrowingDTO invalidBorrowing = new BorrowingDTO();
        
        mockMvc.perform(post("/api/borrowings/borrow")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidBorrowing)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returnBook_ShouldUpdateBorrowing() throws Exception {
        testBorrowing.setReturned(true);
        testBorrowing.setReturnDate(LocalDate.now());
        when(borrowingService.returnBook(1L)).thenReturn(testBorrowing);

        mockMvc.perform(post("/api/borrowings/1/return"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.returned").value(true))
                .andExpect(jsonPath("$.returnDate").isNotEmpty());
    }

    @Test
    void getActiveBorrowings_ShouldReturnListOfBorrowings() throws Exception {
        when(borrowingService.getActiveBorrowings()).thenReturn(Arrays.asList(testBorrowing));

        mockMvc.perform(get("/api/borrowings/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].bookId").value(testBorrowing.getBookId()))
                .andExpect(jsonPath("$[0].memberId").value(testBorrowing.getMemberId()));
    }

    @Test
    void getMemberBorrowings_ShouldReturnListOfBorrowings() throws Exception {
        when(borrowingService.getMemberBorrowings(1L)).thenReturn(Arrays.asList(testBorrowing));

        mockMvc.perform(get("/api/borrowings/member/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].bookId").value(testBorrowing.getBookId()))
                .andExpect(jsonPath("$[0].memberId").value(testBorrowing.getMemberId()));
    }

    @Test
    void getBorrowing_ShouldReturnBorrowing() throws Exception {
        when(borrowingService.getBorrowing(1L)).thenReturn(testBorrowing);

        mockMvc.perform(get("/api/borrowings/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookId").value(testBorrowing.getBookId()))
                .andExpect(jsonPath("$.memberId").value(testBorrowing.getMemberId()))
                .andExpect(jsonPath("$.bookTitle").value(testBorrowing.getBookTitle()))
                .andExpect(jsonPath("$.memberName").value(testBorrowing.getMemberName()));
    }

    @Test
    void getBorrowing_WithLateFee_ShouldReturnBorrowingWithFine() throws Exception {
        testBorrowing.setDueDate(LocalDate.now().minusDays(5));
        testBorrowing.setFineAmount(5.0);
        when(borrowingService.getBorrowing(1L)).thenReturn(testBorrowing);

        mockMvc.perform(get("/api/borrowings/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fineAmount").value(5.0));
    }
} 