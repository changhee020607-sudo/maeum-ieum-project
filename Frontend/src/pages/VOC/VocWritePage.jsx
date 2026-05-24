import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VocWritePage() {
    const navigate = useNavigate();
    const [content, setContent] = useState({ 
        title: '', 
        text: '', 
        category: '칭찬합니다'
    });

    const handleRegister = () => {
        if (!content.title.trim() || !content.text.trim()) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }

        const existingVocs = JSON.parse(localStorage.getItem('vocList') || "[]");

        const now = new Date();
        const dateOnly = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}. ${String(now.getDate()).padStart(2, '0')}.`;
        const timeOnly = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

        const newVoc = {
            id: Date.now(),
            title: content.title,
            content: content.text,
            category: content.category,
            name: JSON.parse(sessionStorage.getItem('user'))?.userName || "익명",
            writer: JSON.parse(sessionStorage.getItem('user'))?.userName || "익명", 
            date: dateOnly,
            time: timeOnly,
            fullTime: `${dateOnly} ${timeOnly}`,
            views: 0
        };

        localStorage.setItem('vocList', JSON.stringify([newVoc, ...existingVocs]));

        alert('등록되었습니다!');
        
        navigate(`/voc/${content.category}`); 
    };

    return (
        <div style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '30px', fontWeight: 'bold' }}>문의하기</h2>
            
            <select 
                style={inputStyle}
                value={content.category}
                onChange={(e) => setContent({...content, category: e.target.value})}
            >
                <option value="칭찬합니다">칭찬합니다</option>
                <option value="불편합니다">불편합니다</option>
                <option value="건의합니다">건의합니다</option>
            </select>

            <input 
                type="text" 
                placeholder="제목을 입력하세요" 
                style={inputStyle}
                value={content.title}
                onChange={(e) => setContent({...content, title: e.target.value})}
            />
            
            <textarea 
                placeholder="상세 내용을 입력하세요" 
                style={{ ...inputStyle, height: '250px', resize: 'none' }}
                value={content.text}
                onChange={(e) => setContent({...content, text: e.target.value})}
            ></textarea>
            
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button 
                    onClick={() => navigate('/voc')} 
                    style={cancelBtnStyle}
                >
                    취소
                </button>
                <button 
                    onClick={handleRegister} 
                    style={submitBtnStyle}
                >
                    등록하기
                </button>
            </div>
        </div>
    );
}

const inputStyle = { 
    width: '100%', 
    padding: '15px', 
    marginBottom: '15px', 
    borderRadius: '10px', 
    border: '1px solid #e2e8f0', 
    fontSize: '16px',
    boxSizing: 'border-box'
};

const cancelBtnStyle = { 
    flex: 1, 
    padding: '15px', 
    backgroundColor: '#f1f5f9', 
    border: 'none', 
    borderRadius: '10px', 
    fontWeight: 'bold',
    cursor: 'pointer' 
};

const submitBtnStyle = { 
    flex: 2, 
    padding: '15px', 
    backgroundColor: '#2563eb', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    fontWeight: 'bold',
    cursor: 'pointer' 
};