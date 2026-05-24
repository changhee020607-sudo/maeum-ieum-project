import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const COUNSELOR_CODES = {
    "박준형": "1001",
    "이지아": "1002",
    "김한결": "1003",
    "최현우": "1004",
    "정나래": "1005",
    "강민석": "1006",
    "윤서연": "1007",
    "임소희": "1008"
};

export default function Signup() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isIdChecked, setIsIdChecked] = useState(false);
    const [idMessage, setIdMessage] = useState("");
    
    const [formData, setFormData] = useState({
        userId: '',
        password: '',
        confirmPassword: '',
        userName: '',
        email: '',
        phone: '',
        role: '',
        adminCode: '',
        counselorCode: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'userId') {
            setIsIdChecked(false);
        }
    };

    const checkDuplicate = async () => {
        if (!formData.userId) {
            setIdMessage("아이디를 입력해주세요.");
            setIsIdChecked(false);
            return;
        }
        try {
            const response = await axios.get(`http://localhost:5000/api/check-id/${formData.userId}`);
            if (response.data.isDuplicate) {
                setIdMessage("이미 사용 중인 아이디입니다.");
                setIsIdChecked(false);
            } else {
                setIdMessage(`${formData.userId}은(는) 사용 가능한 아이디입니다!`);
                setIsIdChecked(true);
            }
        } catch (error) {
            console.error("중복 확인 에러:", error);
            setIdMessage("중복 확인 중 오류가 발생했습니다.");
            setIsIdChecked(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isIdChecked) {
            alert("아이디 중복 확인을 먼저 진행해주세요.");
            return;
        }

        if (!formData.role) {
            alert("역할을 선택해주세요.");
            return;
        }

        if (formData.role === 'ADMIN' && formData.adminCode !== 'ADMIN1234') {
            alert("관리자 인증 코드가 올바르지 않습니다.");
            return;
        }

        if (formData.role === 'COUNSELOR') {
            const validCode = COUNSELOR_CODES[formData.userName];
            
            if (!validCode) {
                alert("등록된 상담사 명단에 없는 이름입니다. 실명을 정확히 입력해주세요.");
                return;
            }
            
            if (formData.counselorCode !== validCode) {
                alert(`${formData.userName} 상담사님의 자격코드가 일치하지 않습니다.`);
                return;
            }
        }

        if (formData.password !== formData.confirmPassword) {
            alert("비밀번호가 일치하지 않습니다!");
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/signup', {
                userId: formData.userId,
                password: formData.password,
                userName: formData.userName,
                email: formData.email,
                phone: formData.phone,
                role: formData.role
            });

            if (response.status === 201 || response.data.message === "회원가입 성공!") {
                alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
                navigate('/login');
            }
        } catch (error) {
            console.error("회원가입 에러:", error);
            alert(error.response?.data?.message || "회원가입 중 오류가 발생했습니다.");
        }
    };

    return (
        <div style={authContainerStyle}>
            <div style={authCardStyle}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>회원가입</h2>
                <form onSubmit={handleSubmit}>
                    
                    <div style={inputGroupStyle}>
                        <label>아이디</label>
                        <input 
                            type="text" name="userId" 
                            value={formData.userId} onChange={handleChange}
                            onBlur={checkDuplicate}
                            style={{ ...inputStyle, marginTop: 0 }} required 
                        />
                        <span style={{ fontSize: '13px', color: isIdChecked ? '#22c55e' : '#ef4444', marginTop: '4px', display: 'block', minHeight: '18px' }}>{idMessage}</span>
                    </div>

                    <div style={inputGroupStyle}>
                        <label>이름 {formData.role === 'COUNSELOR' && <span style={{fontSize:'12px', color:'#6366f1'}}>(상담사 실명)</span>}</label>
                        <input 
                            type="text" name="userName" 
                            placeholder={formData.role === 'COUNSELOR' ? "예: 박준형" : "성함을 입력하세요"}
                            value={formData.userName} onChange={handleChange} 
                            style={inputStyle} required 
                        />
                    </div>

                    <div style={inputGroupStyle}>
                        <label>이메일</label>
                        <input 
                            type="email" name="email" 
                            placeholder={formData.role === 'COUNSELOR' ? "예: career@best.com" : "이메일을 입력하세요"}
                            value={formData.email} onChange={handleChange} 
                            style={inputStyle} required 
                        />
                    </div>

                    <div style={inputGroupStyle}>
                        <label>휴대폰 번호</label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="01012345678"
                            value={formData.phone}
                            onChange={handleChange}
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div style={inputGroupStyle}>
                        <label>역 할</label>
                        <select 
                            name="role" 
                            value={formData.role} 
                            onChange={handleChange} 
                            style={{ ...inputStyle, cursor: 'pointer' }} 
                            required
                        >
                            <option value="">:::역할 선택:::</option>
                            <option value="USER">일반 사용자 (USER)</option>
                            <option value="COUNSELOR">전문 상담사 (COUNSELOR)</option>
                            <option value="ADMIN">관리자 (ADMIN)</option>
                        </select>
                    </div>

                    {formData.role === 'ADMIN' && (
                        <div style={inputGroupStyle}>
                            <label style={{ color: '#ef4444', fontWeight: 'bold' }}>관리자 인증 코드</label>
                            <input 
                                type="password" 
                                name="adminCode"
                                placeholder="관리자 전용 코드를 입력하세요"
                                value={formData.adminCode} 
                                onChange={handleChange} 
                                style={{ ...inputStyle, borderColor: '#ef4444' }} 
                                required 
                            />
                        </div>
                    )}

                    {formData.role === 'COUNSELOR' && (
                        <div style={inputGroupStyle}>
                            <label style={{ color: '#6366f1', fontWeight: 'bold' }}>상담사 자격코드</label>
                            <input 
                                type="password" 
                                name="counselorCode"
                                placeholder="발급받은 4자리 자격코드를 입력하세요"
                                value={formData.counselorCode} 
                                onChange={handleChange} 
                                style={{ ...inputStyle, borderColor: '#6366f1' }} 
                                required 
                            />
                        </div>
                    )}

                    <div style={inputGroupStyle}>
                        <label>비밀번호</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password" value={formData.password} onChange={handleChange} 
                                style={inputStyle} required 
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                style={showBtnStyle}
                            >
                                {showPassword ? "👁️" : "🔒"}
                            </button>
                        </div>
                    </div>

                    <div style={inputGroupStyle}>
                        <label>비밀번호 확인</label>
                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} style={inputStyle} required />
                    </div>

                    <button type="submit" style={authBtnStyle}>가입하기</button>
                </form>
            </div>
        </div>
    );
}

const authContainerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: '#f8fafc' };
const authCardStyle = { width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' };
const inputGroupStyle = { marginBottom: '20px' };
const inputStyle = { width: '100%', padding: '12px', marginTop: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
const showBtnStyle = { position: 'absolute', right: '10px', top: '20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' };
const authBtnStyle = { width: '100%', padding: '14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' };