import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function NoticeEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: '', content: '' });
    const [loading, setLoading] = useState(false);
    
    const userRole = localStorage.getItem('userRole')?.toUpperCase() || '';

    useEffect(() => {
        if (userRole !== 'ADMIN' && userRole !== 'COUNSELOR') {
            alert('관리자 및 상담사만 접근 가능합니다.');
            navigate('/notices');
            return;
        }
        const fetchNotice = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/notices/${id}`);
                setForm({ title: res.data.title, content: res.data.content });
            } catch (err) {
                alert('공지사항 정보를 불러오지 못했습니다.');
                navigate('/notices');
            }
        };
        fetchNotice();
    }, [id, navigate, userRole]);

    if (userRole !== 'ADMIN' && userRole !== 'COUNSELOR') return null;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`http://localhost:5000/api/notices/${id}`, form);
            alert('공지사항이 수정되었습니다.');
            navigate('/notices');
        } catch (err) {
            alert('수정에 실패했습니다.');
        } finally {
            loading(false);
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: '40px auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>공지사항 수정</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>제목</label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 16 }}
                        required
                    />
                </div>
                <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>내용</label>
                    <textarea
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        rows={8}
                        style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 16, resize: 'vertical' }}
                        required
                    />
                </div>
                <button type="submit" disabled={loading} style={{ padding: '10px 28px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
                    {loading ? '수정 중...' : '수정하기'}
                </button>
                <button type="button" onClick={() => navigate(-1)} style={{ marginLeft: 12, padding: '10px 28px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
                    취소
                </button>
            </form>
        </div>
    );
}