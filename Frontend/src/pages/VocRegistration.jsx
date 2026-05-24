import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function VocRegistration() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        category: '칭찬합니다',
        title: '',
        content: ''
    });

    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (user) {
            setFormData(prev => ({ 
                ...prev, 
                name: user.userName, 
                email: user.userId ? `${user.userId}@example.com` : "" 
            }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'content' && value.length > 5000) return;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const now = new Date();
        const dateString = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}. ${String(now.getDate()).padStart(2, '0')}.`;

        const submitData = {
            ...formData,
            date: dateString
        };

        try {
            const response = await axios.post('http://localhost:5000/api/voc', submitData);
            if (response.status === 200) {
                const vocList = JSON.parse(localStorage.getItem('vocList') || "[]");
                const newId = vocList.length ? Math.max(...vocList.map(v => Number(v.id) || 0)) + 1 : 1;
                const newVoc = { ...submitData, id: newId };
                localStorage.setItem('vocList', JSON.stringify([newVoc, ...vocList]));

                alert("접수가 완료되었습니다.");
                navigate(`/voc/${formData.category}`); 
            }
        } catch (error) {
            console.error("데이터 전송 실패:", error);
            alert("서버 연결에 실패했습니다. 백엔드 서버와 DB 상태를 확인해주세요.");
        }
    };

    return (
        <div style={{ padding: '60px 20px', maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>고객의 소리 접수</h2>
            
            <div style={noticeBoxStyle}>
                <ul style={{ paddingLeft: '20px', color: '#666', fontSize: '14px', lineHeight: '1.8' }}>
                    <li>게시판 성격에 맞지 않는 게시물은 사전 통보 없이 삭제될 수 있습니다.</li>
                    <li>자동 로그아웃 등에 의해 내용 저장이 안 될 수 있으니 메모장 등에서 작성 후 등록해 주세요.</li>
                </ul>
            </div>

            <form onSubmit={handleSubmit} style={{ borderTop: '2px solid #333' }}>
                <table style={tableStyle}>
                    <tbody>
                        <tr style={trStyle}>
                            <th style={thStyle}>구분 *</th>
                            <td style={tdStyle}>
                                <select 
                                    name="category" 
                                    value={formData.category} 
                                    onChange={handleChange} 
                                    style={inputStyle}
                                >
                                    <option value="칭찬합니다">칭찬합니다</option>
                                    <option value="불편합니다">불편합니다</option>
                                    <option value="건의합니다">건의합니다</option>
                                </select>
                            </td>
                        </tr>
                        <tr style={trStyle}>
                            <th style={thStyle}>성명 *</th>
                            <td style={tdStyle}>
                                <input 
                                    name="name" 
                                    placeholder="성명을 입력해 주세요" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    required 
                                    style={inputStyle} 
                                />
                            </td>
                        </tr>
                        <tr style={trStyle}>
                            <th style={thStyle}>이메일 *</th>
                            <td style={tdStyle}>
                                <input 
                                    name="email" 
                                    type="email" 
                                    placeholder="example@mail.com" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                    style={inputStyle} 
                                />
                            </td>
                        </tr>
                        <tr style={trStyle}>
                            <th style={thStyle}>제목 *</th>
                            <td style={tdStyle}>
                                <input 
                                    name="title" 
                                    placeholder="제목을 입력해 주세요" 
                                    value={formData.title} 
                                    onChange={handleChange} 
                                    required 
                                    style={inputStyle} 
                                />
                            </td>
                        </tr>
                        <tr style={trStyle}>
                            <th style={thStyle}>내용 *</th>
                            <td style={tdStyle}>
                                <textarea 
                                    name="content" 
                                    rows="10" 
                                    placeholder="개인정보 유의 및 내용을 입력해주세요." 
                                    value={formData.content} 
                                    onChange={handleChange} 
                                    required 
                                    style={{ ...inputStyle, height: '200px', padding: '15px' }} 
                                />
                                <div style={{ textAlign: 'right', fontSize: '12px', color: '#999', marginTop: '5px' }}>
                                    {formData.content.length.toLocaleString()} / 5,000 Bytes
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <button type="submit" style={submitButtonStyle}>접수하기</button>
                </div>
            </form>
        </div>
    );
}

const noticeBoxStyle = { backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef', marginBottom: '40px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const trStyle = { borderBottom: '1px solid #eee' };
const thStyle = { width: '180px', padding: '20px', textAlign: 'left', backgroundColor: '#fcfcfc', fontSize: '14px' };
const tdStyle = { padding: '15px' };
const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' };
const submitButtonStyle = { backgroundColor: '#000', color: '#fff', padding: '15px 60px', border: 'none', borderRadius: '30px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' };