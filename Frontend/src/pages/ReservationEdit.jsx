import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReservationEdit() {
    const navigate = useNavigate();
    const [myReservations, setMyReservations] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('user_reservations') || '[]');
        setMyReservations(saved);
    }, []);

    const handleModify = (res) => {
        const msg = `예약 일정을 변경하시겠습니까?\n\n변경 버튼을 누르면 현재 예약(${res.date} ${res.time})은 자동 취소되며, 새로운 일정을 선택할 수 있는 페이지로 이동합니다.`;
        
        if (window.confirm(msg)) {
            const updated = myReservations.filter(item => item.id !== res.id);
            localStorage.setItem('user_reservations', JSON.stringify(updated));
            
            alert("기존 예약이 삭제되었습니다. 새로운 일정을 예약해 주세요.");
            navigate('/reserve/consultants');
        }
    };

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>예약 일정 변경</h2>
            
            {myReservations.length === 0 ? (
                <div style={emptyBoxStyle}>변경할 수 있는 예약 내역이 없습니다.</div>
            ) : (
                <div style={cardGridStyle}>
                    {myReservations.map((res) => (
                        <div key={res.id} style={cardStyle}>
                            <div style={imageWrapperStyle}>
                                <img src={`/images/p${res.consultantId}.png`} alt="상담사" style={imageStyle} />
                            </div>

                            <div style={infoSectionStyle}>
                                <div style={modifyTagStyle}>변경 가능</div>
                                <h3 style={nameStyle}>{res.consultantName} 상담사</h3>
                                
                                <div style={dateTimeWrapperStyle}>
                                    <div style={detailBoxStyle}>
                                        <span style={labelStyle}>상담 날짜</span>
                                        <span style={valueStyle}>{res.date}</span>
                                    </div>
                                    <div style={dividerLine} />
                                    <div style={detailBoxStyle}>
                                        <span style={labelStyle}>상담 시간</span>
                                        <span style={valueStyle}>{res.time}</span>
                                    </div>
                                </div>

                                <button onClick={() => handleModify(res)} style={modifyBtnStyle}>
                                    예약 변경하기
                                </button>
                            </div>
                            <div style={reservationIdStyle}>Reservation ID: {res.id || '037902'}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const containerStyle = { padding: '60px 20px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center', backgroundColor: '#ffffff' };
const titleStyle = { fontSize: '28px', fontWeight: '800', marginBottom: '40px', color: '#1e293b', letterSpacing: '-0.5px' };

const cardGridStyle = { display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' };
const cardStyle = { 
    width: '340px', backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', 
    boxShadow: '0 10px 40px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', position: 'relative' 
};

const imageWrapperStyle = { width: '100%', height: '260px', overflow: 'hidden' };
const imageStyle = { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' };

const infoSectionStyle = { padding: '25px', textAlign: 'left' };
const modifyTagStyle = { 
    display: 'inline-block', backgroundColor: '#eff6ff', color: '#2563eb', 
    padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', marginBottom: '12px' 
};
const nameStyle = { fontSize: '22px', fontWeight: 'bold', margin: '0 0 18px 0', color: '#1e293b' };

const dateTimeWrapperStyle = { 
    display: 'flex', justifyContent: 'space-around', alignItems: 'center', 
    backgroundColor: '#f8fafc', padding: '15px', borderRadius: '18px' 
};
const detailBoxStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const labelStyle = { fontSize: '10px', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' };
const valueStyle = { fontSize: '14px', fontWeight: '800', color: '#334155' };
const dividerLine = { width: '1px', height: '25px', backgroundColor: '#e2e8f0' };

const modifyBtnStyle = { 
    width: '100%', marginTop: '20px', padding: '16px', backgroundColor: '#2563eb', 
    color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', 
    fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' 
};

const reservationIdStyle = { fontSize: '10px', color: '#cbd5e1', paddingBottom: '20px', textAlign: 'center', letterSpacing: '0.5px' };
const emptyBoxStyle = { padding: '100px', color: '#94a3b8', fontSize: '16px' };