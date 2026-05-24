import React from 'react';

export default function FindUserInfo() {
    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>아이디 / 비밀번호 찾기</h2>
        <div style={{ marginTop: '20px' }}>
            <input type="email" placeholder="가입한 이메일 입력" style={{ padding: '10px', width: '250px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <button style={{ padding: '10px 20px', marginLeft: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px' }}>인증번호 발송</button>
        </div>
        <p style={{ marginTop: '20px', color: '#64748b' }}>이메일로 임시 비밀번호가 발송됩니다.</p>
        </div>
    );
}