package com.library.service;

import com.library.dto.BookDTO;
import com.library.entity.Book;
import com.library.repository.BookRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookService {
    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public BookDTO addBook(BookDTO bookDTO) {
        Book book = new Book();
        BeanUtils.copyProperties(bookDTO, book);
        book.setAvailableQuantity(bookDTO.getQuantity());
        Book savedBook = bookRepository.save(book);
        BookDTO savedDTO = new BookDTO();
        BeanUtils.copyProperties(savedBook, savedDTO);
        return savedDTO;
    }

    public BookDTO updateBook(Long id, BookDTO bookDTO) {
        Book existingBook = bookRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Book not found with id: " + id));
        
        BeanUtils.copyProperties(bookDTO, existingBook, "id");
        Book updatedBook = bookRepository.save(existingBook);
        BookDTO updatedDTO = new BookDTO();
        BeanUtils.copyProperties(updatedBook, updatedDTO);
        return updatedDTO;
    }

    public void deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new EntityNotFoundException("Book not found with id: " + id);
        }
        bookRepository.deleteById(id);
    }

    public BookDTO getBookById(Long id) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Book not found with id: " + id));
        BookDTO bookDTO = new BookDTO();
        BeanUtils.copyProperties(book, bookDTO);
        return bookDTO;
    }

    public List<BookDTO> getAllBooks() {
        return bookRepository.findAll().stream()
            .map(book -> {
                BookDTO dto = new BookDTO();
                BeanUtils.copyProperties(book, dto);
                return dto;
            })
            .collect(Collectors.toList());
    }

    public List<BookDTO> searchBooksByTitle(String title) {
        return bookRepository.findByTitleContainingIgnoreCase(title).stream()
            .map(book -> {
                BookDTO dto = new BookDTO();
                BeanUtils.copyProperties(book, dto);
                return dto;
            })
            .collect(Collectors.toList());
    }

    public List<BookDTO> searchBooksByAuthor(String author) {
        return bookRepository.findByAuthorContainingIgnoreCase(author).stream()
            .map(book -> {
                BookDTO dto = new BookDTO();
                BeanUtils.copyProperties(book, dto);
                return dto;
            })
            .collect(Collectors.toList());
    }
} 