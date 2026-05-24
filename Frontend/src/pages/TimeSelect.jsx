import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function TimeSelect() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const selectedDate = location.state?.date || "날짜 미선택";
    const { isModifying, prevDate, prevTime } = location.state || {};
    
    const [selectedTime, setSelectedTime] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]); // 예약 가능 시간 목록

    const consultants = [
        { id: 1, name: '박준형 상담사' }, { id: 2, name: '이지아 상담사' },
        { id: 3, name: '김한결 상담사' }, { id: 4, name: '최현우 상담사' },
        { id: 5, name: '정나래 상담사' }, { id: 6, name: '강민석 상담사' },
        { id: 7, name: '윤서연 상담사' }, { id: 8, name: '임소희 상담사' }
    ];

    const currentConsultant = consultants.find(c => String(c.id) === String(id));
    const consultantName = location.state?.consultantName
        || (currentConsultant ? currentConsultant.name : "상담사");

    const getStandardDate = (dateStr) => {
        if (!dateStr || dateStr === "날짜 미선택") return "";
        const parts = dateStr.split('.').map(p => p.trim()).filter(p => p !== "");
        if (parts.length < 3) return dateStr;
        const year = parts[0];
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getOperatingInfo = () => {
        if (selectedDate === "날짜 미선택") return { slots: [], text: "" };
        const dateParts = selectedDate.split('.').map(p => p.trim());
        const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        const day = dateObj.getDay(); 
        const isWeekend = (day === 0 || day === 6);

        if (isWeekend) {
            return {
                slots: ["09:00", "10:00", "11:00", "12:00", "13:00"],
                text: "주말 운영시간: 09:00 ~ 13:00"
            };
        } else {
            return {
                slots: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
                text: "평일 운영시간: 09:00 ~ 18:00 (점심시간 12:00~13:00 제외)"
            };
        }
    };

    const { slots: timeSlots, text: operatingText } = getOperatingInfo();

    useEffect(() => {
        const fetchAvailableTimes = async () => {
            try {
                const formattedDate = getStandardDate(selectedDate);
                const response = await axios.get(`http://localhost:5000/api/reservation/booked-times`, {
                    params: { consultantName, date: formattedDate }
                });
                setAvailableTimes(response.data); // 서버에서 '예약 가능 시간'만 내려줌
            } catch (err) {
                console.error("예약 가능 시간 로드 오류:", err);
                setAvailableTimes([]);
            }
        };
        if (selectedDate !== "날짜 미선택") fetchAvailableTimes();
    }, [id, selectedDate, consultantName]);

    const handleComplete = async () => {
        if (!selectedTime) {
            alert("상담 시간을 선택해 주세요!");
            return;
        }

        const confirmMsg = isModifying 
            ? `기존 예약을 취소하고 ${selectedDate} ${selectedTime}\n${consultantName} 상담사님으로 변경하시겠습니까?`
            : `${selectedDate} ${selectedTime}\n${consultantName} 상담사님께 예약을 확정하시겠습니까?`;
        
        if (window.confirm(confirmMsg)) {
            try {
                // 세션에서 유저 정보 가져오기
                const user = JSON.parse(sessionStorage.getItem('user'));
                const reservationData = {
                    userId: localStorage.getItem('userId') || 'Test1234', 
                    consultantId: id,
                    consultantName: consultantName,
                    reserveDate: getStandardDate(selectedDate), // 표준 포맷으로 전송
                    reserveTime: selectedTime,
                    isModifying: isModifying,
                    prevDate: prevDate,
                    prevTime: prevTime,
                    originId: location.state?.originId,
                    // ⭐ 로그인한 유저의 이름을 name 필드에 포함
                    name: user?.userName || user?.name || '신창희'
                };

                const response = await axios.post('http://localhost:5000/api/reservation/book', reservationData);
                if (response.status === 201 || response.status === 200) {
                    alert(`${selectedDate} ${selectedTime} 예약이 완료되었습니다.`);
                    navigate('/');
                }
            } catch (err) {
                alert(err.response?.data?.message || "예약 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
                {isModifying ? '예약 변경 - 시간 선택' : '시간 선택'}
            </h2>
            <div style={{ marginBottom: '40px' }}>
                <p style={{ color: '#64748b', margin: '5px 0', fontSize: '16px' }}>
                    선택일: <strong>{selectedDate}</strong> / 상담사: <strong>{consultantName}</strong>
                </p>
                <p style={{ 
                    display: 'inline-block',
                    backgroundColor: '#f8fafc', 
                    color: '#475569', 
                    fontSize: '14px', 
                    padding: '6px 16px', 
                    borderRadius: '20px', 
                    border: '1px solid #e2e8f0',
                    marginTop: '8px'
                }}>
                    🕒 {operatingText}
                </p>
            </div>

            <div style={timeGridStyle}>
                {timeSlots.map((time) => {
                    let isBooked = !availableTimes.includes(time);
                    const isMyOldSlot = isModifying && (getStandardDate(selectedDate) === prevDate) && (time === prevTime);
                    if (isMyOldSlot) isBooked = false;

                    const now = new Date();
                    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                    const selectedDateStr = getStandardDate(selectedDate);
                    const selectedDateParts = selectedDateStr.split('-');
                    const selectedDayOnly = new Date(
                        selectedDateParts[0],
                        selectedDateParts[1] - 1,
                        selectedDateParts[2]
                    ).getTime();
                    const isToday = todayOnly === selectedDayOnly;
                    const isPastDate = selectedDayOnly < todayOnly;
                    const [slotHour, slotMinute] = time.split(':').map((v) => parseInt(v, 10));
                    const slotStart = new Date(
                        selectedDateParts[0],
                        selectedDateParts[1] - 1,
                        selectedDateParts[2],
                        slotHour,
                        slotMinute,
                        0,
                        0
                    );
                    const cutoffTime = new Date(slotStart.getTime() - 10 * 60 * 1000);
                    const isClosedByCutoff = isToday && now >= cutoffTime;

                    const isDisabled = isBooked || isPastDate || isClosedByCutoff;
                    const isSelected = selectedTime === time;

                    return (
                        <button
                            key={time}
                            disabled={isDisabled}
                            onClick={() => setSelectedTime(time)}
                            style={{
                                ...timeBtnStyle,
                                backgroundColor: isSelected ? '#2563eb' : (isMyOldSlot ? '#eff6ff' : (isDisabled ? '#f1f5f9' : 'white')),
                                color: isSelected ? 'white' : (isMyOldSlot ? '#2563eb' : (isDisabled ? '#cbd5e1' : '#1e293b')),
                                borderColor: isSelected ? '#2563eb' : (isMyOldSlot ? '#3b82f6' : '#e2e8f0'),
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                textDecoration: (isDisabled && !isMyOldSlot) ? 'line-through' : 'none',
                                position: 'relative'
                            }}
                        >
                            {time}
                            {isMyOldSlot && !isSelected && <span style={mySlotBadgeStyle}>기존</span>}
                            {(isBooked && !isMyOldSlot) || isClosedByCutoff ? ' (마감)' : ''}
                        </button>
                    );
                })}
            </div>

            <div style={{ marginTop: '50px' }}>
                <button 
                    onClick={handleComplete} 
                    disabled={!selectedTime}
                    style={{
                        ...confirmBtnStyle,
                        backgroundColor: selectedTime ? '#2563eb' : '#cbd5e1',
                        cursor: selectedTime ? 'pointer' : 'not-allowed'
                    }}
                >
                    {isModifying ? '예약 변경 완료' : '예약 확정하기'}
                </button>
            </div>
        </div>
    );
}

const timeGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px', maxWidth: '600px', margin: '0 auto' };
const timeBtnStyle = { padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', fontWeight: 'bold', transition: '0.2s' };
const confirmBtnStyle = { width: '100%', maxWidth: '400px', padding: '18px', border: 'none', borderRadius: '15px', color: 'white', fontSize: '18px', fontWeight: 'bold', transition: '0.3s' };
const mySlotBadgeStyle = { position: 'absolute', top: '5px', right: '5px', fontSize: '10px', backgroundColor: '#3b82f6', color: 'white', padding: '2px 4px', borderRadius: '4px' };