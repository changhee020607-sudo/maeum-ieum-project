import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReservationComplete() {
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h1 style={{ fontSize: '3rem', color: '#10b981' }}>🎉</h1>
        <h2 style={{ marginBottom: '20px' }}>예약이 완료되었습니다!</h2>
        <p style={{ color: '#64748b', marginBottom: '40px' }}>
            상담 일시에 맞춰 접속해 주세요. <br />
            상세 내역은 마이페이지에서 확인하실 수 있습니다.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
            <button onClick={() => navigate('/mypage')} style={subBtnStyle}>예약 내역 보기</button>
            <button onClick={() => navigate('/')} style={mainBtnStyle}>홈으로 이동</button>
        </div>
        </div>
    );
    }

const mainBtnStyle = { padding: '12px 25px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const subBtnStyle = { padding: '12px 25px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer' };