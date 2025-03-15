package com.library.service;

import com.library.dto.MemberDTO;
import com.library.entity.Member;
import com.library.entity.Role;
import com.library.exception.RoleValidationException;
import com.library.repository.MemberRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import com.library.dto.SignUpRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
public class MemberService {
    private static final Logger logger = LoggerFactory.getLogger(MemberService.class);
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public MemberService(MemberRepository memberRepository, PasswordEncoder passwordEncoder) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public MemberDTO addMember(MemberDTO memberDTO) {
        validateMemberRole(memberDTO);
        
        if (memberRepository.existsByEmail(memberDTO.getEmail())) {
            throw new IllegalArgumentException("Member with this email already exists");
        }
        
        Member member = new Member();
        BeanUtils.copyProperties(memberDTO, member);
        member.setPassword(passwordEncoder.encode(memberDTO.getPassword()));
        
        Member savedMember = memberRepository.save(member);
        MemberDTO savedDTO = new MemberDTO();
        BeanUtils.copyProperties(savedMember, savedDTO);
        return savedDTO;
    }

    public MemberDTO updateMember(Long id, MemberDTO memberDTO) {
        validateMemberRole(memberDTO);
        
        Member existingMember = memberRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Member not found with id: " + id));
        
        if (!existingMember.getEmail().equals(memberDTO.getEmail()) && 
            memberRepository.existsByEmail(memberDTO.getEmail())) {
            throw new IllegalArgumentException("Member with this email already exists");
        }
        
        // If password is provided, encode it
        if (memberDTO.getPassword() != null && !memberDTO.getPassword().isEmpty()) {
            existingMember.setPassword(passwordEncoder.encode(memberDTO.getPassword()));
        }
        
        // Don't copy password from DTO
        BeanUtils.copyProperties(memberDTO, existingMember, "id", "password");
        Member updatedMember = memberRepository.save(existingMember);
        
        MemberDTO updatedDTO = new MemberDTO();
        BeanUtils.copyProperties(updatedMember, updatedDTO);
        return updatedDTO;
    }

    private void validateMemberRole(MemberDTO memberDTO) {
        if (!memberDTO.isValidForRole()) {
            String errorMessage = switch (memberDTO.getRole()) {
                case USER -> "Basic user information is required";
                case ADMIN -> "Admin information is required";
                default -> "Invalid role-specific information";
            };
            throw new RoleValidationException(errorMessage);
        }
    }

    public void deleteMember(Long id) {
        if (!memberRepository.existsById(id)) {
            throw new EntityNotFoundException("Member not found with id: " + id);
        }
        memberRepository.deleteById(id);
    }

    public MemberDTO getMemberById(Long id) {
        Member member = memberRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Member not found with id: " + id));
        MemberDTO memberDTO = new MemberDTO();
        BeanUtils.copyProperties(member, memberDTO);
        return memberDTO;
    }

    public List<MemberDTO> getAllMembers() {
        return memberRepository.findAll().stream()
            .map(member -> {
                MemberDTO dto = new MemberDTO();
                BeanUtils.copyProperties(member, dto);
                return dto;
            })
            .collect(Collectors.toList());
    }

    public MemberDTO getMemberByEmail(String email) {
        Member member = memberRepository.findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException("Member not found with email: " + email));
        MemberDTO memberDTO = new MemberDTO();
        BeanUtils.copyProperties(member, memberDTO);
        return memberDTO;
    }

    public List<MemberDTO> getMembersByRole(Role role) {
        return memberRepository.findAll().stream()
            .filter(member -> member.getRole() == role)
            .map(member -> {
                MemberDTO dto = new MemberDTO();
                BeanUtils.copyProperties(member, dto);
                return dto;
            })
            .collect(Collectors.toList());
    }

    @Transactional
    public Member createMember(SignUpRequest signUpRequest) {
        // Check if email already exists
        if (memberRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already taken");
        }

        logger.info("Creating new member with email: {}", signUpRequest.getEmail());
        logger.info("SignUpRequest details: {}", signUpRequest.toString());

        // Create new member
        Member member = new Member();
        member.setName(signUpRequest.getName());
        member.setEmail(signUpRequest.getEmail());
        member.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        member.setRole(signUpRequest.getRole());
        member.setPhoneNumber(signUpRequest.getPhoneNumber());
        member.setAddress(signUpRequest.getAddress());
        member.setMembershipStartDate(signUpRequest.getMembershipStartDate());
        member.setMembershipEndDate(signUpRequest.getMembershipEndDate());

        logger.info("Member before save: {}", member.toString());
        
        Member savedMember = memberRepository.save(member);
        logger.info("Member saved successfully with ID: {}", savedMember.getId());
        
        return savedMember;
    }
} 