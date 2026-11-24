package com.cheongyak.member;

import java.time.LocalDateTime;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cheongyak.common.BusinessException;

@Service
public class MemberService {

	private final MemberRepository memberRepository;
	private final PasswordEncoder passwordEncoder;

	public MemberService(MemberRepository memberRepository, PasswordEncoder passwordEncoder) {
		this.memberRepository = memberRepository;
		this.passwordEncoder = passwordEncoder;
	}

	// 저장한 회원의 id 를 돌려준다
	@Transactional
	public Long register(MemberRegistration registration) {
		if (memberRepository.existsByLoginId(registration.loginId())) {
			throw new BusinessException(HttpStatus.CONFLICT, "이미 사용 중인 아이디예요.");
		}
		if (memberRepository.existsByEmail(registration.email())) {
			throw new BusinessException(HttpStatus.CONFLICT, "이미 가입된 이메일이에요.");
		}
		Member member = Member.register(registration, passwordEncoder.encode(registration.password()), LocalDateTime.now());
		try {
			// 위 검사와 저장 사이에 같은 값으로 동시에 가입하면 unique 제약에서 걸린다
			return memberRepository.saveAndFlush(member).getId();
		} catch (DataIntegrityViolationException e) {
			throw new BusinessException(HttpStatus.CONFLICT, "이미 사용 중인 아이디나 이메일이에요.");
		}
	}

}
