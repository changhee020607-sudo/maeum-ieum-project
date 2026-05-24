import React, { useState, useEffect } from 'react';

export default function ReservationCheck() {
    const [myReservations, setMyReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    const userId = localStorage.getItem("userId") || "testUser";

    useEffect(() => {
        const fetchReservations = () => {
            try {
                const localData = JSON.parse(localStorage.getItem('user_reservations') || '[]');
                
                setMyReservations(localData);
            } catch (err) {
                console.error("데이터 로딩 실패:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, [userId]);

    const getConsultantImage = (id) => {
        return `/images/p${id}.png`;
    };

    if (loading) {
        return <div style={{ padding: '100px', textAlign: 'center', color: '#64748b' }}>데이터를 불러오는 중입니다...</div>;
    }

    return (
        <div style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '40px', color: '#1e293b' }}>나의 예약 내역</h2>
            
            {myReservations.length === 0 ? (
                <div style={emptyBoxStyle}>
                    <p style={{ color: '#94a3b8', fontSize: '18px' }}>현재 진행 중인 예약 내역이 없습니다.</p>
                </div>
            ) : (
                <div style={cardGridStyle}>
                    {myReservations.map((res) => (
                        <div key={res.id} style={cardStyle}>
                            <div style={imageWrapperStyle}>
                                <img 
                                    src={getConsultantImage(res.consultantId)} 
                                    alt={res.consultantName} 
                                    style={imageStyle} 
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x500?text=No+Image"; }}
                                />
                            </div>

                            <div style={infoSectionStyle}>
                                <div style={tagStyle}>상담 확정</div>
                                <h3 style={nameStyle}>{res.consultantName} 상담사</h3>
                                
                                <div style={dateTimeWrapperStyle}>
                                    <div style={detailBoxStyle}>
                                        <span style={labelStyle}>상담 날짜</span>
                                        <span style={valueStyle}>{res.date}</span>
                                    </div>
                                    <div style={{ width: '1px', height: '25px', backgroundColor: '#e2e8f0' }} />
                                    <div style={detailBoxStyle}>
                                        <span style={labelStyle}>상담 시간</span>
                                        <span style={valueStyle}>{res.time}</span>
                                    </div>
                                </div>
                                
                                <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
                                        예약번호: {res.id.toString().slice(-6).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const cardGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' };
const cardStyle = { backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' };
const imageWrapperStyle = { width: '100%', height: '240px', backgroundColor: '#f8fafc', overflow: 'hidden' };
const imageStyle = { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' };
const infoSectionStyle = { padding: '25px', textAlign: 'left' };
const tagStyle = { display: 'inline-block', backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', marginBottom: '12px' };
const nameStyle = { fontSize: '22px', fontWeight: 'bold', margin: '0 0 20px 0', color: '#1e293b' };
const dateTimeWrapperStyle = { display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '16px' };
const detailBoxStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const labelStyle = { fontSize: '11px', color: '#94a3b8', marginBottom: '4px' };
const valueStyle = { fontSize: '15px', fontWeight: '800', color: '#334155' };
const emptyBoxStyle = { padding: '100px 20px', backgroundColor: '#f8fafc', borderRadius: '30px', border: '1px dashed #cbd5e1' };