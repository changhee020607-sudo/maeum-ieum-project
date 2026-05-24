import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function NoticeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotice = async () => {
            try {
                await axios.post(`http://localhost:5000/api/notices/${id}/view`);
                const res = await axios.get(`http://localhost:5000/api/notices/${id}`);
                setNotice(res.data);
            } catch (err) {
                alert('공지사항 정보를 불러오지 못했습니다.');
                navigate('/notices');
            } finally {
                setLoading(false);
            }
        };
        fetchNotice();
    }, [id, navigate]);

    if (loading) return <div style={{ padding: 40 }}>로딩 중...</div>;
    if (!notice) return null;

    const match = notice.title ? notice.title.match(/^\[(.*?)\]/) : null;
    const detectedWriter = match ? match[1] : '관리자';

    const cleanTitle = match ? notice.title.replace(/^\[.*?\]\s*/, '') : notice.title;

    return (
        <div style={{ maxWidth: 700, margin: '40px auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 18 }}>{cleanTitle}</h2>
            
            <div style={{ color: '#2563eb', fontWeight: 600, marginBottom: 4, fontSize: 15 }}>
                작성자: {detectedWriter}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', marginBottom: 6, fontSize: 14, borderBottom: '1px solid #e5e7eb', paddingBottom: 10 }}>
                <span>등록일: {new Date(notice.created_at).toLocaleString()}</span>
                <span>조회수: {notice.views ?? 0}</span>
            </div>
            <div style={{ fontSize: 18, whiteSpace: 'pre-line', minHeight: 120, marginTop: 18 }}>{notice.content}</div>
            <button onClick={() => navigate('/notices')} style={{ marginTop: 32, padding: '10px 28px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>목록으로</button>
        </div>
    );
}