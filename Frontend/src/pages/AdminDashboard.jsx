import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
    const [stats, setStats] = useState([
        { label: '오늘의 예약', count: 0, color: '#2563eb' },
        { label: '완료된 상담', count: 0, color: '#6366f1' },
    ]);

    const [recentReservations, setRecentReservations] = useState([]);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch('http://localhost:5000/api/admin/stats');
                const data = await response.json();
                setStats([
                    { label: '오늘의 예약', count: data.todayReservations || 0, color: '#2563eb' },
                    { label: '완료된 상담', count: data.completedConsultations || 0, color: '#6366f1' },
                ]);
                setRecentReservations(data.recentReservations || []);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        }

        fetchStats();
    }, []);

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '30px', fontWeight: 'bold' }}>관리자 대시보드</h2>
        
        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
            {stats.map(s => (
            <div key={s.label} style={{ 
                flex: 1, 
                padding: '25px', 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0', 
                borderRadius: '15px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
            }}>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '10px' }}>{s.label}</p>
                <h3 style={{ fontSize: '32px', color: s.color, fontWeight: 'bold' }}>{s.count}</h3>
            </div>
            ))}
        </div>

        <div style={{ padding: '30px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '15px' }}>
            <h3 style={{ marginBottom: '20px' }}>최근 예약 현황</h3>
            {recentReservations.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {recentReservations.map((res, index) => (
                        <div key={index} style={{ padding: '15px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#f9fafb' }}>
                            <p><strong>예약자:</strong> {res.userName}</p>
                            <p><strong>상담사:</strong> {res.consultantName}</p>
                            <p><strong>예약 시간:</strong> {res.time}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                    <p>현재 예약 내역이 없습니다.</p>
                </div>
            )}
        </div>
        </div>
    );
}