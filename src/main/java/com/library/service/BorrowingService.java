package com.library.service;

import com.library.dto.BorrowingDTO;
import com.library.entity.Book;
import com.library.entity.Borrowing;
import com.library.entity.Member;
import com.library.repository.BookRepository;
import com.library.repository.BorrowingRepository;
import com.library.repository.MemberRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BorrowingService {
    private final BorrowingRepository borrowingRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    
    private static final int LOAN_PERIOD_DAYS = 14;
    private static final double FINE_PER_DAY = 1.0;

    public BorrowingService(BorrowingRepository borrowingRepository,
                          BookRepository bookRepository,
                          MemberRepository memberRepository) {
        this.borrowingRepository = borrowingRepository;
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
    }

    public BorrowingDTO borrowBook(BorrowingDTO borrowingDTO) {
        Book book = bookRepository.findById(borrowingDTO.getBookId())
            .orElseThrow(() -> new EntityNotFoundException("Book not found"));
            
        Member member = memberRepository.findById(borrowingDTO.getMemberId())
            .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        if (book.getAvailableQuantity() <= 0) {
            throw new IllegalStateException("Book is not available for borrowing");
        }

        if (!member.isActive()) {
            throw new IllegalStateException("Member is not active");
        }

        Borrowing borrowing = new Borrowing();
        borrowing.setBook(book);
        borrowing.setMember(member);
        borrowing.setBorrowDate(LocalDate.now());
        borrowing.setDueDate(LocalDate.now().plusDays(LOAN_PERIOD_DAYS));
        borrowing.setReturned(false);

        book.setAvailableQuantity(book.getAvailableQuantity() - 1);
        bookRepository.save(book);

        Borrowing savedBorrowing = borrowingRepository.save(borrowing);
        return convertToDTO(savedBorrowing);
    }

    public BorrowingDTO returnBook(Long borrowingId) {
        Borrowing borrowing = borrowingRepository.findById(borrowingId)
            .orElseThrow(() -> new EntityNotFoundException("Borrowing record not found"));

        if (borrowing.isReturned()) {
            throw new IllegalStateException("Book has already been returned");
        }

        Book book = borrowing.getBook();
        book.setAvailableQuantity(book.getAvailableQuantity() + 1);
        bookRepository.save(book);

        borrowing.setReturned(true);
        borrowing.setReturnDate(LocalDate.now());

        // Calculate fine if returned late
        if (LocalDate.now().isAfter(borrowing.getDueDate())) {
            long daysLate = ChronoUnit.DAYS.between(borrowing.getDueDate(), LocalDate.now());
            borrowing.setFineAmount(daysLate * FINE_PER_DAY);
        }

        Borrowing updatedBorrowing = borrowingRepository.save(borrowing);
        return convertToDTO(updatedBorrowing);
    }

    public List<BorrowingDTO> getActiveBorrowings() {
        return borrowingRepository.findByReturnedFalse().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<BorrowingDTO> getMemberBorrowings(Long memberId) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new EntityNotFoundException("Member not found"));
        return borrowingRepository.findByMemberAndReturnedFalse(member).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public BorrowingDTO getBorrowing(Long id) {
        Borrowing borrowing = borrowingRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Borrowing record not found"));
        return convertToDTO(borrowing);
    }

    public List<BorrowingDTO> getAllBorrowings() {
        return borrowingRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    private BorrowingDTO convertToDTO(Borrowing borrowing) {
        BorrowingDTO dto = new BorrowingDTO();
        dto.setId(borrowing.getId());
        dto.setBookId(borrowing.getBook().getId());
        dto.setMemberId(borrowing.getMember().getId());
        dto.setBorrowDate(borrowing.getBorrowDate());
        dto.setDueDate(borrowing.getDueDate());
        dto.setReturnDate(borrowing.getReturnDate());
        dto.setReturned(borrowing.isReturned());
        dto.setFineAmount(borrowing.getFineAmount());
        dto.setBookTitle(borrowing.getBook().getTitle());
        dto.setMemberName(borrowing.getMember().getName());
        return dto;
    }
} 