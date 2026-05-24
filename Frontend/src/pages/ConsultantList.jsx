import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ConsultantListPage = () => {
    const [openDetailId, setOpenDetailId] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const consultants = [
        { 
            id: 1, name: '박준형', specialized: '커리어 컨설팅', offDay: '일요일, 월요일', image: '/images/p1.png',
            qualification: '상담심리사 1급, 직업상담사 1급',
            career: '대기업 인사팀 10년 근무, 커리어 코칭 500회 이상',
            description: '실전 면접 전략 및 포트폴리오 최적화 전문 전문가입니다.'
        },
        { 
            id: 2, name: '이지아', specialized: '가족/연애 상담', offDay: '일요일, 화요일', image: '/images/p2.png',
            qualification: '가족상담사 1급, 청소년상담사 2급',
            career: '심리상담센터 수석연구원, 부부관계 개선 프로젝트 참여',
            description: '감정 소통의 기술과 관계 회복을 위한 맞춤 솔루션을 제공합니다.'
        },
        { 
            id: 3, name: '김한결', specialized: '학업/스트레스', offDay: '일요일, 수요일', image: '/images/p3.png',
                qualification: '임상심리사 2급, 자기주도학습 코칭 전문가',
            career: '교육청 상담 교사 역임, 청소년 스트레스 관리 프로그램 개발',
            description: '학습 동기 부여와 시험 불안 해소를 위한 심리적 지지를 제공합니다.'
        },
        { 
            id: 4, name: '최현우', specialized: '자산관리', offDay: '일요일, 목요일', image: '/images/p4.png',
            qualification: 'AFPK(재무설계사), 투자자산운용사',
            career: '금융권 자산관리팀 8년 근무, 개인 재무 로드맵 컨설팅 다수',
            description: '객관적인 데이터를 바탕으로 한 스마트한 자산 운용 전략을 제안합니다.'
        },
        { 
            id: 5, name: '정나래', specialized: '법률 자문', offDay: '일요일, 금요일', image: '/images/p5.png',
            qualification: '변호사 자격증, 노무사 자격 보유',
            career: '법무법인 파트너 변호사, 중소기업 법률 자문위원',
            description: '어려운 법률 용어를 쉽게 풀어 실질적인 법적 해결책을 찾아드립니다.'
        },
        { 
            id: 6, name: '강민석', specialized: 'IT 컨설팅', offDay: '월요일, 화요일', image: '/images/p6.png',
            qualification: 'PMP(프로젝트 관리 전문가), 정보처리기사',
            career: 'IT 기업 CTO 출신, 테크 스타트업 기술 멘토링 7년',
            description: '기술 역량 강화 및 디지털 전환 전략 수립을 명쾌하게 도와드립니다.'
        },
        { 
            id: 7, name: '윤서연', specialized: '디자인 코칭', offDay: '목요일, 금요일', image: '/images/p7.png',
            qualification: '시각디자인 기사, 서비스경험디자인 전문가',
            career: '디자인 에이전시 팀장, 브랜드 아이덴티티 구축 컨설턴트',
            description: '심미적 완성도를 넘어 비즈니스 가치를 높이는 디자인을 코칭합니다.'
        },
        { 
            id: 8, name: '임소희', specialized: '마케팅 전략', offDay: '일요일, 월요일', image: '/images/p8.png',
            qualification: '구글 마케팅 전문가 인증, 데이터분석 준전문가(ADsP)',
            career: '글로벌 광고 대행사 재직, 이커머스 매출 성장 프로젝트 주도',
            description: '데이터에 기반한 타겟팅 전략으로 확실한 마케팅 성과를 만들어냅니다.'
        },
    ];

    const handleConsultantSelect = (consultant) => {
        navigate(`/reserve/calendar/${consultant.id}`, {
            state: {
                ...location.state,
                consultantName: consultant.name
            }
        });
    };

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '35px', textAlign: 'center' }}>전문 상담사 소개</h2>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '25px' 
            }}>
                {consultants.map((c) => (
                    <div key={c.id} style={{ 
                        border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden', 
                        backgroundColor: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        display: 'flex', flexDirection: 'column',
                        cursor: 'pointer'
                    }}
                    onClick={() => handleConsultantSelect(c)}
                    >
                        <img 
                            src={c.image} 
                            alt={c.name} 
                            style={{ width: '100%', height: '220px', objectFit: 'cover' }} 
                        />
                        
                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 'bold', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '6px' }}>
                                    {c.specialized}
                                </span>
                                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '10px' }}>{c.name} 상담사</h3>
                            </div>
                            
                            {openDetailId === c.id && (
                                <div style={{ 
                                    backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', 
                                    fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '20px',
                                    border: '1px solid #f1f5f9', animation: 'fadeIn 0.3s'
                                }}>
                                    <div style={{ marginBottom: '12px' }}>
                                        <strong style={{ color: '#1e293b' }}>● 주요 자격</strong>
                                        <p style={{ margin: '4px 0 0 0', color: '#2563eb', fontWeight: '500' }}>{c.qualification}</p>
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <strong style={{ color: '#1e293b' }}>● 상담 경력</strong>
                                        <p style={{ margin: '4px 0 0 0' }}>{c.career}</p>
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <strong style={{ color: '#1e293b' }}>● 상담사 소개</strong>
                                        <p style={{ margin: '4px 0 0 0' }}>{c.description}</p>
                                    </div>
                                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                                        <strong style={{ color: '#ef4444' }}>● 휴무 요일</strong>
                                        <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>{c.offDay}</span>
                                    </div>
                                </div>
                            )}
                            
                            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenDetailId(openDetailId === c.id ? null : c.id);
                                    }}
                                    style={{ 
                                        width: '100%', padding: '12px', backgroundColor: openDetailId === c.id ? '#64748b' : '#3b82f6', 
                                        color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {openDetailId === c.id ? '정보 닫기' : '상세보기 및 자격확인'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default ConsultantListPage;