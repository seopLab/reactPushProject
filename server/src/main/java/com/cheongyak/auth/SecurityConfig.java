package com.cheongyak.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

// 초기 뼈대: 지금은 모든 주소를 열어 둔다.
// TODO(A): JWT 로그인 구현 시 permitAll 범위를 줄이고 oauth2ResourceServer(jwt) 를 붙인다.
//          참고: spring-lecture/lecture-server 의 SecurityConfig
@Configuration
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.csrf(csrf -> csrf.disable())
				.cors(Customizer.withDefaults())
				.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.headers(h -> h.frameOptions(f -> f.sameOrigin()))   // H2 콘솔 화면용
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/actuator/health", "/error", "/h2-console/**").permitAll()
						.anyRequest().permitAll());
		return http.build();
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

}
