package com.cheongyak.ai;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NoticeAnalysisRepository extends JpaRepository<NoticeAnalysis, Long> {

	Optional<NoticeAnalysis> findByNoticeId(Long noticeId);

}
