import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const consultants = [
    { 
        id: 1, name: '박준형 상담사', part: '진로/취업', off: '일요일, 월요일', img: '/images/p1.png', 
        desc: '대기업 인사팀 출신의 실무 중심 커리어 컨설팅',
        history: ['S전자 인사팀 10년 근무', '커리어 코칭 1급 자격', '취업 성공률 90% 달성'],
        style: '현실적이고 날카로운 피드백 위주의 상담을 선호합니다.'
    },
    { 
        id: 2, name: '이지아 상담사', part: '가족/연애', off: '일요일, 화요일', img: '/images/p2.png', 
        desc: '가족 상담 전문가가 제안하는 관계 회복 솔루션',
        history: ['가족심리상담센터 소장', '심리학 박사', '부부 관계 개선 세미나 다수 진행'],
        style: '공감과 경청을 바탕으로 마음의 상처를 먼저 치유합니다.'
    },
    { 
        id: 3, name: '김한결 상담사', part: '심리치유', off: '일요일, 수요일', img: '/images/p3.png', 
        desc: '지친 현대인을 위한 맞춤형 스트레스 관리',
        history: ['국제 공인 명상 가이드', '스트레스 관리 지도사 1급', '마음챙김 센터 전임 강사'],
        style: '편안한 분위기에서 내면의 소리에 집중할 수 있도록 돕습니다.'
    },
    { 
        id: 4, name: '최현우 상담사', part: '인간관계', off: '일요일, 목요일', img: '/images/p4.png', 
        desc: '직장 및 일상 속 대인관계 갈등 해결 전문',
        history: ['기업 내 갈등 조정관', '사회심리학 석사', '커뮤니케이션 스킬 전문 강사'],
        style: '갈등의 원인을 객관적으로 분석하고 실질적인 대화법을 제시합니다.'
    },
    { 
        id: 5, name: '정나래 상담사', part: '자기계발', off: '일요일, 금요일', img: '/images/p5.png', 
        desc: '학업 및 수험 생활 스트레스 전문 상담',
        history: ['라이프 코칭 전문가', '자기계발 베스트셀러 작가', '시간 관리 전략 컨설턴트'],
        style: '실행 가능한 작은 습관부터 시작해 큰 변화를 만드는 코칭을 지향합니다.'
    },
    { 
        id: 6, name: '강민석 상담사', part: '통합 상담', off: '월요일, 화요일', img: '/images/p6.png', 
        desc: '일요일 이용 고객을 위한 전 분야 통합 상담 서비스 (일요일 당직)',
        history: ['종합 심리상담 센터 운영', '임상심리사 1급 자격', '청소년-성인 통합 상담 경력 15년'],
        style: '다양한 상담 기법을 유연하게 사용하여 맞춤형 해결책을 드립니다.'
    },
    { 
        id: 7, name: '윤서연 상담사', part: '통합 상담', off: '목요일, 금요일', img: '/images/p7.png', 
        desc: '주말 집중 케어: 모든 고민에 대한 전문적 가이드 (일요일 당직)',
        history: ['심리 치료 교육 전문가', '예술 치료 학회 정회원', '상담 심리사 자격 보유'],
        style: '따뜻한 위로와 함께 문제 해결을 위한 명확한 가이드를 제공합니다.'
    },
    { 
        id: 8, name: '임소희 상담사', part: '청소년/교육', off: '일요일, 월요일', img: '/images/p8.png', 
        desc: '자녀 교육 고민과 청소년기 심리 변화를 위한 맞춤형 가이드',
        history: ['전직 교육 상담 교사', '청소년 심리 상담사 1급', '학습 동기 부여 전문 강사'],
        style: '청소년의 시선에서 공감하고 부모와의 가교 역할을 충실히 합니다.'
    },
];

export default function ConsultantDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const consultant = consultants.find(c => c.id === parseInt(id));

    if (!consultant) return <div style={{ textAlign: 'center', padding: '50px' }}>정보를 찾을 수 없습니다.</div>;

    return (
        <div style={pageBg}>
            <div style={profileCard}>
                <div style={headerSection}>
                    <div style={imgContainer}>
                        <img src={consultant.img} alt={consultant.name} style={imgStyle} />
                    </div>
                    <div style={nameBadge}>
                        <span style={partTag}>{consultant.part} 전문</span>
                        <h2 style={nameText}>{consultant.name}</h2>
                        <p style={oneLineDesc}>"{consultant.desc}"</p>
                    </div>
                </div>

                <div style={divider} />

                <div style={detailSection}>
                    <div style={infoBlock}>
                        <h4 style={infoTitle}>📋 주요 경력 및 자격</h4>
                        <ul style={listStyle}>
                            {consultant.history.map((h, i) => (
                                <li key={i} style={listItem}>{h}</li>
                            ))}
                        </ul>
                    </div>

                    <div style={infoBlock}>
                        <h4 style={infoTitle}>💡 상담 스타일</h4>
                        <p style={styleText}>{consultant.style}</p>
                    </div>

                    <div style={infoBlock}>
                        <h4 style={infoTitle}>🗓️ 정기 휴무</h4>
                        <p style={{ ...styleText, color: '#ef4444', fontWeight: 'bold' }}>{consultant.off}</p>
                    </div>
                </div>

                <div style={divider} />

                <div style={btnArea}>
                    <button onClick={() => navigate('/consultants')} style={backBtn}>목록 돌아가기</button>
                    <button onClick={() => navigate(`/reserve/date/${consultant.id}`)} style={mainBtn}>예약 일정 잡기</button>
                </div>
            </div>
        </div>
    );
}

const pageBg = { padding: '60px 20px', background: '#f8fafc', minHeight: '100vh' };
const profileCard = { maxWidth: '700px', margin: '0 auto', background: 'white', borderRadius: '30px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' };
const headerSection = { display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '10px', textAlign: 'left' };
const imgContainer = { width: '140px', height: '140px', borderRadius: '25px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const nameBadge = { flex: 1 };
const partTag = { color: '#2563eb', fontWeight: 'bold', fontSize: '14px' };
const nameText = { fontSize: '26px', margin: '5px 0', color: '#1e293b' };
const oneLineDesc = { color: '#64748b', fontSize: '15px', fontStyle: 'italic' };
const divider = { height: '1px', background: '#f1f5f9', margin: '30px 0' };
const detailSection = { textAlign: 'left' };
const infoBlock = { marginBottom: '25px' };
const infoTitle = { fontSize: '18px', marginBottom: '12px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' };
const listStyle = { paddingLeft: '20px', margin: 0 };
const listItem = { color: '#475569', marginBottom: '8px', fontSize: '15px' };
const styleText = { color: '#475569', fontSize: '15px', lineHeight: '1.6', margin: 0 };
const btnArea = { display: 'flex', gap: '15px' };
const backBtn = { flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: 'bold' };
const mainBtn = { flex: 1, padding: '15px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 'bold' };