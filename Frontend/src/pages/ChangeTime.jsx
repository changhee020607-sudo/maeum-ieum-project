import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChangeTime() {
    const times = ['10:00', '11:00', '14:00', '15:00', '16:00'];
    const navigate = useNavigate();

    return (
        <div style={{ padding: '30px', textAlign: 'center' }}>
        <h2>변경하실 시간을 선택하세요</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '20px' }}>
            {times.map(t => (
            <button key={t} onClick={() => { alert(`${t}로 변경 예약됨`); navigate('/'); }} 
                style={{ padding: '15px', border: '1px solid #2563eb', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>
                {t}
            </button>
            ))}
        </div>
        </div>
    );
}