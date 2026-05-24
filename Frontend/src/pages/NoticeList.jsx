import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function NoticeList() {
    const navigate = useNavigate();
    const [notices, setNotices] = useState([]);
    
    const userRole = localStorage.getItem('userRole')?.toUpperCase() || '';

    const canManageNotice = userRole === 'ADMIN' || userRole === 'COUNSELOR';

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/notices');
                setNotices(res.data);
            } catch (err) {
                console.error("공지사항 불러오기 실패:", err);
            }
        };
        fetchNotices();
    }, []);

    return (
        <div style={{ padding: '50px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ borderBottom: '2px solid #2563eb', paddingBottom: '10px' }}>📢 공지사항</h2>
            
            {canManageNotice && (
                <button 
                    onClick={() => navigate('/notices/write')}
                    style={{ float: 'right', padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' }}
                >
                    공지 등록
                </button>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '15px', textAlign: 'left' }}>제목</th>
                        <th style={{ padding: '15px', width: '120px' }}>작성일</th>
                        {canManageNotice && <th style={{ padding: '15px', width: '150px' }}>관리</th>}
                    </tr>
                </thead>
                <tbody>
                    {notices.length > 0 ? notices.map(notice => (
                        <tr key={notice.id} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
                            <td style={{ padding: '15px' }} onClick={() => navigate(`/notices/${notice.id}`)}>{notice.title}</td>
                            <td style={{ padding: '15px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
                                {new Date(notice.created_at).toLocaleDateString()}
                            </td>
                            
                            {canManageNotice && (
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    <button onClick={() => navigate(`/notices/${notice.id}/edit`)} style={{ marginRight: 8, padding: '4px 12px', background: '#fbbf24', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>수정</button>
                                    <button onClick={async (e) => {
                                        e.stopPropagation();
                                        if (window.confirm('정말 삭제하시겠습니까?')) {
                                            try {
                                                await axios.delete(`http://localhost:5000/api/notices/${notice.id}`);
                                                setNotices(notices.filter(n => n.id !== notice.id));
                                            } catch {
                                                alert('삭제에 실패했습니다.');
                                            }
                                        }
                                    }} style={{ padding: '4px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>삭제</button>
                                </td>
                            )}
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={canManageNotice ? "3" : "2"} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>등록된 공지사항이 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}