import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css';

export default function DateSelect() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const passedName = location.state?.consultantName;

    const [selectedDate, setSelectedDate] = useState(new Date());

    const bookedData = JSON.parse(localStorage.getItem('reservations') || '{}');
    const TOTAL_TIME_SLOTS = 8;

    const consultants = [
        { id: 1, name: '박준형', offDay: '일요일, 월요일' },
        { id: 2, name: '이지아', offDay: '일요일, 화요일' },
        { id: 3, name: '김한결', offDay: '일요일, 수요일' },
        { id: 4, name: '최현우', offDay: '일요일, 목요일' },
        { id: 5, name: '정나래', offDay: '일요일, 금요일' },
        { id: 6, name: '강민석', offDay: '월요일, 화요일' },
        { id: 7, name: '윤서연', offDay: '목요일, 금요일' },
        { id: 8, name: '임소희', offDay: '일요일, 월요일' },
    ];

    const selectedConsultant = consultants.find(c => c.id === parseInt(id));
    const consultantName = passedName || (selectedConsultant ? selectedConsultant.name : '상담사');

    const isOffDay = ({ date }) => {
        if (!selectedConsultant) return false;
        
        const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        const currentDayName = dayNames[date.getDay()];
        const isRegularOff = selectedConsultant.offDay.includes(currentDayName);

        const dateStr = date.toLocaleDateString();
        const bookedTimesForDate = bookedData[id]?.[dateStr] || [];
        const isFullyBooked = bookedTimesForDate.length >= TOTAL_TIME_SLOTS;

        return isRegularOff || isFullyBooked;
    };

    const handleNext = () => {
        const dateStr = selectedDate.toLocaleDateString();
        const stateToSend = {
            ...location.state,
            date: dateStr,
            consultantName: consultantName
        };
        console.log('DateSelect.jsx → /reserve/time state:', stateToSend);
        navigate(`/reserve/time/${id}`, { state: stateToSend });
    };

    return (
        <div style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <style>{calendarCustomCSS}</style>

            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px', color: '#1e293b' }}>상담 일자 선택</h2>
            
            <div style={{ marginBottom: '30px' }}>
                <span style={{ fontSize: '20px', color: '#2563eb', fontWeight: 'bold' }}>
                    {consultantName} 상담사
                </span>
            </div>

            <div style={calendarWrapperStyle}>
                <Calendar 
                    onChange={setSelectedDate}
                    value={selectedDate}
                    locale="ko-KR"
                    tileDisabled={isOffDay}
                    minDate={new Date()}
                    showNeighboringMonth={false}
                    formatDay={(locale, date) => date.toLocaleString('en', { day: 'numeric' })}
                    formatShortWeekday={(locale, date) => ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}
                />
            </div>

            <div style={{ marginTop: '40px' }}>
                <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '20px' }}>
                    선택된 날짜: <strong style={{ color: '#1e293b' }}>{selectedDate.toLocaleDateString()}</strong>
                </p>
                <button onClick={handleNext} style={nextBtnStyle}>
                    다음 단계로 (시간 선택)
                </button>
            </div>
        </div>
    );
}

const calendarWrapperStyle = {
    display: 'inline-block',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.04)',
    borderRadius: '25px',
    overflow: 'hidden',
    padding: '30px',
    backgroundColor: 'white',
    border: '1px solid #f1f5f9'
};

const nextBtnStyle = {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '16px 80px',
    border: 'none',
    borderRadius: '30px',
    fontSize: '17px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
};

const calendarCustomCSS = `
    .react-calendar {
        border: none !important;
        font-family: 'Pretendard', sans-serif;
        width: 350px !important;
    }
    .react-calendar__navigation {
        margin-bottom: 20px;
    }
    .react-calendar__navigation button {
        font-size: 18px;
        font-weight: bold;
        color: #1e293b;
    }
    .react-calendar__month-view__weekdays__weekday abbr {
        text-decoration: none;
        font-weight: 800;
        color: #94a3b8;
    }
    .react-calendar__tile {
        height: 55px;
        font-size: 16px;
        color: #475569;
    }
    .react-calendar__tile--active {
        background: #2563eb !important;
        color: white !important;
        border-radius: 50% !important;
        transform: scale(0.8);
    }
    .react-calendar__tile--now {
        background: #f1f5f9 !important;
        border-radius: 50%;
    }
    .react-calendar__tile:disabled {
        background: none !important;
        color: #cbd5e1 !important;
        text-decoration: line-through;
    }
    .react-calendar__tile:enabled:hover {
        background-color: #f8fafc !important;
        border-radius: 50%;
    }
`;