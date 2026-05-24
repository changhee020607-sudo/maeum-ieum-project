import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyReservations = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const mode = location.pathname.split('/')[1];

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

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


    // 로그인한 사용자의 역할이 상담사면 consultantName도 함께 전송
    const role = localStorage.getItem('role') || sessionUser?.role || '';
    const consultantName = (role === 'consultant') ? (userName || userId) : '';

    // 숨길 상태값 정의 및 정규화 함수
    const hiddenStatuses = ['ended', 'end', 'completed', 'done', '종료'];
    const normalizeStatus = (status) => String(status || '').trim().toLowerCase();

    const fetchReservations = async () => {
        try {
            const params = { userId, userName };
            if (consultantName) params.consultantName = consultantName;
            const res = await axios.get('http://localhost:5000/api/my-reservations', {
                params
            });
            // 상태 필터링 적용
            const filtered = Array.isArray(res.data)
                ? res.data.filter((item) => !hiddenStatuses.includes(normalizeStatus(item?.status)))
                : [];
            setReservations(filtered);
        } catch (err) {
            console.error('예약 내역 불러오기 실패:', err);
        } finally {
            const hiddenStatuses = ['ended', 'end', 'completed', 'done', '종료', 'rejected', '\uac70\uc808', 'refused', '\uac70\ubd80', '\uac70\uc808\ub428'];
        }
    };

    useEffect(() => {
        if (userId || userName || consultantName) fetchReservations();
        else setLoading(false);
    }, [userId, userName, consultantName]);

    const getTitle = () => {
        if (mode === 'modify') return '예약 일정 변경';
        if (mode === 'cancel') return '예약 취소 신청';
        return '내 예약 확인';
    };


    const handleModifyClick = (res, cName) => {
        const consultantId = res.consultant_id || res.consultantId || consultantIdByName[cName] || '';
        if (!consultantId) {
            alert('상담사 정보를 찾지 못해 일정 변경 페이지로 이동할 수 없습니다.');
            return;
        }

        navigate(`/reserve/date/${consultantId}`,
            {
                state: {
                    isModifying: true,
                    oldReservationId: res.id,
                    originId: res.id,
                    consultantName: cName,
                    prevDate: res.res_date || res.date,
                    prevTime: res.res_time || res.time
                }
            }
        );
    };

    const handleCancelClick = async (res, cName) => {
        const rawDate = res.res_date || res.date;
        const d = new Date(rawDate);
        const formattedDate = !isNaN(d) 
            ? `${d.getFullYear()}년 ${(d.getMonth()+1).toString().padStart(2,'0')}월 ${d.getDate().toString().padStart(2,'0')}일`
            : rawDate;

        const confirmMsg = `${formattedDate} | ${res.res_time || res.time}\n${cName} 상담사님의 예약을 취소하시겠습니까?\n\n취소하신 내역은 복구되지 않습니다.`;

        if (window.confirm(confirmMsg)) {
            try {
                const response = await axios.delete(`http://localhost:5000/api/reservation/cancel/${res.id}`);
                if (response.data.success) {
                    alert('예약이 정상적으로 취소되었습니다.');
                    fetchReservations();
                } else {
                    alert('취소 처리에 실패했습니다.');
                }
            } catch (err) {
                console.error('취소 요청 중 에러:', err);
                alert('서버와 통신 중 오류가 발생했습니다.');
            }
        }
    };

    if (loading) {
        return <div style={{ padding: '100px', textAlign: 'center', color: '#64748b' }}>예약 내역을 불러오는 중입니다...</div>;
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '25px', color: '#1e293b' }}>{getTitle()}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reservations.length === 0 ? (
                    <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>예약 내역이 없습니다.</div>
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
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '25px' 
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '4px 0', color: '#0f172a' }}>
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
                                        {mode === 'modify' && (
                                            <button 
                                                onClick={() => handleModifyClick(res, cName)}
                                                style={{ padding: '12px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                                            >
                                                변경하기
                                            </button>
                                        )}
                                        {mode === 'cancel' && (
                                            <button 
                                                onClick={() => handleCancelClick(res, cName)}
                                                style={{ padding: '12px 20px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                                            >
                                                취소하기
                                            </button>
                                        )}
                                        {mode === 'check' && (
                                            <span style={{ padding: '8px 14px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                                                {res.status || '예약완료'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default MyReservations;