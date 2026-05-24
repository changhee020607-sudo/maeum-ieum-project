import React from 'react';

export default function AdminDashboard() {
    const stats = [
        { label: '오늘의 예약', count: 12 },
        { label: '신규 문의', count: 5 },
        { label: '완료된 상담', count: 128 },
    ];

    return (
        <div style={{ padding: '30px' }}>
        <h2>관리자 대시보드</h2>
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
            {stats.map(s => (
            <div key={s.label} style={{ flex: 1, padding: '20px', backgroundColor: '#f8faff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <p style={{ color: '#64748b' }}>{s.label}</p>
                <h3 style={{ fontSize: '24px' }}>{s.count}</h3>
            </div>
            ))}
        </div>
        <div style={{ marginTop: '40px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <h3>최근 예약 내역</h3>
            <p style={{ color: '#94a3b8' }}>내일 DB 연동 후 실제 데이터가 여기에 표시됩니다.</p>
        </div>
        </div>
    );
}