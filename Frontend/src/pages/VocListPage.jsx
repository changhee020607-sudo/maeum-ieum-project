import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

    const [vocs, setVocs] = useState([]);
    const navigate = useNavigate();
    const { category } = useParams();

    const handleCategoryClick = (cat) => {
        if (cat === '전체') navigate('/voc');
        else navigate(`/voc/${encodeURIComponent(cat)}`);
    };

    useEffect(() => {
        const savedVocs = JSON.parse(localStorage.getItem('vocList') || "[]");
        const sortedVocs = savedVocs.sort((a, b) => Number(b.id) - Number(a.id));
            if (!category || category === '전체' || category === 'list') {
                setVocs(sortedVocs);
            } else {
                setVocs(sortedVocs.filter(v => v.category === category));
        }
    }, [category]);

    return (
        <div style={{ padding: '60px 20px', maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>{category || '전체'}</h2>

            <div style={{ marginBottom: '20px' }}>
                {['전체', '칭찬합니다', '건의합니다', '불편합니다'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        style={{
                            marginRight: 8,
                            padding: '8px 16px',
                            background: (category === cat || (!category && cat === '전체')) ? '#2563eb' : '#f1f5f9',
                            color: (category === cat || (!category && cat === '전체')) ? '#fff' : '#333',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <button 
                    onClick={() => navigate('/voc/register')} 
                    style={writeButtonStyle}
                >
                    문의하기
                </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: '2px solid #333' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee' }}><th style={listThStyle}>번호</th><th style={listThStyle}>제목</th><th style={listThStyle}>작성자</th><th style={listThStyle}>등록일</th></tr>
                </thead>
                <tbody>
                    {vocs.length > 0 ? (
                        vocs.map((item, index) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}><td style={listTdStyle}>{vocs.length - index}</td><td style={{ ...listTdStyle, textAlign: 'left', cursor: 'pointer', color: '#2563eb' }} onClick={() => navigate(`/voc/detail/${item.id}`)}>[{item.category}] {item.title}</td><td style={listTdStyle}>{item.name || item.writer}</td><td style={listTdStyle}>{item.date}</td></tr>
                        ))
                    ) : (
                        <tr><td colSpan="4" style={{ padding: '100px 0', textAlign: 'center', color: '#999' }}>등록된 게시글이 없습니다.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
    
const listThStyle = { padding: '15px', fontSize: '14px', fontWeight: 'bold' };
const listTdStyle = { padding: '15px', fontSize: '14px' };
const writeButtonStyle = { backgroundColor: '#2563eb', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' };