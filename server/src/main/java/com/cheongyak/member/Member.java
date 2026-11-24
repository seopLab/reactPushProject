package com.cheongyak.member;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.Table;

// members 테이블 (V1 + V2 위도·경도 삭제 + V3 login_id·약관 동의)
// 공급 유형·추가 조건·서류는 member_id 만 가진 하위 테이블이라 엔티티 없이 컬렉션으로 붙인다
@Entity
@Table(name = "members")
public class Member {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "login_id")
	private String loginId;

	private String email;

	@Column(name = "password_hash")
	private String passwordHash;

	private String nickname;

	@Column(name = "birth_date")
	private LocalDate birthDate;

	@Column(name = "region_name")
	private String regionName;

	// Hibernate 는 모든 컬럼을 insert 하므로 DB 기본값(10)을 여기서도 맞춘다
	@Column(name = "alert_radius_km")
	private int alertRadiusKm = 10;

	@Column(name = "household_size")
	private Integer householdSize;

	@Column(name = "house_owned")
	private String houseOwned;

	@Column(name = "has_bank_account")
	private boolean hasBankAccount;

	@Column(name = "account_months")
	private Integer accountMonths;

	@Column(name = "terms_agreed_at")
	private LocalDateTime termsAgreedAt;

	@Column(name = "location_agreed")
	private boolean locationAgreed;

	@Column(name = "notification_agreed")
	private boolean notificationAgreed;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@Column(name = "deleted_at")
	private LocalDateTime deletedAt;

	@ElementCollection
	@CollectionTable(name = "member_supply_types", joinColumns = @JoinColumn(name = "member_id"))
	@Column(name = "supply_type")
	private Set<String> supplyTypes = new HashSet<>();

	@ElementCollection
	@CollectionTable(name = "member_special_conditions", joinColumns = @JoinColumn(name = "member_id"))
	@Column(name = "condition")
	private Set<String> specialConditions = new HashSet<>();

	@ElementCollection
	@CollectionTable(name = "member_documents", joinColumns = @JoinColumn(name = "member_id"))
	@MapKeyColumn(name = "doc_type")
	@Column(name = "checked")
	private Map<String, Boolean> documents = new HashMap<>();

	protected Member() {
	}

	static Member register(MemberRegistration registration, String passwordHash, LocalDateTime now) {
		Member member = new Member();
		member.loginId = registration.loginId();
		member.email = registration.email();
		member.passwordHash = passwordHash;
		member.nickname = registration.nickname();
		member.birthDate = registration.birthDate();
		member.regionName = registration.regionName();
		member.householdSize = registration.householdSize();
		member.houseOwned = registration.houseOwned();
		member.hasBankAccount = registration.hasBankAccount();
		member.accountMonths = registration.accountMonths();
		member.termsAgreedAt = now;
		member.locationAgreed = registration.locationAgreed();
		member.notificationAgreed = registration.notificationAgreed();
		member.createdAt = now;
		member.supplyTypes.addAll(registration.supplyTypes());
		member.specialConditions.addAll(registration.specialConditions());
		member.documents.putAll(registration.documents());
		return member;
	}

	public Long getId() {
		return id;
	}

	public String getLoginId() {
		return loginId;
	}

	public String getEmail() {
		return email;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public String getNickname() {
		return nickname;
	}

	public LocalDateTime getTermsAgreedAt() {
		return termsAgreedAt;
	}

	public Set<String> getSupplyTypes() {
		return Set.copyOf(supplyTypes);
	}

	public Set<String> getSpecialConditions() {
		return Set.copyOf(specialConditions);
	}

	public Map<String, Boolean> getDocuments() {
		return Map.copyOf(documents);
	}

}
