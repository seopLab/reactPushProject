package com.cheongyak.ai;

import java.io.IOException;

// 공고문 PDF 를 분석해 결과 JSON 을 돌려주는 쪽. 실제 구현은 NoticeAnalyzer(Gemini), 테스트에서는 가짜로 바꿔 끼운다
public interface NoticeAnalysisClient {

	String model();

	String analyze(byte[] pdf, String sourcePdfUrl) throws IOException, InterruptedException;

}
