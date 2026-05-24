import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function NoticeWrite() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();
    
    const userRole = localStorage.getItem('userRole')?.toUpperCase() || '';

    const storedName = localStorage.getItem('userName') || '박준형'; 
    const isCounselor = userRole === 'COUNSELOR';
    
    const displayWriter = isCounselor ? `${storedName} 상담사` : '관리자';

    useEffect(() => {
        if (userRole !== 'ADMIN' && userRole !== 'COUNSELOR') {
            alert('관리자 및 상담사만 접근 가능합니다.');
            navigate('/notices');
        }
    }, [userRole, navigate]);

    if (userRole !== 'ADMIN' && userRole !== 'COUNSELOR') return null;

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }
        try {
            const combinedTitle = `[${displayWriter}] ${title}`;

            await axios.post('http://localhost:5000/api/notices', { 
                title: combinedTitle, 
                content
            });
            
            alert("공지사항이 등록되었습니다.");
            navigate('/notices');
        } catch (err) {
            console.error(err);
            alert("공지사항 등록에 실패했습니다.");
        }
    };

    return (
        <div style={{ padding: '50px', maxWidth: '700px', margin: '0 auto' }}>
            <h2>📢 공지사항 작성</h2>
            
            <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>제목</label>
                <input 
                    type="text" 
                    placeholder="제목을 입력하세요" 
                    onChange={(e) => setTitle(e.target.value)} 
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} 
                />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>내용</label>
                <textarea 
                    placeholder="내용을 입력하세요" 
                    onChange={(e) => setContent(e.target.value)} 
                    style={{ width: '100%', height: '200px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} 
                />
            </div>

            <button 
                onClick={handleSubmit} 
                style={{ marginTop: '10px', padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
                등록하기
            </button>
        </div>
    );
}