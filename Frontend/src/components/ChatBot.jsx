import React, { useState, useEffect, useRef } from 'react';
import './ChatBot.css';

const ChatBot = ({ isOpen, setIsOpen }) => {
    const [menuStep, setMenuStep] = useState("main");
    const [prevStep, setPrevStep] = useState("main");
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [reservationStep, setReservationStep] = useState({
        consultantName: "", 
        consultantId: null, 
        suggestedDate: "", 
        suggestedTime: "",
        tempTime: ""
    });
    const [myReservations, setMyReservations] = useState([]);

    const messagesEndRef = useRef(null);

    const consultants = [
        { 
            id: 1, name: '박준형', specialty: '진로/취업', 
            description: '실전 면접 전략 및 포트폴리오 최적화 전문가', 
            qualifications: '상담심리사 1급, 직업상담사 1급',
            experience: '대기업 인사팀 10년 근무, 커리어 코칭 500회 이상',
            offDays: [0, 1] 
        },
        { 
            id: 2, name: '이지아', specialty: '가족/연애', 
            description: '공감과 경청을 바탕으로 한 관계 개선 전문가', 
            qualifications: '가족상담사 1급, 심리분석사',
            experience: '심리상담센터 원장 8년, 연애/부부 상담 전문',
            offDays: [0, 2] 
        },
        { 
            id: 3, name: '김한결', specialty: '학업/스트레스', 
            description: '학업 스트레스 및 무기력증 케어 전문가', 
            qualifications: '청소년상담사 2급, 임상심리사',
            experience: '대학 상담센터 5년 근무, 수험생 멘탈 관리 전문',
            offDays: [0, 3] 
        },
        { 
            id: 4, name: '최현우', specialty: '자산관리', 
            description: '개인별 맞춤형 포트폴리오 자산 관리 컨설턴트', 
            qualifications: 'AFPK(재무설계사), 자산관리사(FP)',
            experience: '증권사 PB 12년 근무, 누적 자산 관리 100억 이상',
            offDays: [0, 4] 
        },
        { 
            id: 5, name: '정나래', specialty: '법률자문', 
            description: '일상 속 법률 고민을 명쾌하게 해결하는 전문가', 
            qualifications: '변호사 자격, 노무사 자격',
            experience: '법무법인 파트너 변호사, 생활법률 상담 1000건 이상',
            offDays: [0, 5] 
        },
        { 
            id: 6, name: '강민석', specialty: 'IT컨설팅', 
            description: '최신 IT 트렌드 분석 및 개발 커리어 가이드', 
            qualifications: '정보처리기사, AWS 솔루션 아키텍트',
            experience: '네이버/카카오 시니어 개발자 15년, 기술 면접관 경력',
            offDays: [6, 0] 
        },
        { 
            id: 7, name: '윤서연', specialty: '디자인코칭', 
            description: '디자인 감각 향상 및 포트폴리오 비주얼 코칭', 
            qualifications: '시각디자인 기사, 컬러리스트 기사',
            experience: '광고 대행사 아트디렉터 10년, 디자인 공모전 심사위원',
            offDays: [4, 5] 
        },
        { 
            id: 8, name: '임소희', specialty: '마케팅전략', 
            description: '데이터 기반의 실전 마케팅 전략 수립 전문가', 
            qualifications: '구글 애널리틱스(GA) 전문가, 검색광고마케터',
            experience: '스타트업 마케팅 팀장 7년, SNS 마케팅 캠페인 다수 진행',
            offDays: [1, 2] 
        }
    ];

    const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

    const initialMessage = { 
        text: "안녕하세요! 전담 비서 **프로봇**입니다.🦾\n원하시는 서비스 번호를 입력하거나 버튼을 클릭해주세요.\n\n1. 👤 상담사 소개\n2. 📅 상담 예약하기\n3. 📝 내 예약 확인/취소\n4. 🔍 맞춤형 상담사 찾기", 
        isBot: true 
    };

    useEffect(() => { if (messages.length === 0) setMessages([initialMessage]); }, []);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const findFastestSlot = async (target) => {
        try {
            const now = new Date();
            const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            for (let i = 0; i < 7; i++) {
                const searchDate = new Date();
                searchDate.setDate(now.getDate() + i);
                const dateStr = searchDate.toISOString().split('T')[0];
                const searchDayOnly = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate()).getTime();

                const response = await fetch(`http://localhost:5000/api/reservation/booked-times?consultantName=${target.name}&date=${dateStr}`);
                const data = await response.json();

                if (data && data.length > 0) {
                    let availableSlots = data;

                    if (searchDayOnly === todayOnly) {
                        const currentHour = now.getHours();
                        const currentMin = now.getMinutes();
                        availableSlots = data.filter(slot => {
                            const [slotHour, slotMin] = slot.split(":").map(Number);
                            return (slotHour > currentHour) || (slotHour === currentHour && slotMin > currentMin);
                        });
                    }

                    if (availableSlots.length > 0) {
                        return {
                            date: dateStr,
                            time: availableSlots[0]
                        };
                    }
                }
            }
            return null;
        } catch (error) {
            console.error("데이터 로드 실패:", error);
            return null;
        }
    };

    const getAllAvailableSlots = (consultant, dateStr) => {
        const bookedData = JSON.parse(localStorage.getItem('user_reservations') || '[]');
        const bookedTimes = bookedData
            .filter(res => String(res.consultantId) === String(consultant.id) && (res.date.replace(/\s/g, '') === dateStr.replace(/\s/g, '') || res.date.replace(/-/g, '.') === dateStr.replace(/\s/g, '')))
            .map(res => res.time);
        const now = new Date();
        let selectedDateStr = dateStr;
        if (dateStr.includes('.')) {
            const parts = dateStr.replace(/\./g, '').trim().split(' ');
            selectedDateStr = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
        const selectedDateParts = selectedDateStr.split('-');
        const selectedDayOnly = new Date(selectedDateParts[0], selectedDateParts[1] - 1, selectedDateParts[2]).getTime();
        const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const isToday = todayOnly === selectedDayOnly;
        const isPastDate = selectedDayOnly < todayOnly;
        return timeSlots.filter(t => {
            if (isPastDate) return false;
            if (isToday) {
                const [slotHour, slotMin] = t.split(":").map(Number);
                const currentHour = now.getHours();
                const currentMin = now.getMinutes();
                if (slotHour < currentHour || (slotHour === currentHour && slotMin <= currentMin)) return false;
            }
            return !bookedTimes.includes(t);
        });
    };

    const handleSend = async (directInput = null) => {

        const userMsg = (directInput || input).trim();
        if (!userMsg) return;

        if (userMsg !== "이전으로") setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
        setInput("");

        setTimeout(async () => {
            let botText = "";
            let nextMenu = menuStep;
            let nextRes = { ...reservationStep };

            if (userMsg === "처음으로" || userMsg === "0") {
                setMessages([initialMessage]); setMenuStep("main"); setPrevStep("main");
                setReservationStep({ consultantName: "", consultantId: null, suggestedDate: "", suggestedTime: "", tempTime: "" });
                return;
            }

            if (userMsg === "이전으로") {
                if (menuStep === "reserve_confirm_num" || menuStep === "reserve_time_select") {
                    setMessages(prev => [...prev, { text: `📅 **예약 신청**\n상담사 번호를 선택해주세요.\n\n${consultants.map((c, i) => `${i + 1}. ${c.name} 상담사`).join("\n")}`, isBot: true }]);
                    setMenuStep("reserve_select");
                } else if (menuStep === "reserve_select") {
                    setMessages(prev => [...prev, { text: "안녕하세요! 원하시는 서비스 번호를 입력해주세요.", isBot: true }]);
                    setMenuStep("main");
                } else {
                    setMessages([initialMessage]);
                    setMenuStep("main");
                    setReservationStep({ consultantName: "", consultantId: null, suggestedDate: "", suggestedTime: "", tempTime: "" });
                }
                return;
            }

            switch (menuStep) {
                case "recommend_detail": {
                    let targetName = "";
                    const field = nextRes.tempField;
                    const detail = userMsg;

                    if (field === "1") {
                        targetName = (detail === "3") ? "윤서연" : "이지아";
                    } else if (field === "2") {
                        targetName = "박준형";
                    } else if (field === "3") {
                        targetName = (detail === "1") ? "정나래" : "임소희";
                    } else if (field === "4") {
                        targetName = "강민석";
                    } else if (field === "5") {
                        targetName = "김한결";
                    } else if (field === "6") {
                        targetName = "최현우";
                    }

                    const consultant = consultants.find(c => c.name === targetName);

                    if (consultant) {
                        botText = `💡 **프로봇의 맞춤 추천!**\n\n선택하신 분야의 최고 전문가 **${consultant.name}** 상담사를 추천합니다.\n\n"${consultant.description}"\n\n1. 이 상담사로 바로 예약\n2. 다른 분야 추천받기\n3. 처음으로`;
                        nextRes = { ...nextRes, consultantId: consultant.id, consultantName: consultant.name };
                        nextMenu = "recommend_result";
                    } else {
                        botText = "상담사 정보를 불러오는데 실패했습니다. 처음으로 돌아갑니다.";
                        nextMenu = "main";
                    }
                    break;
                }
                                case "recommend_result":
                                    if (userMsg === "1") {
                                        const target = consultants.find(c => c.id === nextRes.consultantId);
                                        const fastest = await findFastestSlot(target);
                                        if (fastest) {
                                            botText = `📅 **${target.name}** 상담사와 가장 빠른 시간은\n**${fastest.date} ${fastest.time}**입니다.\n\n예약을 확정하시겠습니까?\n1. 확정하기\n2. 처음으로`;
                                            nextRes = { ...nextRes, suggestedDate: fastest.date, suggestedTime: fastest.time };
                                            nextMenu = "reserve_confirm_num";
                                        } else {
                                            botText = "죄송합니다. 현재 예약 가능한 시간이 없습니다.";
                                            nextMenu = "main";
                                        }
                                    } else if (userMsg === "2") {
                                        botText = `💡 **분야 선택**\n지금 가장 도움이 필요한 분야를 선택해주세요.\n\n1. 🤝 **대인관계** (가족, 친구, 연인 갈등)\n2. 💼 **커리어/진로** (스트레스, 번아웃)\n3. 🌿 **감정 케어** (우울, 불안, 무력감)\n4. ✨ **자존감/성격** (나를 더 알고 싶을 때)\n5. 📚 **학업/시험** (공부 스트레스, 진로)\n6. ☕ **일상 스트레스** (사소하지만 힘든 일)`;
                                        nextMenu = "recommend_field";
                                    } else {
                                        handleSend("처음으로");
                                        return;
                                    }
                                    break;
                case "main":
                    if (userMsg === "1") {
                        botText = "👤 **상담사 소개**\n상담사 번호를 선택해주세요.\n\n" + consultants.map((c, i) => `${i + 1}. ${c.name} 상담사 (${c.specialty})`).join("\n");
                        nextMenu = "intro";
                    } else if (userMsg === "2") {
                        botText = "📅 **예약 신청**\n상담사 번호를 선택해주세요.\n\n" + consultants.map((c, i) => `${i + 1}. ${c.name} 상담사`).join("\n");
                        nextMenu = "reserve_select";
                    } else if (userMsg === "3") {
                        try {
                            const response = await fetch(`http://localhost:5000/api/reservation/my?userId=Test1234`);
                            const data = await response.json();
                            if (data && data.length > 0) {
                                setMyReservations(data);
                                const list = data.map((res, i) =>
                                    `${i + 1}. **${res.consultant_name}** 상담사\n   🗓 ${res.res_date} ${res.res_time}`
                                ).join("\n\n");
                                botText = `📝 **내 예약 정보**\n\n${list}\n\n취소를 원하시면 번호를 입력해주세요.`;
                                nextMenu = "reserve_cancel";
                            } else {
                                botText = "현재 예약된 내역이 없습니다. 😊";
                                nextMenu = "main";
                            }
                        } catch (e) {
                            console.error("예약 확인 오류:", e);
                            botText = "죄송합니다. 예약 내역을 불러오는 중 문제가 발생했습니다.";
                            nextMenu = "main";
                        }
                    } else if (userMsg === "4") {
                        botText = `💡 **분야 선택**\n지금 가장 도움이 필요한 분야를 선택해주세요.\n\n1. 🤝 **대인관계** (가족, 친구, 연인 갈등)\n2. 💼 **커리어/진로** (스트레스, 번아웃)\n3. 🌿 **감정 케어** (우울, 불안, 무력감)\n4. ✨ **자존감/성격** (나를 더 알고 싶을 때)\n5. 📚 **학업/시험** (공부 스트레스, 진로)\n6. ☕ **일상 스트레스** (사소하지만 힘든 일)`;
                        nextMenu = "recommend_field"; 
                    }
                    break;

                case "intro":
                    const idx = parseInt(userMsg) - 1;
                    if (consultants[idx]) {
                        const ic = consultants[idx];
                        botText = `✨ **[${ic.name} 상세 정보]**\n\n📍 **분야**: ${ic.specialty}\n📜 **자격**: ${ic.qualifications}\n💼 **경력**: ${ic.experience}\n💬 **소개**: ${ic.description}\n\n다른 상담사를 보시려면 번호를 입력하시거나,\n메인으로 가려면 [🏠 처음으로]를 눌러주세요.`;
                    }
                    break;

                case "reserve_select":
                    const rIdx = parseInt(userMsg) - 1;
                    const rc = consultants[rIdx];
                    if (rc) {
                        nextRes = { ...nextRes, consultantId: rc.id, consultantName: rc.name };
                        botText = `📅 **[${rc.name} 상담사]**님에게 예약을 진행하시겠습니까?\n\n1. 예 (시간 확인)\n2. 아니오 (목록으로)`;
                        nextMenu = "ask_reserve_num";
                    }
                    break;

                case "recommend_field": {
                    let response = "";
                    switch(userMsg) {
                        case "1":
                            response = `🎯 **대인관계 상세 선택**\n가장 고민되는 관계를 골라주세요.\n\n1. 가족 갈등\n2. 친구/연인 관계\n3. 직장 내 인간관계`;
                            break;
                        case "2":
                            response = `🎯 **커리어 상세 선택**\n현재 상황에 맞는 단계를 골라주세요.\n\n1. 면접 전략/자소서\n2. 이직 고민\n3. 직장 내 스트레스/번아웃`;
                            break;
                        case "3":
                            response = `🎯 **감정 케어 상세 선택**\n지금 마음 상태를 알려주세요.\n\n1. 우울/불안감\n2. 무기력함\n3. 감정 조절 어려움`;
                            break;
                        case "4":
                            response = `✨ **자존감/성격 상세 선택**\n어떤 도움을 드릴까요?\n\n1. 자아 찾기\n2. 자신감 회복\n3. MBTI/심리검사`;
                            break;
                        case "5":
                            response = `📚 **학업 상세 선택**\n학생이신가요? 상황을 골라주세요.\n\n1. 성적/진로 고민\n2. 시험 불안증\n3. 대학원/논문 스트레스`;
                            break;
                        case "6":
                            response = `☕ **일상 스트레스 상세 선택**\n가볍게 털어놓으셔도 괜찮아요.\n\n1. 불면증/피로\n2. 육아/가사 스트레스\n3. 막연한 답답함`;
                            break;
                        default:
                            response = "번호를 다시 확인해주세요!";
                    }
                    botText = response;
                    if (["1","2","3","4","5","6"].includes(userMsg)) {
                        nextMenu = "recommend_detail";
                        nextRes = { ...nextRes, tempField: userMsg };
                    }
                    break;
                }

                case "ask_reserve_num":
                    if (userMsg === "1") {
                        const target = consultants.find(cons => cons.id === nextRes.consultantId);
                        const fastest = await findFastestSlot(target); 
                        if (fastest) {
                            botText = `📅 **${target.name}**님과 가장 빠른 시간은\n**${fastest.date} ${fastest.time}**입니다.\n\n1. 확정하기\n2. 다른 시간 확인\n3. 다른 날짜 확인`;
                            nextRes = { 
                                ...nextRes, 
                                suggestedDate: fastest.date, 
                                suggestedTime: fastest.time 
                            };
                            nextMenu = "reserve_confirm_num";
                        } else {
                            botText = "죄송합니다. 현재 예약 가능한 시간이 없습니다.";
                            nextMenu = "main";
                        }
                    } else if (userMsg === "2") {
                        botText = "📅 **예약 신청**\n상담사 번호를 선택해주세요.\n\n" + consultants.map((c, i) => `${i + 1}. ${c.name} 상담사`).join("\n");
                        nextMenu = "reserve_select";
                    }
                    break;

                case "reserve_confirm_num":
                    if (userMsg === "1") {
                        const userId = localStorage.getItem('userId') || '신창희';
                        const formattedDate = nextRes.suggestedDate.replace(/\. /g, '-').replace(/\./g, '');
                        const newRes = { 
                            userId: userId, 
                            consultantId: nextRes.consultantId, 
                            consultantName: nextRes.consultantName, 
                            date: formattedDate, 
                            time: nextRes.suggestedTime 
                        };
                        const existing = JSON.parse(localStorage.getItem('user_reservations') || '[]');
                        localStorage.setItem('user_reservations', JSON.stringify([newRes, ...existing]));
                        try {
                            await fetch('http://localhost:5000/api/reservation/book', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    userId: userId,
                                    consultantId: newRes.consultantId,
                                    consultantName: newRes.consultantName,
                                    reserveDate: newRes.date,
                                    reserveTime: newRes.time
                                })
                            });
                        } catch (err) { 
                            console.error("서버 DB 전송 실패 (네트워크 확인 필요):", err); 
                        }
                        botText = "✅ 예약이 성공적으로 완료되었습니다!\n어떤 계정으로 로그인하셨든 메인 화면의 **'내 예약 확인(카드)'**과 **'달력 예약 차단'**에 즉시 반영됩니다.\n\n다른 서비스가 필요하시면 [🏠 처음으로] 버튼을 눌러주세요.";
                        nextMenu = "complete";
                    } else if (userMsg === "2") {
                        const currentTarget = consultants.find(c => c.id === nextRes.consultantId);
                        const availableSlots = getAllAvailableSlots(currentTarget, nextRes.suggestedDate);
                        let dateTitle = nextRes.suggestedDate;
                        if (dateTitle.includes("-")) {
                            const [year, month, day] = dateTitle.split("-");
                            dateTitle = `${parseInt(month)}월 ${parseInt(day)}일`;
                        } else if (dateTitle.includes(".")) {
                            const parts = dateTitle.replace(/\./g, '').trim().split(' ');
                            dateTitle = `${parseInt(parts[1])}월 ${parseInt(parts[2])}일`;
                        }
                        if (availableSlots.length > 0) {
                            botText = `⏰ **${dateTitle} 기준 예약 가능 시간**\n원하시는 상담 시간을 선택해주세요.\n\n` + availableSlots.map((time, i) => `${i + 1}. ${time}`).join("\n");
                            nextMenu = "reserve_time_select";
                        } else {
                            botText = `죄송합니다. **${dateTitle}**에는 더 이상 예약 가능한 시간이 없습니다. 📅 '다른 날짜 확인'을 이용해 주세요.`;
                            nextMenu = "reserve_confirm_num";
                        }
                    } else if (userMsg === "3") {
                        const currentTarget = consultants.find(c => c.id === nextRes.consultantId);
                        let dateOptions = []; let tempDate = new Date();
                        for (let i = 0; i < 7; i++) {
                            if (!currentTarget.offDays.includes(tempDate.getDay())) dateOptions.push(`${tempDate.getFullYear()}. ${tempDate.getMonth() + 1}. ${tempDate.getDate()}.`);
                            tempDate.setDate(tempDate.getDate() + 1);
                        }
                        botText = "📅 **날짜 선택**\n상담을 원하시는 날짜를 입력해주세요. \n\n" + dateOptions.map((d, i) => `${i + 1}. ${d}`).join("\n");
                        nextMenu = "select_other_date";
                    }
                    break;

                case "select_other_time":
                    const times = getAllAvailableSlots(consultants.find(c => c.id === nextRes.consultantId), nextRes.suggestedDate);
                    const selectedTime = times[parseInt(userMsg) - 1];
                    if (selectedTime) {
                        nextRes.tempTime = selectedTime;
                        botText = `💡 선택하신 시간은 **${selectedTime}**입니다. 예약을 진행하시겠습니까?\n\n1. 예약하기\n2. 다시 고르기`;
                        nextMenu = "confirm_time_change";
                    }
                    break;

                case "confirm_time_change":
                    if (userMsg === "1") {
                        nextRes.suggestedTime = nextRes.tempTime;
                        botText = `✅ **${nextRes.suggestedDate} ${nextRes.suggestedTime}**\n\n1. 최종 확정하기\n2. 처음으로`;
                        nextMenu = "reserve_confirm_num";
                    } else {
                        const available = getAllAvailableSlots(consultants.find(c => c.id === nextRes.consultantId), nextRes.suggestedDate);
                        botText = `📅 다시 예약 가능 시간입니다.\n\n` + available.map((t, i) => `${i + 1}. ${t}`).join("\n");
                        nextMenu = "select_other_time";
                    }
                    break;

                case "select_other_date":
                    const currentTargetForDate = consultants.find(c => c.id === nextRes.consultantId);
                    let dateList = []; let d = new Date();
                    for (let i = 0; i < 14; i++) {
                        if (!currentTargetForDate.offDays.includes(d.getDay())) dateList.push(`${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`);
                        d.setDate(d.getDate() + 1);
                        if (dateList.length >= 7) break;
                    }
                    const selectedDate = dateList[parseInt(userMsg) - 1];
                    if (selectedDate) {
                        nextRes.suggestedDate = selectedDate;
                        const newTimes = getAllAvailableSlots(currentTargetForDate, selectedDate);
                        botText = `📅 **${selectedDate}** 예약 가능 시간입니다.\n\n` + newTimes.map((t, i) => `${i + 1}. ${t}`).join("\n");
                        nextMenu = "select_other_time";
                    }
                    break;

                case "complete":
                    if (userMsg === "처음으로" || userMsg === "0") {
                        setMessages([initialMessage]);
                        nextMenu = "main";
                    }
                    break;

                case "reserve_cancel": {
                    const choice = parseInt(userMsg);
                    if (choice > 0 && choice <= myReservations.length) {
                        const target = myReservations[choice - 1];
                        handleDelete(target.id || target.r_id);
                        botText = `✅ **${target.consultant_name}** 상담사님의 예약이 취소되었습니다.`;
                        nextMenu = "main";
                    } else {
                        botText = "번호를 확인 후 다시 입력해주세요. (예: 1)";
                        nextMenu = "reserve_cancel";
                    }
                    break;
                }

                default: break;
            }

            setMessages(prev => [...prev, { text: botText || "번호를 확인 후 다시 입력해주세요.", isBot: true }]);
            setMenuStep(nextMenu);
            setReservationStep(nextRes);
        }, 400);
    };

    const handleDelete = async (reservationId) => {
        console.log('🟡 예약 취소 요청 ID:', reservationId);
        try {
            const response = await fetch(`http://localhost:5000/api/reservation/cancel/${reservationId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
            }
        } catch (error) {
            console.error("삭제 중 오류:", error);
        }
    };

    return (
    <div className="chatbot-wrapper">
        <div className="chatbot-window">
            <div className="chatbot-header">
                <span>🦾 ProBot</span>
                <button className="close-btn" style={{fontSize: '20px', padding: '0 10px'}} onClick={() => setIsOpen(false)}>×</button>
            </div>
            <div className="chatbot-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message-bubble ${msg.isBot ? 'bot' : 'user'}`}>
                        <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="quick-menu-grid" style={{padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                {menuStep === "main" ? (
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px'}}>
                        <button onClick={() => handleSend("1")}>👤 소개</button>
                        <button onClick={() => handleSend("2")}>📅 예약</button>
                        <button onClick={() => handleSend("3")}>📝 확인</button>
                        <button onClick={() => handleSend("4")}>🔍 상담사찾기</button>
                    </div>
                ) : menuStep === "complete" ? (
                    <div style={{display: 'flex', gap: '5px'}}>
                        <button onClick={() => handleSend("처음으로")} style={{flex: 1}}>🏠 처음으로</button>
                    </div>
                ) : (
                    <div style={{display: 'flex', gap: '5px'}}>
                        <button onClick={() => handleSend("이전으로")} style={{flex: 1, backgroundColor: '#f0f0f0', color: '#333'}}>🔙 이전으로</button>
                        <button onClick={() => handleSend("처음으로")} style={{flex: 1, backgroundColor: '#6366f1', color: 'white'}}>🏠 처음으로</button>
                    </div>
                )}
            </div>
            <div className="chatbot-input-area" style={{
                padding: '10px',
                borderTop: '1px solid #eee',
                display: 'flex',
                gap: '5px',
                backgroundColor: '#fff'
            }}>
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="숫자나 메시지를 입력하세요..."
                    style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '20px',
                        outline: 'none'
                    }}
                />
                <button 
                    onClick={() => handleSend()}
                    style={{
                        padding: '8px 15px',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '15px',
                        cursor: 'pointer'
                    }}
                >
                    전송
                </button>
            </div>
        </div>
    </div>
);
}

export default ChatBot;