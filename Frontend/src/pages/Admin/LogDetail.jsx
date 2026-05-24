import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function LogDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
        <h2>상담 상세 기록 (#{id})</h2>
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
            <p><strong>상담 일자:</strong> 2026-04-20</p>
            <p><strong>상담사:</strong> 박준형</p>
            <hr />
            <p><strong>상담 내용 요약:</strong></p>
            <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '5px' }}>
            진로 고민에 대한 전반적인 상담을 진행함. IT 직무 역량 강화를 위한 프로젝트 로드맵 설정 및 포트폴리오 피드백 제공 완료.
            </div>
        </div>
        <button onClick={() => navigate(-1)} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px' }}>목록으로</button>
        </div>
    );
}