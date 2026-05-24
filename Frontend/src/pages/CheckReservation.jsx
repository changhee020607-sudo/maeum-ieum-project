import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CheckReservation() {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const userId = user.id || 'Test1234';
    
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/my-reservations?userId=${userId}`);
            setReservations(res.data);
        } catch (e) {
            console.error("예약 목록 조회 실패:", e);
            setReservations([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (userId) fetchReservations();
    }, [userId]);

    const handleCancel = async (resItem) => {
        const consultantName = resItem.consultant || resItem.consultant_name || '상담사';
        const formattedDate = formatDate(resItem.res_date);
        
        const confirmMsg = `${formattedDate} | ${resItem.res_time}\n${consultantName} 상담사님의 예약을 취소하시겠습니까?\n\n취소하신 내역은 복구되지 않습니다.`;

        if (window.confirm(confirmMsg)) {
            try {
                const response = await axios.delete(`http://localhost:5000/api/reservation/cancel/${resItem.id}`);
                
                if (response.data.success) {
                    alert('예약이 정상적으로 취소되었습니다.');
                    fetchReservations();
                } else {
                    alert('취소 처리에 실패했습니다.');
                }
            } catch (e) {
                console.error("취소 요청 에러:", e);
                alert('서버와 통신 중 오류가 발생했습니다.');
            }
        }
    };

    const handleUpdate = async (id) => {
        alert("상담 일정 변경 기능은 현재 준비 중입니다. \n기존 예약 취소 후 다시 이용해 주세요!");
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        return `${d.getFullYear()}년 ${(d.getMonth()+1).toString().padStart(2,'0')}월 ${d.getDate().toString().padStart(2,'0')}일`;
    };

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>나의 예약 내역</h2>
            <div style={listContainer}>
                {loading ? (
                    <div style={{ textAlign: 'center', marginTop: '50px' }}>로딩 중...</div>
                ) : reservations.length > 0 ? (
                    reservations.map((res) => (
                        <div key={res.id} style={cardStyle}>
                            <div style={infoArea}>
                                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>No. {res.id}</p>
                                <h3 style={nameStyle}>{res.consultant || res.consultant_name || res.name || '상담사'} 상담사 예약</h3>
                                <p style={dateTimeStyle}>{formatDate(res.res_date)} | {res.res_time}</p>
                                <span style={statusBadge}>확정</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button style={cancelBtn} onClick={() => handleCancel(res)}>취소하기</button>
                                <button style={updateBtn} onClick={() => handleUpdate(res.id)}>일정 변경</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={emptyContainer}>
                        <p style={emptyTextStyle}>현재 예약된 내역이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const containerStyle = { 
    padding: '60px 20px', 
    maxWidth: '800px', 
    margin: '0 auto', 
    minHeight: '80vh' 
};

const titleStyle = { 
    fontSize: '24px', 
    fontWeight: 'bold', 
    marginBottom: '40px', 
    textAlign: 'left', 
    color: '#1e293b' 
};

const listContainer = { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px' 
};

const cardStyle = { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '30px', 
    background: 'white', 
    border: '1px solid #f1f5f9', 
    borderRadius: '16px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
};

const infoArea = { textAlign: 'left' };

const nameStyle = { 
    fontSize: '18px', 
    fontWeight: 'bold', 
    marginBottom: '10px', 
    color: '#1e293b' 
};

const dateTimeStyle = { 
    fontSize: '15px', 
    color: '#2563eb', 
    marginBottom: '15px', 
    fontWeight: '500' 
};

const statusBadge = { 
    display: 'inline-block',
    padding: '6px 14px', 
    backgroundColor: '#dcfce7', 
    color: '#166534', 
    borderRadius: '8px', 
    fontSize: '13px', 
    fontWeight: '600' 
};

const cancelBtn = {
    padding: '8px 16px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'background 0.2s'
};

const updateBtn = {
    padding: '8px 16px',
    background: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px'
};

const emptyContainer = { 
    marginTop: '100px', 
    textAlign: 'center' 
};

const emptyTextStyle = { 
    color: '#94a3b8', 
    fontSize: '16px' 
};