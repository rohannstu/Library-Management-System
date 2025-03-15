package com.library.service;

import com.library.dto.BorrowingDTO;
import com.library.entity.Book;
import com.library.entity.Borrowing;
import com.library.entity.Member;
import com.library.repository.BookRepository;
import com.library.repository.BorrowingRepository;
import com.library.repository.MemberRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BorrowingServiceTest {

    @Mock
    private BorrowingRepository borrowingRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private BorrowingService borrowingService;

    private Book testBook;
    private Member testMember;
    private Borrowing testBorrowing;
    private BorrowingDTO testBorrowingDTO;

    @BeforeEach
    void setUp() {
        testBook = new Book();
        testBook.setId(1L);
        testBook.setTitle("Test Book");
        testBook.setQuantity(5);
        testBook.setAvailableQuantity(3);

        testMember = new Member();
        testMember.setId(1L);
        testMember.setName("John Doe");
        testMember.setActive(true);

        testBorrowing = new Borrowing();
        testBorrowing.setId(1L);
        testBorrowing.setBook(testBook);
        testBorrowing.setMember(testMember);
        testBorrowing.setBorrowDate(LocalDate.now());
        testBorrowing.setDueDate(LocalDate.now().plusDays(14));
        testBorrowing.setReturned(false);

        testBorrowingDTO = new BorrowingDTO();
        testBorrowingDTO.setBookId(1L);
        testBorrowingDTO.setMemberId(1L);
    }

    @Test
    void borrowBook_Success() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));
        when(memberRepository.findById(1L)).thenReturn(Optional.of(testMember));
        when(borrowingRepository.save(any(Borrowing.class))).thenReturn(testBorrowing);

        BorrowingDTO result = borrowingService.borrowBook(testBorrowingDTO);

        assertNotNull(result);
        assertEquals(testBook.getId(), result.getBookId());
        assertEquals(testMember.getId(), result.getMemberId());
        verify(bookRepository).save(testBook);
        assertEquals(2, testBook.getAvailableQuantity());
    }

    @Test
    void borrowBook_BookNotAvailable() {
        testBook.setAvailableQuantity(0);
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));
        when(memberRepository.findById(1L)).thenReturn(Optional.of(testMember));

        assertThrows(IllegalStateException.class, () -> 
            borrowingService.borrowBook(testBorrowingDTO));
    }

    @Test
    void borrowBook_InactiveMember() {
        testMember.setActive(false);
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));
        when(memberRepository.findById(1L)).thenReturn(Optional.of(testMember));

        assertThrows(IllegalStateException.class, () -> 
            borrowingService.borrowBook(testBorrowingDTO));
    }

    @Test
    void returnBook_Success() {
        when(borrowingRepository.findById(1L)).thenReturn(Optional.of(testBorrowing));
        when(borrowingRepository.save(any(Borrowing.class))).thenReturn(testBorrowing);

        BorrowingDTO result = borrowingService.returnBook(1L);

        assertNotNull(result);
        assertTrue(result.isReturned());
        assertNotNull(result.getReturnDate());
        verify(bookRepository).save(testBook);
        assertEquals(4, testBook.getAvailableQuantity());
    }

    @Test
    void returnBook_WithLateFee() {
        testBorrowing.setDueDate(LocalDate.now().minusDays(5));
        when(borrowingRepository.findById(1L)).thenReturn(Optional.of(testBorrowing));
        when(borrowingRepository.save(any(Borrowing.class))).thenReturn(testBorrowing);

        BorrowingDTO result = borrowingService.returnBook(1L);

        assertNotNull(result);
        assertTrue(result.getFineAmount() > 0);
    }

    @Test
    void returnBook_AlreadyReturned() {
        testBorrowing.setReturned(true);
        when(borrowingRepository.findById(1L)).thenReturn(Optional.of(testBorrowing));

        assertThrows(IllegalStateException.class, () -> 
            borrowingService.returnBook(1L));
    }

    @Test
    void getActiveBorrowings_Success() {
        when(borrowingRepository.findByReturnedFalse()).thenReturn(Arrays.asList(testBorrowing));

        var result = borrowingService.getActiveBorrowings();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(testBook.getTitle(), result.get(0).getBookTitle());
    }

    @Test
    void getMemberBorrowings_Success() {
        when(memberRepository.findById(1L)).thenReturn(Optional.of(testMember));
        when(borrowingRepository.findByMemberAndReturnedFalse(testMember))
            .thenReturn(Arrays.asList(testBorrowing));

        var result = borrowingService.getMemberBorrowings(1L);

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(testMember.getName(), result.get(0).getMemberName());
    }

    @Test
    void getMemberBorrowings_MemberNotFound() {
        when(memberRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> 
            borrowingService.getMemberBorrowings(1L));
    }
} 