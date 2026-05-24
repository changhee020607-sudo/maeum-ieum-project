import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function FindId() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [verifyToken, setVerifyToken] = useState('');
    const [foundId, setFoundId] = useState('');

    const handleSendCode = async () => {
        if (!userName.trim() || !phone.trim()) {
            alert('이름과 휴대폰 번호를 입력해 주세요.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/phone/send-code', {
                purpose: 'find-id',
                userName: userName.trim(),
                phone: phone.trim()
            });

            const devCode = response?.data?.devCode;
            const quotaLabel = response?.data?.quotaLabel;
            alert(devCode
                ? `인증번호가 발급되었습니다.\n인증번호: ${devCode}${quotaLabel ? `\n${quotaLabel}` : ''}`
                : `인증번호가 발급되었습니다.${quotaLabel ? `\n${quotaLabel}` : ''}`);
        } catch (error) {
            alert(error?.response?.data?.message || '인증번호 발급에 실패했습니다.');
        }
    };

    const handleVerifyCode = async () => {
        if (!code.trim()) {
            alert('인증번호를 입력해 주세요.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/phone/verify-code', {
                purpose: 'find-id',
                userName: userName.trim(),
                phone: phone.trim(),
                code: code.trim()
            });
            setVerifyToken(response.data.verifyToken);
            alert('휴대폰 인증이 완료되었습니다.');
        } catch (error) {
            alert(error?.response?.data?.message || '인증번호 확인에 실패했습니다.');
        }
    };

    const handleFindId = async () => {
        if (!verifyToken) {
            alert('먼저 인증번호 확인을 완료해 주세요.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/find-id-by-phone', {
                userName: userName.trim(),
                phone: phone.trim(),
                verifyToken
            });
            setFoundId(response?.data?.userId || '');
        } catch (error) {
            alert(error?.response?.data?.message || '아이디 조회에 실패했습니다.');
        }
    };

    return (
        <div style={containerStyle}>
        <div style={cardStyle}>
            <h2>아이디 찾기</h2>
            <p style={descStyle}>가입한 이름과 휴대폰 번호를 입력하고 인증을 완료해 주세요.</p>
            <input
                type="text"
                placeholder="이름 입력"
                style={inputStyle}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
            />
            <input
                type="tel"
                placeholder="휴대폰 번호 (01012345678)"
                style={inputStyle}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />
            <button style={btnStyle} onClick={handleSendCode}>인증번호 발송</button>

            <input
                type="text"
                placeholder="인증번호 입력"
                style={inputStyle}
                value={code}
                onChange={(e) => setCode(e.target.value)}
            />
            <button style={btnStyle} onClick={handleVerifyCode}>인증번호 확인</button>
            <button style={btnStyle} onClick={handleFindId}>아이디 찾기</button>

            {foundId && <p style={{ marginTop: '12px', fontWeight: 'bold' }}>조회된 아이디: {foundId}</p>}
            <button style={backBtnStyle} onClick={() => navigate('/login')}>로그인으로 돌아가기</button>
        </div>
        </div>
    );
}

const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: '#f8fafc' };
const cardStyle = { width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center' };
const descStyle = { color: '#64748b', fontSize: '14px', marginBottom: '20px' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' };
const backBtnStyle = { width: '100%', padding: '14px', backgroundColor: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', fontSize: '14px', marginTop: '10px' };