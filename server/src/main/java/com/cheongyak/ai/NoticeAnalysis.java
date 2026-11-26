package com.cheongyak.ai;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// notice_analyses 테이블 (V1). 공고 하나당 분석 결과 한 줄
@Entity
@Table(name = "notice_analyses")
public class NoticeAnalysis {

	public static final String DONE = "DONE";
	public static final String FAILED = "FAILED";

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "notice_id", nullable = false, unique = true)
	private Long noticeId;

	@Column(nullable = false, length = 20)
	private String status;

	@Column(length = 50)
	private String model;

	@Column(name = "result_json")
	private String resultJson;

	@Column(name = "analyzed_at")
	private LocalDateTime analyzedAt;

	protected NoticeAnalysis() {
	}

	NoticeAnalysis(Long noticeId) {
		this.noticeId = noticeId;
		this.status = FAILED;
	}

	void markDone(String model, String resultJson) {
		this.status = DONE;
		this.model = model;
		this.resultJson = resultJson;
		this.analyzedAt = LocalDateTime.now();
	}

	void markFailed(String model) {
		this.status = FAILED;
		this.model = model;
		this.analyzedAt = LocalDateTime.now();
	}

	public Long getId() {
		return id;
	}

	public Long getNoticeId() {
		return noticeId;
	}

	public String getStatus() {
		return status;
	}

	public String getModel() {
		return model;
	}

	public String getResultJson() {
		return resultJson;
	}

	public LocalDateTime getAnalyzedAt() {
		return analyzedAt;
	}

}
