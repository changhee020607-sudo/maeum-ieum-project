import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ConsultationLog() {
    const navigate = useNavigate();
    const logs = [
        { id: 101, date: '2026-04-20', consultant: '박준형', topic: '진로 상담' },
        { id: 102, date: '2026-04-15', consultant: '이지아', topic: '심리 상담' },
    ];

    return (
        <div style={{ padding: '20px' }}>
        <h2>나의 상담 기록</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
            {logs.map(log => (
            <li key={log.id} onClick={() => navigate(`/log/${log.id}`)} style={{ padding: '15px', borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                <strong>{log.date}</strong> - {log.consultant} 상담사 ({log.topic})
            </li>
            ))}
        </ul>
        </div>
    );
}