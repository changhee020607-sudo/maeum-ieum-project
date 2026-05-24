import React from 'react';
import { useNavigate } from 'react-router-dom';

const containerStyle = { minHeight: '100vh', padding: '60px 20px', background: '#f8fafc', fontFamily: 'sans-serif' };
const heroSectionStyle = { textAlign: 'center', marginBottom: '60px' };
const titleStyle = { fontSize: '36px', color: '#1e293b', marginBottom: '15px', fontWeight: 'bold' };
const subtitleStyle = { fontSize: '18px', color: '#64748b' };

const menuGridStyle = { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
    gap: '30px', 
    maxWidth: '1100px', 
    margin: '0 auto' 
};

const adminMenuGridStyle = {
    display: 'flex',
    justifyContent: 'center',
    maxWidth: '500px',
    margin: '0 auto'
};

const cardStyle = { background: 'white', padding: '35px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', textAlign: 'left', transition: '0.3s', width: '100%' };
const cardTitleStyle = { fontSize: '20px', fontWeight: 'bold', marginBottom: '25px', paddingBottom: '12px', borderBottom: '2px solid #f1f5f9', color: '#334155' };
const listStyle = { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' };

const linkItemStyle = {
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    padding: '12px 0', 
    cursor: 'pointer',
    transition: 'color 0.2s',
    color: '#475569',
    fontSize: '15px',
    fontWeight: '500',
};

export default function Home({ setIsChatBotOpen }) {
    const nav = useNavigate();

    const handleChatEntryGuide = () => {
        alert('예약이 수락된 건만 채팅방 입장이 가능합니다. 마이페이지에서 진행해 주세요.');
        nav('/mypage');
    };
    
    const sessionUserStr = sessionStorage.getItem("user");
    const sessionRoleStr = sessionStorage.getItem("role");
    const sessionNameStr = sessionStorage.getItem("name");

    let userName = "사용자";
    let userRole = "user";
    let isLoggedIn = false;

    try {
        if (sessionUserStr && sessionUserStr !== 'undefined' && sessionUserStr !== 'null') {
            const parsed = JSON.parse(sessionUserStr);
            if (parsed) {
                userName = parsed.name || parsed.userName || "사용자";
                userRole = parsed.role || parsed.userRole || parsed.type || "user";
                isLoggedIn = true;
            }
        } else if (sessionNameStr || sessionRoleStr) {
            userName = sessionNameStr || "사용자";
            userRole = sessionRoleStr || "user";
            isLoggedIn = true;
        }
    } catch (e) {
        console.error("세션 데이터 파싱 오류:", e);
    }

    const finalRole = String(userRole).trim().toLowerCase();

    const isConsultant = finalRole === 'consultant' || finalRole === 'counselor' || finalRole === '상담사' || finalRole === 'teacher';
    const isAdmin = finalRole === 'admin' || finalRole === '관리자';

    return (
        <div style={containerStyle}>
            <div style={heroSectionStyle}>
                <h1 style={titleStyle}>마음을 연결하는 상담 플랫폼</h1>
                <p style={subtitleStyle}>당신에게 맞는 전문가를 만나보세요</p>
                {isLoggedIn && (
                    <p style={{ marginTop: '10px', color: '#2563eb', fontWeight: '500' }}>
                        {userName}님, 오늘 하루는 어떠신가요?
                    </p>
                )}
            </div>

            <div style={isAdmin ? adminMenuGridStyle : menuGridStyle}>
                
                {!isAdmin && !isConsultant && (
                    <div style={cardStyle}>
                        <h3 style={cardTitleStyle}>
                            {isConsultant ? '상담 관리' : '상담 예약'}
                        </h3>
                        <ul style={listStyle}>
                            {isConsultant ? (
                                <>
                                    <li onClick={() => nav('/check')} style={{...linkItemStyle, color: '#2563eb', fontWeight: 'bold'}}>
                                        📅 내 예약 확인
                                    </li>
                                    <li onClick={() => nav('/reserve/modify-list')} style={{...linkItemStyle, color: '#059669', fontWeight: 'bold'}}>
                                        ✓ 예약 최종 확인 및 관리
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li onClick={() => nav('/reserve/consultants')} style={{...linkItemStyle, color: '#2563eb', fontWeight: 'bold'}}>
                                        상담사 소개 및 예약하기
                                    </li>
                                    <li onClick={() => nav('/reserve/modify-list')} style={linkItemStyle}>
                                        예약 일정 변경
                                    </li>
                                    <li onClick={() => nav('/cancel')} style={{...linkItemStyle, color: '#ef4444', fontWeight: 'bold'}}>
                                        예약 취소하기
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                )}

                {!isAdmin && (
                    <div style={cardStyle}>
                        <h3 style={cardTitleStyle}>실시간 상담</h3>
                        <ul style={listStyle}>
                            <li onClick={handleChatEntryGuide} style={{ ...linkItemStyle, color: '#6366f1' }}>
                                💬 1:1 상담 채팅방 입장하기
                            </li>
                            <li onClick={() => setIsChatBotOpen(true)} style={{...linkItemStyle, color: '#4f46e5', fontWeight: 'bold', marginTop: '5px'}}>
                                🦾 AI 챗봇 (프로봇) 상담
                            </li>
                        </ul>
                    </div>
                )}

                <div style={cardStyle}>
                    <h3 style={cardTitleStyle}>고객 서비스</h3>
                    <ul style={listStyle}>
                        <li style={linkItemStyle} onClick={() => nav('/notices')}>
                            📢 <strong>공지사항</strong> {(isConsultant || isAdmin) && <span style={{fontSize: '12px', color: '#64748b', fontWeight: 'normal'}}>(작성/관리)</span>}
                        </li>
                        <li style={linkItemStyle} onClick={() => nav('/voc/list')}>
                            📢 고객의 소리 {(isConsultant || isAdmin) && <span style={{fontSize: '12px', color: '#64748b', fontWeight: 'normal'}}>(답글 관리)</span>}
                        </li>
                        
                        {isAdmin && (
                            <li style={{...linkItemStyle, color: '#dc2626', fontWeight: 'bold'}} onClick={() => nav('/admin')}>
                                ⚙️ 관리자 대시보드 (전체 권한)
                            </li>
                        )}

                        <div style={{ fontSize: '13px', color: '#94a3b8', marginLeft: '25px', marginBottom: '15px' }}></div>
                    </ul>
                </div>

            </div>
        </div>
    );
}