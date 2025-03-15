package com.library.controller;

import com.library.dto.BookDTO;
import com.library.service.BookService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BookController.class)
public class BookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookService bookService;

    @Autowired
    private ObjectMapper objectMapper;

    private BookDTO testBook;

    @BeforeEach
    void setUp() {
        testBook = new BookDTO();
        testBook.setId(1L);
        testBook.setTitle("Test Book");
        testBook.setAuthor("Test Author");
        testBook.setIsbn("1234567890");
        testBook.setQuantity(5);
        testBook.setAvailableQuantity(5);
        testBook.setPublisher("Test Publisher");
        testBook.setPublicationYear(2024);
    }

    @Test
    void addBook_ShouldCreateBook() throws Exception {
        when(bookService.addBook(any(BookDTO.class))).thenReturn(testBook);

        mockMvc.perform(post("/api/books")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBook)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value(testBook.getTitle()))
                .andExpect(jsonPath("$.author").value(testBook.getAuthor()));
    }

    @Test
    void getBook_ShouldReturnBook() throws Exception {
        when(bookService.getBookById(1L)).thenReturn(testBook);

        mockMvc.perform(get("/api/books/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value(testBook.getTitle()))
                .andExpect(jsonPath("$.author").value(testBook.getAuthor()));
    }

    @Test
    void getAllBooks_ShouldReturnListOfBooks() throws Exception {
        when(bookService.getAllBooks()).thenReturn(Arrays.asList(testBook));

        mockMvc.perform(get("/api/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value(testBook.getTitle()))
                .andExpect(jsonPath("$[0].author").value(testBook.getAuthor()));
    }

    @Test
    void updateBook_ShouldUpdateBook() throws Exception {
        when(bookService.updateBook(eq(1L), any(BookDTO.class))).thenReturn(testBook);

        mockMvc.perform(put("/api/books/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBook)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value(testBook.getTitle()))
                .andExpect(jsonPath("$.author").value(testBook.getAuthor()));
    }

    @Test
    void deleteBook_ShouldDeleteBook() throws Exception {
        mockMvc.perform(delete("/api/books/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void searchBooksByTitle_ShouldReturnBooks() throws Exception {
        when(bookService.searchBooksByTitle("Test")).thenReturn(Arrays.asList(testBook));

        mockMvc.perform(get("/api/books/search/title").param("title", "Test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value(testBook.getTitle()));
    }

    @Test
    void searchBooksByAuthor_ShouldReturnBooks() throws Exception {
        when(bookService.searchBooksByAuthor("Test")).thenReturn(Arrays.asList(testBook));

        mockMvc.perform(get("/api/books/search/author").param("author", "Test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].author").value(testBook.getAuthor()));
    }
} 