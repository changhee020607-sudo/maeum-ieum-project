import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function Survey() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const reservationId = params.get('reservationId') || null;
    const returnTo = params.get('returnTo') || '/mypage';
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    const userName = user?.userName || user?.name || localStorage.getItem('userName') || '';

    const [formData, setFormData] = useState({
        mood: '',
        goal: '',
        mbti: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        await axios.post('http://localhost:5000/api/survey', {
            ...formData,
            reservationId,
            userName,
        });

        if (reservationId) {
            localStorage.setItem(`surveyCompleted:${reservationId}`, 'true');
        }

        alert('설문이 제출되었습니다. 감사합니다!');
        navigate(returnTo);
        } catch (error) {
        console.error('설문 제출 실패:', error);
        alert('설문 제출 중 문제가 발생했습니다. 다시 시도해주세요.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
        <h1>상담 전 설문조사</h1>
        <form onSubmit={handleSubmit}>
            <div>
            <label>현재 기분은 어떠신가요?</label>
            <select name="mood" value={formData.mood} onChange={handleChange} required>
                <option value="">선택하세요</option>
                <option value="happy">행복</option>
                <option value="sad">슬픔</option>
                <option value="angry">화남</option>
                <option value="anxious">불안</option>
            </select>
            </div>

            <div>
            <label>상담을 통해 얻고 싶은 것은 무엇인가요?</label>
            <textarea
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                placeholder="예: 스트레스 해소, 문제 해결 등"
                required
            />
            </div>

            <div>
            <label>MBTI 유형을 알고 계신가요?</label>
            <input
                type="text"
                name="mbti"
                value={formData.mbti}
                onChange={handleChange}
                placeholder="예: INFP, ESTJ 등"
            />
            </div>

            <button type="submit">제출</button>
        </form>
        </div>
    );
}

export default Survey;