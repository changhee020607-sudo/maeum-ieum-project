import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReservationComplete() {
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
        <h2>예약이 완료되었습니다!</h2>
        <p style={{ color: '#64748b', marginBottom: '40px' }}>전문가가 곧 연락드릴 예정입니다. 마이페이지에서 상세 내역을 확인하세요.</p>
        <button 
            onClick={() => navigate('/')} 
            style={{ padding: '12px 30px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
            홈으로 돌아가기
        </button>
        </div>
    );
}