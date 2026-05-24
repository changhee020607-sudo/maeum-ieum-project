import React, { useState, useEffect } from 'react';

export default function ReservationCancel() {
    const [myReservations, setMyReservations] = useState([]);

    useEffect(() => {

        const saved = JSON.parse(localStorage.getItem('user_reservations') || '[]');
        setMyReservations(saved);
    }, []);

    const getConsultantImage = (id) => `/images/p${id}.png`;

    const handleCancel = (resId) => {
        if (window.confirm("정말로 이 예약을 취소하시겠습니까?")) {
            const updated = myReservations.filter(res => res.id !== resId);
            localStorage.setItem('user_reservations', JSON.stringify(updated));
            setMyReservations(updated);
            alert("예약이 정상적으로 취소되었습니다.");
        }
    };

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>예약 취소하기</h2>
            
            {myReservations.length === 0 ? (
                <div style={emptyBoxStyle}>현재 취소할 수 있는 예약 내역이 없습니다.</div>
            ) : (
                <div style={cardGridStyle}>
                    {myReservations.map((res) => (
                        <div key={res.id} style={cardStyle}>
                            <div style={imageWrapperStyle}>
                                <img src={getConsultantImage(res.consultantId)} alt={res.consultantName} style={imageStyle} />
                            </div>
                            <div style={infoSectionStyle}>
                                <div style={cancelTagStyle}>취소 가능</div>
                                <h3 style={nameStyle}>{res.consultantName} 상담사</h3>
                                
                                <div style={dateTimeWrapperStyle}>
                                    <div style={detailBoxStyle}>
                                        <span style={labelStyle}>날짜</span>
                                        <span style={valueStyle}>{res.date}</span>
                                    </div>
                                    <div style={{ width: '1px', height: '25px', backgroundColor: '#e2e8f0' }} />
                                    <div style={detailBoxStyle}>
                                        <span style={labelStyle}>시간</span>
                                        <span style={valueStyle}>{res.time}</span>
                                    </div>
                                </div>

                                <button onClick={() => handleCancel(res.id)} style={cancelBtnStyle}>
                                    예약 취소하기
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const containerStyle = { padding: '60px 20px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' };
const titleStyle = { fontSize: '28px', fontWeight: 'bold', marginBottom: '40px', color: '#1e293b' };
const cardGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' };
const cardStyle = { backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' };
const imageWrapperStyle = { width: '100%', height: '240px', overflow: 'hidden' };
const imageStyle = { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' };
const infoSectionStyle = { padding: '25px', textAlign: 'left' };
const nameStyle = { fontSize: '20px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#334155' };
const dateTimeWrapperStyle = { display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '16px' };
const detailBoxStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const labelStyle = { fontSize: '10px', color: '#94a3b8' };
const valueStyle = { fontSize: '14px', fontWeight: '800', color: '#1e293b' };
const emptyBoxStyle = { padding: '100px', backgroundColor: '#f8fafc', borderRadius: '30px', color: '#94a3b8' };

const cancelTagStyle = { display: 'inline-block', backgroundColor: '#fef2f2', color: '#ef4444', padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', marginBottom: '12px' };
const cancelBtnStyle = { 
    width: '100%', marginTop: '20px', padding: '14px', backgroundColor: '#ef4444', 
    color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' 
};