import React, { useState } from 'react';

const inputGroupStyle = { marginBottom: '18px' };
const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '15px' };

function Register() {
  const [role, setRole] = useState('user');
  const [counselorCode, setCounselorCode] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setCounselorCode('');
    setAdminPassword('');
  };

  const handleCounselorCodeChange = (e) => setCounselorCode(e.target.value);
  const handleAdminPasswordChange = (e) => setAdminPassword(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (role === 'counselor') {
      const VALID_CODES = [
        "CERT-PARK-01", "CERT-LEE-02", "CERT-KIM-03", "CERT-CHOI-04",
        "CERT-JUNG-05", "CERT-KANG-06", "CERT-YOON-07", "CERT-LIM-08"
      ];

      if (!VALID_CODES.includes(counselorCode)) {
        alert('등록된 상담사 자격코드가 아닙니다. 본인의 코드를 확인해주세요.');
        return;
      }

      const counselorNames = {
        "CERT-PARK-01": "박준형", "CERT-LEE-02": "이지아", "CERT-KIM-03": "김한결",
        "CERT-CHOI-04": "최현우", "CERT-JUNG-05": "정나래", "CERT-KANG-06": "강민석",
        "CERT-YOON-07": "윤서연", "CERT-LIM-08": "임소희"
      };
      alert(`${counselorNames[counselorCode]} 상담사님, 가입을 환영합니다!`);
    }

    if (role === 'admin') {
      const ADMIN_MASTER_PW = "admin77";
      if (adminPassword !== ADMIN_MASTER_PW) {
        alert('관리자 인증 비밀번호가 일치하지 않습니다.');
        return;
      }
      alert('관리자 회원가입을 환영합니다!');
    }
    if (role === 'user') {
      alert('일반회원 가입을 환영합니다!');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 30 }}>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div className="role-selection" style={inputGroupStyle}>
          <label><input type="radio" name="role" value="user" checked={role === 'user'} onChange={handleRoleChange} /> 일반회원</label>{' '}
          <label><input type="radio" name="role" value="counselor" checked={role === 'counselor'} onChange={handleRoleChange} /> 상담사</label>{' '}
          <label><input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={handleRoleChange} /> 관리자</label>
        </div>

        {role === 'counselor' && (
          <div style={inputGroupStyle}>
            <label style={labelStyle}>상담사 자격코드</label>
            <input
              type="text"
              placeholder="발급받은 자격번호를 입력하세요"
              style={inputStyle}
              value={counselorCode}
              onChange={handleCounselorCodeChange}
              required
            />
          </div>
        )}

        {role === 'admin' && (
          <div style={inputGroupStyle}>
            <label style={labelStyle}>관리자 인증 비밀번호</label>
            <input
              type="password"
              placeholder="관리자 전용 비밀번호 입력"
              style={inputStyle}
              value={adminPassword}
              onChange={handleAdminPasswordChange}
              required
            />
          </div>
        )}

        <div style={inputGroupStyle}>
          <label style={labelStyle}>이메일</label>
          <input type="email" style={inputStyle} required />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>비밀번호</label>
          <input type="password" style={inputStyle} required />
        </div>

        <button type="submit" style={{ ...inputStyle, background: '#222', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginTop: 18 }}>회원가입</button>
      </form>
    </div>
  );
}

export default Register;
