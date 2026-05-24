import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


export default function MyPage() {
    const navigate = useNavigate();
    const sessionUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const userName = sessionUser?.userName || sessionUser?.name || localStorage.getItem("userName") || "사용자";
    const userId = localStorage.getItem("userId") || sessionUser?.userId || sessionUser?.id || "";
    const userRole = (localStorage.getItem("userRole") || sessionUser?.role || "user").toUpperCase();
    const isConsultant = userRole === "CONSULTANT" || userRole === "COUNSELOR";

    // 관리자면 마이페이지 진입 시 대시보드로 강제 이동
    useEffect(() => {
        if (userRole === 'ADMIN') {
            navigate('/admin', { replace: true });
        }
    }, [userRole, navigate]);

    const [myReservations, setMyReservations] = useState([]);
    const [historyReservations, setHistoryReservations] = useState([]);
    const acceptedStatuses = ['accepted', 'confirmed', 'approved', '1', 'true', 'y', 'yes', '수락', '승인', '완료'];
    const hiddenStatuses = ['ended', 'end', 'completed', 'done', '종료', 'rejected', '거절', 'refused', '거부', '거절됨'];
    const rejectedStatuses = ['rejected', '거절', 'refused', '거부', '거절됨'];
    const endedStatuses = ['ended', 'end', 'completed', 'done', '종료'];
    const normalizeStatus = (status) => String(status || '').trim().toLowerCase();
    const isAcceptedStatus = (status) => acceptedStatuses.includes(normalizeStatus(status));

    const isRejectedStatus = (status) => rejectedStatuses.includes(normalizeStatus(status));
    const isEndedStatus = (status) => endedStatuses.includes(normalizeStatus(status));

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const value = String(dateStr);
        if (value.includes('T')) return value.split('T')[0];
        return value;
    };

    const fetchReservations = async () => {
        try {
            if (isConsultant) {
                const res = await axios.get(`http://localhost:5000/api/consultant/reservations/${userName}`);
                const list = Array.isArray(res.data) ? res.data : [];
                setMyReservations(list.filter((item) => !hiddenStatuses.includes(normalizeStatus(item?.status))));
                setHistoryReservations(list.filter((item) => isRejectedStatus(item?.status) || isEndedStatus(item?.status)));
            } else {
                const response = await axios.get('http://localhost:5000/api/my-reservations', {
                    params: { userId, userName },
                });
                const list = Array.isArray(response.data) ? response.data : [];
                setMyReservations(list.filter((item) => !hiddenStatuses.includes(normalizeStatus(item?.status))));
                setHistoryReservations(list.filter((item) => isRejectedStatus(item?.status) || isEndedStatus(item?.status)));
            }
        } catch (error) {
            console.error("데이터 로드 실패:", error);
            setMyReservations([]);
            setHistoryReservations([]);
        }
    };

    const getHistoryStatusLabel = (status) => {
        if (isRejectedStatus(status)) return '거절';
        if (isEndedStatus(status)) return '상담 종료';
        return String(status || '기록');
    };

    useEffect(() => {
        if (userRole !== 'ADMIN') {
            fetchReservations();
        }
        // eslint-disable-next-line
    }, [userId, userName, userRole]);

    const handleStatusUpdate = async (id, newStatus) => {
        if (newStatus === 'confirmed') {
            if (window.confirm('이 예약을 수락하시겠습니까?')) {
                try {
                    await axios.patch(`http://localhost:5000/api/reservation/${id}/accept`);
                    alert('수락되었습니다.');
                    fetchReservations();
                } catch (error) {
                    alert('수락 실패');
                }
            }
        } else if (newStatus === 'rejected') {
            const reason = window.prompt('거절할 사유를 입력해주세요.');
            if (reason && reason.trim() !== '') {
                try {
                    await axios.patch(`http://localhost:5000/api/reservation/${id}/reject`, { reason });
                    alert('거절되었습니다.');
                    fetchReservations();
                } catch (error) {
                    alert('거절 실패');
                }
            } else {
                alert('거절 사유를 입력해야 합니다.');
            }
        }
    };

    const getConsultantImage = (res) => {
        const cName = res.consultant_name || res.consultantName || res.name;
        const consultantImages = {
            "박준형": "p1.png", "이지아": "p2.png", "김한결": "p3.png", "최현우": "p4.png",
            "정나래": "p5.png", "강민석": "p6.png", "윤서연": "p7.png", "임소희": "p8.png"
        };
        
        if (cName && consultantImages[cName]) {
            return `/images/${consultantImages[cName]}`;
        }
        return `/images/p1.png`; 
    };

    const handleCancel = async (id) => {
        if (window.confirm('정말 예약을 취소하시겠습니까?')) {
            try {
                await axios.delete(`http://localhost:5000/api/reservation/cancel/${id}`);
                alert('취소되었습니다.');
                fetchReservations();
            } catch (error) {
                alert('취소 실패');
            }
        }
    };

    const handleEnterChatRoom = (reservation) => {
        if (!reservation || !reservation.id) {
            alert("유효한 예약 내역이 없습니다.");
            return;
        }

        const status = normalizeStatus(reservation.status);

        switch (status) {
            case 'pending':
                alert("🔒 상담사가 아직 예약을 수락하지 않았습니다. 수락 완료 후 입장이 가능합니다.");
                break;

            case 'rejected':
                alert("❌ 거절된 예약입니다. 다른 시간으로 다시 예약해 주세요.");
                break;

            case 'accepted':
            case 'confirmed':
            case 'approved':
            case '1':
                navigate(`/chat/${reservation.id}`);
                break;

            default:
                alert("상담에 진입할 수 없는 상태입니다.");
                break;
        }
    };

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 'bold' }}>
                    <span style={{ color: '#2563eb' }}>{userName}</span>
                    {isConsultant ? " 상담사의 마이페이지" : "님의 마이페이지"}
                </h2>
                <p style={{ color: '#64748b', marginTop: '10px' }}>
                    {isConsultant ? "내담자들의 상담 신청을 관리하고 실시간 상담을 진행하세요." : "예약 관리와 상담 서비스를 한곳에서 이용하세요."}
                </p>
            </header>

            {!isConsultant && (
                <div style={menuGridStyle}>
                    <div 
                        style={{ ...menuCardStyle, backgroundColor: '#2563eb', color: 'white' }} 
                        onClick={() => navigate('/consultants')}
                    >
                        <span style={{ fontSize: '24px' }}>🚀</span>
                        <h4 style={{ margin: '10px 0' }}>신규 예약하기</h4>
                        <p style={{ fontSize: '13px', opacity: 0.9 }}>상담사를 선택하고 예약을 진행합니다.</p>
                    </div>
                    <div 
                        style={menuCardStyle} 
                        onClick={() => navigate('/consultants')}
                    >
                        <span style={{ fontSize: '24px' }}>👥</span>
                        <h4 style={{ margin: '10px 0' }}>상담사 프로필</h4>
                        <p style={{ fontSize: '13px', color: '#64748b' }}>전문 상담사진의 경력과 소개를 봅니다.</p>
                    </div>
                </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '50px 0' }} />

            <section style={{ marginBottom: '60px' }}>
                <h3 style={{ fontSize: '22px', marginBottom: '25px', fontWeight: 'bold' }}>
                    {isConsultant ? "📅 상담 신청 현황" : "📅 내 예약 현황"}
                </h3>
                
                {myReservations.length > 0 ? (
                    <div style={cardGridStyle}>
                        {myReservations.map(res => {
                            const normalizedStatus = normalizeStatus(res.status);
                            const consultantLabel = (() => {
                                const baseName = res.consultant_name || res.consultantName || '';
                                if (!baseName) return '상담사';
                                return String(baseName).includes('상담사') ? baseName : `${baseName} 상담사`;
                            })();
                            const displayTargetName = isConsultant
                                ? `예약자: ${res.name || "(이름 없음)"}`
                                : consultantLabel;
                            const isApproved = isAcceptedStatus(res.status);
                            const isPending = normalizedStatus === 'pending';
                            const isRejected = normalizedStatus === 'rejected';

                            return (
                                <div key={res.id} style={cardStyle}>
                                    <div style={imageWrapperStyle}>
                                        <img 
                                            src={getConsultantImage(res)} 
                                            alt="프로필" 
                                            style={imageStyle} 
                                            onError={(e) => { e.target.src = '/images/p1.png'; }}
                                        />
                                    </div>

                                    <div style={infoSectionStyle}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ 
                                                ...statusTagStyle, 
                                                backgroundColor: isAcceptedStatus(res.status) ? '#ecfdf5' : isRejected ? '#fef2f2' : '#eff6ff', 
                                                color: isAcceptedStatus(res.status) ? '#10b981' : isRejected ? '#b91c1c' : '#2563eb' 
                                            }}>
                                                {isAcceptedStatus(res.status) && '수락완료'}
                                                {isPending && '예약 대기중'}
                                                {isRejected && '거절됨'}
                                            </span>
                                            {!isConsultant && isPending && (
                                                <button 
                                                    onClick={() => handleCancel(res.id)}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                                                >
                                                    취소하기
                                                </button>
                                            )}
                                        </div>

                                        <h4 style={nameStyle}>{displayTargetName}</h4>
                                        
                                        {isConsultant && isPending && (
                                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                                <button 
                                                    onClick={() => handleStatusUpdate(res.id, 'confirmed')}
                                                    style={{ flex: 1, padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                                                >
                                                    수락
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusUpdate(res.id, 'rejected')}
                                                    style={{ flex: 1, padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                                                >
                                                    거절
                                                </button>
                                            </div>
                                        )}

                                        {isConsultant && isApproved && (
                                            <button
                                                onClick={() => navigate(`/chat/${res.id}`)}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    backgroundColor: '#2563eb',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    marginTop: '10px'
                                                }}
                                            >
                                                채팅방 입장하기
                                            </button>
                                        )}

                                        {!isConsultant && (
                                            <button 
                                                onClick={() => handleEnterChatRoom(res)}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    backgroundColor: isAcceptedStatus(res.status) ? '#2563eb' : '#94a3b8',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    marginTop: '10px'
                                                }}
                                            >
                                                채팅방 입장하기
                                            </button>
                                        )}

                                        <div className="date-time-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                                            <div>
                                                <p className="label" style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>상담 날짜</p>
                                                <p className="value" style={{ fontSize: '15px', color: '#1e293b', fontWeight: 'bold' }}>{formatDate(res.res_date)}</p>
                                            </div>
                                            <div>
                                                <p className="label" style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>상담 시간</p>
                                                <p className="value" style={{ fontSize: '15px', color: '#1e293b', fontWeight: 'bold' }}>{res.res_time}</p>
                                            </div>
                                        </div>
                                        {!isConsultant && isRejected && res.rejection_reason && (
                                            <div style={{ marginTop: '15px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', color: '#b91c1c', fontSize: '15px' }}>
                                                <strong>거절 사유:</strong> {res.rejection_reason}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#f8fafc', borderRadius: '25px', border: '1px dashed #cbd5e1' }}>
                        <p style={{ color: '#94a3b8', fontSize: '16px' }}>진행 중인 예약이 없습니다.</p>
                    </div>
                )}
            </section>

            <section>
                <h3 style={{ fontSize: '22px', marginBottom: '20px', fontWeight: 'bold' }}>📜 상담 기록</h3>
                {historyReservations.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {historyReservations.map((res) => {
                            const consultantLabel = (() => {
                                const baseName = res.consultant_name || res.consultantName || '';
                                if (!baseName) return '상담사';
                                return String(baseName).includes('상담사') ? baseName : `${baseName} 상담사`;
                            })();
                            const targetName = isConsultant
                                ? `예약자: ${res.name || '(이름 없음)'}`
                                : consultantLabel;
                            const rejected = isRejectedStatus(res.status);

                            return (
                                <div key={`history-${res.id}`} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', background: '#fff' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                                        <strong style={{ color: '#1e293b' }}>{targetName}</strong>
                                        <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '999px', background: rejected ? '#fef2f2' : '#eff6ff', color: rejected ? '#b91c1c' : '#1d4ed8' }}>
                                            {getHistoryStatusLabel(res.status)}
                                        </span>
                                    </div>
                                    <div style={{ marginTop: '6px', color: '#334155', fontSize: '14px' }}>
                                        {formatDate(res.res_date)} / {res.res_time}
                                    </div>
                                    {rejected && (
                                        <div style={{ marginTop: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 10px', color: '#b91c1c', fontSize: '14px' }}>
                                            <strong>거절 사유:</strong> {res.rejection_reason || '사유 미입력'}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px', border: '1px dashed #cbd5e1', borderRadius: '25px', backgroundColor: '#f8fafc' }}>
                        아직 기록된 상담 이력이 없습니다.
                    </div>
                )}
            </section>

            <div style={{ textAlign: 'center', marginTop: '60px', paddingBottom: '40px' }}>
                <button 
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = "/";
                    }}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px' }}
                >
                    로그아웃 하시겠습니까?
                </button>
            </div>
        </div>
    );
}

const menuGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const menuCardStyle = { padding: '30px 20px', borderRadius: '25px', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease', backgroundColor: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const cardGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' };
const cardStyle = { backgroundColor: 'white', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' };
const imageWrapperStyle = { width: '100%', height: '160px', backgroundColor: '#f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const imageStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const infoSectionStyle = { padding: '25px', textAlign: 'left' };
const nameStyle = { fontSize: '22px', fontWeight: 'bold', margin: '15px 0', color: '#1e293b' };
const statusTagStyle = { padding: '5px 12px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' };