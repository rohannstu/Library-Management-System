package com.library.controller;

import com.library.dto.MemberDTO;
import com.library.service.MemberService;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MemberController.class)
public class MemberControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MemberService memberService;

    @Autowired
    private ObjectMapper objectMapper;

    private MemberDTO testMember;

    @BeforeEach
    void setUp() {
        testMember = new MemberDTO();
        testMember.setId(1L);
        testMember.setName("John Doe");
        testMember.setEmail("john.doe@example.com");
        testMember.setPhoneNumber("1234567890");
        testMember.setAddress("123 Main St");
        testMember.setMembershipStartDate(LocalDate.now());
        testMember.setMembershipEndDate(LocalDate.now().plusYears(1));
        testMember.setActive(true);
    }

    @Test
    void addMember_ShouldCreateMember() throws Exception {
        when(memberService.addMember(any(MemberDTO.class))).thenReturn(testMember);

        mockMvc.perform(post("/api/members")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testMember)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value(testMember.getName()))
                .andExpect(jsonPath("$.email").value(testMember.getEmail()));
    }

    @Test
    void addMember_WithInvalidEmail_ShouldReturnBadRequest() throws Exception {
        testMember.setEmail("invalid-email");

        mockMvc.perform(post("/api/members")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testMember)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getMember_ShouldReturnMember() throws Exception {
        when(memberService.getMemberById(1L)).thenReturn(testMember);

        mockMvc.perform(get("/api/members/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(testMember.getName()))
                .andExpect(jsonPath("$.email").value(testMember.getEmail()));
    }

    @Test
    void getAllMembers_ShouldReturnListOfMembers() throws Exception {
        when(memberService.getAllMembers()).thenReturn(Arrays.asList(testMember));

        mockMvc.perform(get("/api/members"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value(testMember.getName()))
                .andExpect(jsonPath("$[0].email").value(testMember.getEmail()));
    }

    @Test
    void updateMember_ShouldUpdateMember() throws Exception {
        when(memberService.updateMember(eq(1L), any(MemberDTO.class))).thenReturn(testMember);

        mockMvc.perform(put("/api/members/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testMember)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(testMember.getName()))
                .andExpect(jsonPath("$.email").value(testMember.getEmail()));
    }

    @Test
    void deleteMember_ShouldDeleteMember() throws Exception {
        doNothing().when(memberService).deleteMember(1L);

        mockMvc.perform(delete("/api/members/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void getMemberByEmail_ShouldReturnMember() throws Exception {
        when(memberService.getMemberByEmail(testMember.getEmail())).thenReturn(testMember);

        mockMvc.perform(get("/api/members/search/email")
                .param("email", testMember.getEmail()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(testMember.getName()))
                .andExpect(jsonPath("$.email").value(testMember.getEmail()));
    }
} 