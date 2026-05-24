import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function LogDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #2563eb', paddingBottom: '10px' }}>
            상담 상세 기록 조회
        </h2>
        
        <div style={{ backgroundColor: '#f8fafc', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
            <p style={{ marginBottom: '10px' }}><strong>상담 번호:</strong> {id}</p>
            <p style={{ marginBottom: '10px' }}><strong>상담 일자:</strong> 2026-04-20</p>
            <p style={{ marginBottom: '10px' }}><strong>담당 전문가:</strong> 박준형 상담사</p>
            <hr style={{ margin: '20px 0', border: '0.5px solid #e2e8f0' }} />
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>상담 리포트:</p>
            <div style={{ lineHeight: '1.8', color: '#334155', whiteSpace: 'pre-wrap' }}>
            </div>
        </div>

        <button 
            onClick={() => navigate(-1)} 
            style={{ marginTop: '30px', padding: '12px 25px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
            목록으로 돌아가기
        </button>
        </div>
    );
}