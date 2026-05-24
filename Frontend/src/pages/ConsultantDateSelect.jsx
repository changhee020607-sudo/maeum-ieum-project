import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { consultants } from '../data'; 

export default function ConsultantDateSelect() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const consultant = consultants.find(c => String(c.id) === String(id));
    const offDay = consultant ? consultant.offDay : ""; 

    const now = new Date();
    const [currentMonth, setCurrentMonth] = useState(now.getMonth());
    const [currentYear, setCurrentYear] = useState(now.getFullYear());
    const [selectedDate, setSelectedDate] = useState('');

    const generateCalendar = () => {
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= lastDate; i++) days.push(i);
        return days;
    };

    const handleDateClick = (day) => {
        if (!day) return;
        const dateObj = new Date(currentYear, currentMonth, day);
        const dayName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"][dateObj.getDay()];

        if (dayName === offDay) {
            alert(`${offDay}은 해당 상담사님의 휴무일입니다.`);
            return;
        }

        const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(formattedDate);
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h2 style={titleStyle}>{consultant?.name} 상담사 예약</h2>
                    <span style={offDayBadgeStyle}>매주 {offDay} 휴무</span>
                </div>

                <div style={headerStyle}>
                    <button onClick={() => setCurrentMonth(prev => prev - 1)} style={arrowBtnStyle}>&lt;</button>
                    <h3 style={monthTitleStyle}>{currentYear}년 {currentMonth + 1}월</h3>
                    <button onClick={() => setCurrentMonth(prev => prev + 1)} style={arrowBtnStyle}>&gt;</button>
                </div>

                <div style={calendarGridStyle}>
                    {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                        <div key={d} style={weekdayStyle}>{d}</div>
                    ))}
                    {generateCalendar().map((day, i) => {
                        const dateObj = day ? new Date(currentYear, currentMonth, day) : null;
                        const dayName = dateObj ? ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"][dateObj.getDay()] : "";
                        const isOffDay = dayName === offDay;
                        const isSelected = selectedDate === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                        return (
                            <div key={i} onClick={() => !isOffDay && handleDateClick(day)}
                                style={{
                                    ...dayStyle,
                                    backgroundColor: isSelected ? '#2563eb' : 'transparent',
                                    color: isOffDay ? '#e2e8f0' : (isSelected ? '#fff' : '#1e293b'),
                                    cursor: isOffDay || !day ? 'default' : 'pointer',
                                    textDecoration: isOffDay ? 'line-through' : 'none'
                                }}>
                                {day}
                            </div>
                        );
                    })}
                </div>
                <div style={footerStyle}>
                    <button onClick={() => navigate(-1)} style={backBtnStyle}>이전으로</button>
                    <button onClick={() => selectedDate && navigate(`/reserve/time/${id}?date=${selectedDate}`)} 
                            style={{...nextBtnStyle, opacity: selectedDate ? 1 : 0.5}} disabled={!selectedDate}>
                        시간 선택하기
                    </button>
                </div>
            </div>
        </div>
    );
}

const containerStyle = { padding: '60px 20px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center' };
const cardStyle = { backgroundColor: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxWidth: '450px', width: '100%' };
const titleStyle = { fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: '0' };
const offDayBadgeStyle = { backgroundColor: '#fff1f2', color: '#e11d48', fontSize: '12px', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' };
const arrowBtnStyle = { border: 'none', background: '#f1f5f9', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer' };
const monthTitleStyle = { fontSize: '18px', fontWeight: '700' };
const calendarGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '30px' };
const weekdayStyle = { fontSize: '13px', color: '#94a3b8', fontWeight: 'bold', textAlign: 'center' };
const dayStyle = { height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', fontSize: '15px', transition: '0.2s' };
const footerStyle = { display: 'flex', gap: '12px' };
const backBtnStyle = { flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#fff', cursor: 'pointer' };
const nextBtnStyle = { flex: 2, padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 'bold' };