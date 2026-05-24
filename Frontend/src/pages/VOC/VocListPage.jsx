import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const filterBtnStyle = { padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', borderTop: '2px solid #1e293b' };
const thRowStyle = { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'center', fontSize: '14px' };
const trStyle = { borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s' };
const writeBtnStyle = { padding: '12px 24px', backgroundColor: '#000', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' };

export default function VocListPage() {
    const navigate = useNavigate();
    let { category } = useParams();
    // category가 undefined, null, 빈문자열, '전체'일 때 모두 전체 VOC 보여주기
    const isAll = !category || category === '전체';
    const [vocs, setVocs] = useState([]);

    useEffect(() => {
        const fetchVocList = async () => {
            try {
                const storedRole = (localStorage.getItem('userRole') || '').toUpperCase();
                const userRole = storedRole === 'CONSULTANT' ? 'COUNSELOR' : storedRole;
                const sessionUser = JSON.parse(sessionStorage.getItem('user') || '{}');
                const userName = localStorage.getItem('userName') || sessionUser.userName || sessionUser.name || '';

                const res = await axios.get('http://localhost:5000/api/voc', {
                    params: { userRole, userName },
                });

                const sortedVocs = [...(res.data || [])].sort((a, b) => Number(b.id) - Number(a.id));
                if (isAll) {
                    setVocs(sortedVocs);
                } else {
                    setVocs(sortedVocs.filter((v) => String(v.category) === String(category)));
                }
            } catch (err) {
                console.error('고객의 소리를 불러오지 못했습니다.', err);
                setVocs([]);
            }
        };

        fetchVocList();
    }, [category, isAll]);

    const handleCategoryClick = (cat) => {
        if (cat === '전체') navigate('/voc');
        else navigate(`/voc/${encodeURIComponent(cat)}`);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) {
            return;
        }

        try {
            await axios.delete(`http://localhost:5000/api/voc/${id}`);
            alert("성공적으로 삭제되었습니다.");
            setVocs((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            console.error(err);
            alert("삭제에 실패했습니다. 서버 상태를 확인해주세요.");
        }
    };

    return (
        <div style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>
                    📢 고객의 소리
                </h2>
                <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6' }}>
                    서비스 이용 중 느끼신 칭찬, 불편함, 건의사항을 자유롭게 남겨주세요.<br />
                    보내주신 소중한 의견은 더 나은 서비스를 만드는 데 큰 힘이 됩니다.
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['전체', '칭찬합니다', '불편합니다', '건의합니다'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
                            style={{
                                ...filterBtnStyle,
                                backgroundColor: (category === cat || (!category && cat === '전체')) ? '#3b82f6' : '#f1f5f9',
                                color: (category === cat || (!category && cat === '전체')) ? 'white' : '#64748b',
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <button onClick={() => navigate('/voc/register')} style={writeBtnStyle}>
                    ✍️ 의견 남기기
                </button>
            </div>

            <table style={tableStyle}>
                <thead>
                    <tr style={thRowStyle}><th style={{ width: '80px', padding: '15px' }}>번호</th><th style={{ width: '120px' }}>구분</th><th>제목</th><th style={{ width: '120px' }}>작성자</th><th style={{ width: '150px' }}>날짜</th><th style={{ width: '100px' }}>관리</th></tr>
                </thead>
                <tbody>
                    {vocs.length > 0 ? (
                        vocs.map((v, index) => (
                            <tr key={v.id} style={trStyle} onClick={() => navigate(`/voc/detail/${v.id}`)}>
                                <td style={{ textAlign: 'center', padding: '15px' }}>{vocs.length - index}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={getCategoryStyle(v.category)}>{v.category || '일반'}</span>
                                </td>
                                <td style={{ cursor: 'pointer', fontWeight: '500' }}>{v.title}</td>
                                <td style={{ textAlign: 'center' }}>{v.name || v.writer}</td>
                                <td style={{ textAlign: 'center', color: '#94a3b8' }}>{v.date || '2026. 05. 12.'}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <button 
                                        onClick={(e) => handleDelete(e, v.id)}
                                        style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}
                                    >
                                        삭제
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>등록된 게시글이 없습니다.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

const getCategoryStyle = (cat) => {
    let color = '#64748b';
    let bgColor = '#f1f5f9';
    if (cat === '칭찬합니다') { color = '#059669'; bgColor = '#ecfdf5'; }
    else if (cat === '불편합니다') { color = '#dc2626'; bgColor = '#fef2f2'; }
    else if (cat === '건의합니다') { color = '#2563eb'; bgColor = '#eff6ff'; }
    return { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', color, backgroundColor: bgColor };
};