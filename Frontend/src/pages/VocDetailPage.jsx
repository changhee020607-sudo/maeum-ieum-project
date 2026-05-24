import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function VocDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [voc, setVoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');

    const userRole = (localStorage.getItem('userRole') || '').toUpperCase();
    const sessionUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const userName = localStorage.getItem('userName') || sessionUser.userName || sessionUser.name || '';
    const isStaff = userRole === 'ADMIN' || userRole === 'COUNSELOR' || userRole === 'CONSULTANT';

    useEffect(() => {
        const fetchVoc = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/voc/${id}`);
                const fetchedVoc = res.data;
                const writerName = fetchedVoc.writer || fetchedVoc.name || '';

                if (!isStaff && writerName !== userName) {
                    alert('본인이 작성한 글만 확인할 수 있습니다.');
                    navigate('/voc');
                    return;
                }

                setVoc(fetchedVoc);
                setReplyText(fetchedVoc.reply || '');
            } catch (err) {
                console.error(err);
                alert('게시글을 불러오지 못했습니다.');
                navigate('/voc');
            } finally {
                setLoading(false);
            }
        };

        fetchVoc();
    }, [id, isStaff, userName, navigate]);

    const handleReplySubmit = async () => {
        if (!replyText.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }

        try {
            await axios.post(`http://localhost:5000/api/voc/${id}/reply`, { reply: replyText });
            alert('답변이 등록되었습니다.');

            const res = await axios.get(`http://localhost:5000/api/voc/${id}`);
            setVoc(res.data);
            setReplyText(res.data.reply || '');
        } catch (err) {
            console.error(err);
            alert('답변 등록에 실패했습니다.');
        }
    };

    if (loading) return <div style={{ padding: 40 }}>로딩 중...</div>;
    if (!voc) return <div style={{ padding: 40 }}>게시글을 찾을 수 없습니다.</div>;

    return (
        <div style={{ maxWidth: 700, margin: '40px auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <span style={{ backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: 20, fontSize: 13, color: '#475569', fontWeight: 'bold' }}>
                {voc.category || '의견'}
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 'bold', marginTop: 10, marginBottom: 14 }}>{voc.title}</h2>
            <div style={{ color: '#64748b', fontSize: 14, marginBottom: 20, borderBottom: '1px solid #e5e7eb', paddingBottom: 10 }}>
                <span>작성자: {voc.writer || voc.name}</span> | <span>날짜: {voc.date || '2026. 05. 19'}</span>
            </div>

            <div style={{ fontSize: 16, whiteSpace: 'pre-line', minHeight: 150 }}>
                {voc.content}
            </div>

            <div style={{ marginTop: 40, paddingTop: 20, borderTop: '2px dashed #e5e7eb' }}>
                <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>전문상담사 답변</h3>

                {isStaff ? (
                    <div>
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="작성자에게 보낼 피드백 및 답변 내용을 입력하세요..."
                            style={{ width: '100%', height: '100px', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', resize: 'none' }}
                        />
                        <button
                            onClick={handleReplySubmit}
                            style={{ marginTop: 8, padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', float: 'right' }}
                        >
                            답변 등록/수정
                        </button>
                    </div>
                ) : (
                    <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, minHeight: 60, color: voc.reply ? '#334155' : '#94a3b8', fontStyle: voc.reply ? 'normal' : 'italic' }}>
                        {voc.reply ? voc.reply : '상담사가 확인 중입니다. 잠시만 기다려주세요.'}
                    </div>
                )}
            </div>

            <button onClick={() => navigate('/voc')} style={{ marginTop: 40, padding: '10px 24px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
                목록으로
            </button>
        </div>
    );
}