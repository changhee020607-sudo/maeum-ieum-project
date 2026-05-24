import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ userId: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                userId: formData.userId,
                password: formData.password
            });

            if (response.data.success) {
                const loginUser = response.data.user;


                sessionStorage.setItem("user", JSON.stringify(loginUser));
                sessionStorage.setItem("userId", loginUser.userId);
                localStorage.setItem("userId", loginUser.userId);
                localStorage.setItem("userRole", loginUser.role); // 관리자 권한 저장

                window.dispatchEvent(new Event("loginStatusChange"));

                navigate('/'); 
            }
        } catch (error) {
            console.error("로그인 에러:", error);
            if (error.response?.status === 401 || error.response?.status === 404) {
                alert(error.response.data.message);
            } else {
                alert("로그인 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div style={loginContainerStyle}>
            <div style={loginCardStyle}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#1e293b' }}>로그인</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>아이디</label>
                        <input 
                            type="text" 
                            name="userId" 
                            value={formData.userId} 
                            onChange={handleChange} 
                            style={inputStyle} 
                            placeholder="아이디를 입력하세요"
                            required 
                        />
                    </div>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={labelStyle}>비밀번호</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            style={inputStyle} 
                            placeholder="비밀번호를 입력하세요"
                            required 
                        />
                    </div>
                    <button type="submit" style={loginBtnStyle}>로그인</button>
                </form>

                <div style={linkAreaStyle}>
                    <span onClick={() => navigate('/find-id')} style={linkStyle}>아이디 찾기</span>
                    <span style={dividerStyle}>|</span>
                    <span onClick={() => navigate('/find-pw')} style={linkStyle}>비밀번호 찾기</span>
                    <span style={dividerStyle}>|</span>
                    <span onClick={() => navigate('/signup')} style={{ ...linkStyle, fontWeight: 'bold', color: '#2563eb' }}>회원가입</span>
                </div>
            </div>
        </div>
    );
}

const loginContainerStyle = { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '80vh', 
    backgroundColor: '#f8fafc' 
};

const loginCardStyle = { 
    width: '100%', 
    maxWidth: '400px', 
    padding: '40px', 
    backgroundColor: 'white', 
    borderRadius: '15px', 
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)' 
};

const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500'
};

const inputStyle = { 
    width: '100%', 
    padding: '12px', 
    borderRadius: '8px', 
    border: '1px solid #cbd5e1', 
    boxSizing: 'border-box',
    fontSize: '14px',
    outline: 'none'
};

const loginBtnStyle = { 
    width: '100%', 
    padding: '14px', 
    backgroundColor: '#2563eb', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: 'bold', 
    fontSize: '16px',
    transition: 'background-color 0.2s'
};

const linkAreaStyle = { 
    marginTop: '25px', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    fontSize: '14px', 
    color: '#64748b' 
};

const linkStyle = { 
    cursor: 'pointer',
    color: '#64748b',
    textDecoration: 'none'
};

const dividerStyle = { 
    margin: '0 10px', 
    color: '#e2e8f0', 
    fontSize: '12px' 
};