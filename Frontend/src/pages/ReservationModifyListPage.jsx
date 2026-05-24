import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ReservationModifyListPage = () => {
    const [reservations, setReservations] = useState([]);
    const navigate = useNavigate();
    
    const sessionUser = (() => {
        try {
            return JSON.parse(sessionStorage.getItem('user') || 'null');
        } catch {
            return null;
        }
    })();

    const userId =
        localStorage.getItem('userId') ||
        sessionStorage.getItem('userId') ||
        sessionUser?.userId ||
        sessionUser?.id ||
        '';

    const userName =
        localStorage.getItem('userName') ||
        sessionStorage.getItem('name') ||
        sessionUser?.userName ||
        sessionUser?.name ||
        '';


    // 로그인한 사용자의 역할이 상담사면 consultantName도 함께 전송
    const role = localStorage.getItem('role') || sessionUser?.role || '';
    const consultantName = (role === 'consultant') ? (userName || userId) : '';

    useEffect(() => {
        if (!userId) {
            alert("로그인이 필요한 서비스입니다.");
            navigate('/login');
            return;
        }

        const params = { userId, userName };
        if (consultantName) params.consultantName = consultantName;
        const query = new URLSearchParams(params).toString();

        fetch(`http://localhost:5000/api/my-reservations?${query}`)
            .then(res => res.json())
            .then(data => {
                console.log('[최종확인] API 응답:', data);
                setReservations(data);
            })
            .catch(err => console.error("예약 내역 로딩 실패:", err));
    }, [userId, userName, consultantName, navigate]);

    const consultantImages = {
        "박준형": "p1.png",
        "이지아": "p2.png",
        "김한결": "p3.png",
        "최현우": "p4.png",
        "정나래": "p5.png",
        "강민석": "p6.png",
        "윤서연": "p7.png",
        "임소희": "p8.png"
    };

    const consultantIdByName = {
        "박준형": 1,
        "이지아": 2,
        "김한결": 3,
        "최현우": 4,
        "정나래": 5,
        "강민석": 6,
        "윤서연": 7,
        "임소희": 8
    };

    return (
        <div style={containerStyle}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
                <h2 style={titleStyle}>예약 최종 확인</h2>
            </div>

            <div style={listContainerStyle}>
                {reservations.length === 0 ? (
                    <div style={emptyStyle}>변경 가능한 예약 내역이 없습니다.</div>
                ) : (
                    reservations.map((res) => {
                        const cName = (res.consultant_name && res.consultant_name !== 'undefined') 
                            ? res.consultant_name 
                            : (res.consultantName && res.consultantName !== 'undefined')
                                ? res.consultantName 
                                : '전문';
                        const profileImg = consultantImages[cName];
                        return (
                            <div key={res.id} style={{ 
                                backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', 
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '25px', marginBottom: '5px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                            }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ 
                                        width: '60px', height: '60px', backgroundColor: '#f1f5f9', 
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', 
                                        justifyContent: 'center', flexShrink: 0,
                                        border: '1px solid #e2e8f0', overflow: 'hidden'
                                    }}>
                                        {profileImg ? (
                                            <img 
                                                src={`/images/${profileImg}`} 
                                                alt={cName} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <span style={{ fontSize: '24px' }}>👤</span>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>No. {res.id}</span>
                                        <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: '4px 0', color: '#0f172a' }}>
                                            {cName} 상담사 예약
                                        </h3>
                                        <div style={{ marginTop: '10px', padding: '12px 15px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                            <p style={{ margin: 0, fontSize: '1rem', color: '#334155' }}>
                                                일시: <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{res.res_date || res.date} / {res.res_time || res.time}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginLeft: '20px' }}>
                                    <button 
                                        onClick={() => {
                                            const consultantId = res.consultant_id || res.consultantId || consultantIdByName[cName] || '';
                                            if (!consultantId) {
                                                alert('상담사 정보를 찾지 못해 일정 변경 페이지로 이동할 수 없습니다.');
                                                return;
                                            }

                                            navigate(`/reserve/date/${consultantId}`, { 
                                                state: { 
                                                    isModifying: true, 
                                                    oldReservationId: res.id,
                                                    originId: res.id,
                                                    consultantName: cName 
                                                } 
                                            });
                                        }}
                                        style={modifyButtonStyle}
                                    >
                                        일정 변경하기
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

const containerStyle = { padding: '50px 20px', maxWidth: '900px', margin: '0 auto', minHeight: '80vh' };
const titleStyle = { fontSize: '28px', fontWeight: 'bold', textAlign: 'center', margin: 0, color: '#1e293b' };
const subTitleStyle = { textAlign: 'center', color: '#64748b', marginBottom: '40px' };
const listContainerStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const cardStyle = { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
    padding: '25px', background: '#fff', borderRadius: '15px', 
    border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' 
};
const infoAreaStyle = { display: 'flex', flexDirection: 'column', gap: '5px' };
const tagStyle = { fontSize: '12px', color: '#3b82f6', fontWeight: 'bold', marginBottom: '5px' };
const nameStyle = { fontSize: '18px', margin: 0, color: '#1e293b' };
const dateStyle = { fontSize: '15px', color: '#475569', margin: 0 };
const modifyButtonStyle = { 
    padding: '12px 20px', backgroundColor: '#3b82f6', color: '#fff', 
    border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' 
};
const emptyStyle = { textAlign: 'center', padding: '50px', color: '#94a3b8', background: '#fff', borderRadius: '15px' };

export default ReservationModifyListPage;