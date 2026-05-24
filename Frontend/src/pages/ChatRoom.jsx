import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
    withCredentials: true,
    autoConnect: false 
});

const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
};

const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    background: '#fff',
    borderBottom: '1px solid #ddd',
};

const headerInfoStyle = {
    flex: 1,
    marginLeft: '10px',
    display: 'flex',
    flexDirection: 'column',
};

const backBtnStyle = {
    border: 'none',
    background: 'none',
    fontSize: '20px',
    cursor: 'pointer',
};

const exitBtnStyle = {
    border: 'none',
    padding: '8px 12px',
    background: '#ef4444',
    color: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
};

const chatAreaStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    background: '#f8fafc',
};

const otherMsgWrapper = {
    alignSelf: 'flex-start',
};

const consultantMsgWrapper = {
    alignSelf: 'flex-end',
};

const systemMsgWrapper = {
    alignSelf: 'center',
};

const otherMsgStyle = {
    background: '#fff',
    padding: '12px 16px',
    borderRadius: '18px 18px 18px 0',
    fontSize: '14px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
    color: '#1e293b',
    border: '1px solid #e2e8f0',
    maxWidth: '320px',
    wordBreak: 'break-word',
    marginBottom: '2px',
};

const consultantMsgStyle = {
    background: '#2563eb',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '18px 18px 0 18px',
    fontSize: '14px',
    boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
    border: '1px solid #2563eb',
    maxWidth: '320px',
    wordBreak: 'break-word',
    marginBottom: '2px',
};

const systemTextStyle = {
    background: '#e5e7eb',
    color: '#374151',
    padding: '10px 15px',
    borderRadius: '12px',
};

const inputAreaStyle = {
    display: 'flex',
    gap: '10px',
    padding: '15px',
    borderTop: '1px solid #ddd',
    background: '#fff',
    alignItems: 'center',
};

const plusBtnStyle = {
    border: 'none',
    background: 'none',
    fontSize: '28px',
    color: '#2563eb',
    cursor: 'pointer',
    marginRight: '4px',
    padding: 0,
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const inputStyle = {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #ddd',
};

const sendBtnStyle = {
    border: 'none',
    padding: '12px 20px',
    background: '#2563eb',
    color: '#fff',
    borderRadius: '10px',
    cursor: 'pointer',
};

const avatarStyle = {
    fontSize: '18px',
    marginRight: '6px',
};

const timeStyle = {
    fontSize: '11px',
    color: '#64748b',
    marginLeft: '8px',
};

const statusDot = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#22c55e',
    display: 'inline-block',
    marginRight: '6px',
};

const surveyCardStyle = {
    alignSelf: 'center',
    width: '100%',
    maxWidth: '520px',
    background: '#ffffff',
    border: '1px solid #dbeafe',
    borderRadius: '14px',
    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.08)',
    padding: '16px',
};

const surveyTitleStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: '8px',
};

const surveyFieldStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '10px',
};

const surveyInputCommonStyle = {
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '14px',
};

const ChatRoom = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [infoPrompted, setInfoPrompted] = useState(false);
    const [surveyPrompted, setSurveyPrompted] = useState(false);
    const [handoffAnnounced, setHandoffAnnounced] = useState(false);
    const [handoffSent, setHandoffSent] = useState(false);

    const user = JSON.parse(sessionStorage.getItem('user'));
    const userRole = user?.role?.toUpperCase();
    const isConsultant = userRole === 'COUNSELOR' || userRole === 'CONSULTANT' || userRole === 'ADMIN';
    const loginUserName = user?.userName || user?.name || localStorage.getItem('userName') || '';
    const loginUserId = localStorage.getItem('userId') || user?.userId || user?.id || '';

    const [consultantName, setConsultantName] = useState("전문");
    const [userName, setUserName] = useState("");
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [chatLog, setChatLog] = useState(
        isConsultant
        ? []
        : [
            {
                id: 1,
                sender: 'probot',
                text: "안녕하세요! 저희 마음이음 상담서비스를 이용해 주셔서 대단히 감사합니다.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            {
                id: 2,
                sender: 'probot',
                text: (
                    <>
                        요청하신 {consultantName} 상담사를 곧 바로 연결해드릴게요! 잠시만 기다려 주세요.
                    </>
                ),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]
    );



    const [userEnded, setUserEnded] = useState(false);



    const handleEndConsultation = async () => {
        if (!window.confirm("상담을 종료하시겠습니까?")) return;
        try {
            await axios.post('http://localhost:5000/api/reservation/status', {
                reservationId: id,
                status: 'ended',
            });

            const endTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (isConsultant) {
                socket.emit('send_message', {
                    room: String(id),
                    sender: 'probot',
                    senderRole: 'probot',
                    senderName: '프로봇',
                    messageType: 'consultant_ended_survey',
                    time: endTime,
                });
                alert('상담이 종료되었습니다.');
                window.location.href = '/mypage';
                return;
            }

            socket.emit('send_message', {
                room: String(id),
                sender: 'probot',
                senderRole: 'probot',
                senderName: '프로봇',
                messageType: 'user_ended_notice',
                endedByName: loginUserName,
                time: endTime,
            });

            setUserEnded(true);
        } catch (error) {
            console.error('상담 종료 처리 실패:', error);
            alert('상담 종료 처리 중 오류가 발생했습니다.');
        }
    };
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const trimmed = message.trim();

        if (!isConsultant && trimmed === '입력완료') {
            if (!handoffAnnounced) {
                setChatLog((prev) => [
                    ...prev,
                    {
                        id: nextMsgId(),
                        sender: 'probot',
                        senderName: '프로봇',
                        text: '아직 설문조사가 제출되지 않았습니다. 설문을 먼저 완료해 주세요.',
                        time: new Date().toLocaleTimeString(),
                    },
                ]);
                setMessage('');
                return;
            }

            if (handoffSent) {
                setChatLog((prev) => [
                    ...prev,
                    {
                        id: nextMsgId(),
                        sender: 'probot',
                        senderName: '프로봇',
                        text: '이미 연결 절차가 진행 중입니다. 잠시만 기다려 주세요.',
                        time: new Date().toLocaleTimeString(),
                    },
                ]);
                setMessage('');
                return;
            }

            const handoffMessage = {
                room: String(id),
                sender: 'user',
                senderRole: 'user',
                senderName: loginUserName,
                text: '입력완료',
                time: new Date().toLocaleTimeString()
            };

            socket.emit('send_message', handoffMessage);
            setChatLog((prev) => [
                ...prev,
                { ...handoffMessage, id: nextMsgId() },
                {
                    id: nextMsgId(),
                    sender: 'probot',
                    senderName: '프로봇',
                    text: '설문 제출이 확인되었습니다. 상담사 연결을 시작합니다.',
                    time: new Date().toLocaleTimeString(),
                },
            ]);
            setHandoffSent(true);
            setMessage('');
            return;
        }

        const newMessage = {
            room: String(id),
            sender: isConsultant ? 'consultant' : 'user',
            senderRole: isConsultant ? 'consultant' : 'user',
            senderName: loginUserName,
            text: message,
            time: new Date().toLocaleTimeString()
        };
        socket.emit('send_message', newMessage);
        setChatLog((prev) => [...prev, { ...newMessage, id: nextMsgId() }]);
        setMessage('');
    };

    const fileInputRef = useRef();
    const handlePlusClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                const fileMsg = `IMAGE:${reader.result}`;
                const newMessage = {
                    room: String(id),
                    sender: isConsultant ? 'consultant' : 'user',
                    senderName: loginUserName,
                    text: fileMsg,
                    time: new Date().toLocaleTimeString()
                };
                socket.emit('send_message', newMessage);
                setChatLog((prev) => [...prev, { ...newMessage, id: nextMsgId() }]);
            };
            reader.readAsDataURL(file);
        } else if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = () => {
                const fileMsg = `FILE:${file.name}:` + reader.result;
                const newMessage = {
                    room: String(id),
                    sender: isConsultant ? 'consultant' : 'user',
                    senderName: loginUserName,
                    text: fileMsg,
                    time: new Date().toLocaleTimeString()
                };
                socket.emit('send_message', newMessage);
                setChatLog((prev) => [...prev, { ...newMessage, id: nextMsgId() }]);
            };
            reader.readAsText(file);
        } else {
            const fileMsg = `FILE:${file.name}`;
            const newMessage = {
                room: String(id),
                sender: isConsultant ? 'consultant' : 'user',
                senderName: loginUserName,
                text: fileMsg,
                time: new Date().toLocaleTimeString()
            };
            socket.emit('send_message', newMessage);
            setChatLog((prev) => [...prev, { ...newMessage, id: nextMsgId() }]);
        }
        e.target.value = '';
    };

    const scrollRef = useRef();
    const msgSeqRef = useRef(0);

    const nextMsgId = () => {
        msgSeqRef.current += 1;
        return `${Date.now()}-${msgSeqRef.current}`;
    };

    const surveyCompleteKey = `surveyCompleted:${id}`;

    useEffect(() => {
        const isSurveyDone = localStorage.getItem(surveyCompleteKey) === 'true';
        setHandoffAnnounced(isSurveyDone);
    }, [surveyCompleteKey]);

    useEffect(() => {
        console.log("🔥 채팅방 컴포넌트가 로드되었습니다. 예약 ID:", id);
        let isUnmounted = false;
        const roomId = String(id);
        let reservationEndTimeIso = null;
        let reservationConsultantName = '';
        let reservationUserName = '';

        const parseReservationStart = (dateValue, timeValue) => {
            const datePart = String(dateValue || '').trim().slice(0, 10);
            const timeMatch = String(timeValue || '').trim().match(/(\d{1,2}):(\d{2})/);
            if (!datePart || !timeMatch) return null;

            const [year, month, day] = datePart.split('-').map(Number);
            const hour = Number(timeMatch[1]);
            const minute = Number(timeMatch[2]);

            if ([year, month, day, hour, minute].some(Number.isNaN)) return null;

            const startDate = new Date(year, month - 1, day, hour, minute, 0, 0);
            if (Number.isNaN(startDate.getTime())) return null;
            return startDate;
        };

        const onConnect = () => {
            console.log('✅ 소켓 서버 연결 성공! ID:', socket.id);
            socket.emit('join_room', roomId);
            console.log(`📂 [Room ${roomId}] 연결 직후 입장 emit 완료`);
            if (reservationEndTimeIso) {
                socket.emit('register_endtime', {
                    roomId,
                    endTime: reservationEndTimeIso,
                    consultantName: reservationConsultantName,
                    userName: reservationUserName,
                });
                console.log(`⏰ [Room ${roomId}] 종료 알림 타이머 등록 요청 전송: ${reservationEndTimeIso}`);
            }
        };

        const onReceiveMessage = (data) => {
            console.log('📩 메시지 수신:', data);
            if (data?.messageType === 'consultant_ended_survey') {
                if (!isConsultant) {
                    setUserEnded(true);
                }
                return;
            }

            if (data?.messageType === 'user_ended_notice') {
                if (isConsultant) {
                    const endedByName = data?.endedByName || '사용자';
                    setChatLog((prev) => [...prev, {
                        id: nextMsgId(),
                        sender: 'probot',
                        senderName: '프로봇',
                        text: `${endedByName}님이 상담을 종료하였습니다.`,
                        time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    }]);

                    const shouldMove = window.confirm(`${endedByName}님이 상담을 종료하였습니다.\n확인을 누르면 마이페이지로 이동합니다.`);
                    if (shouldMove) {
                        navigate('/mypage', { replace: true });
                    }
                }
                return;
            }

            if (data?.sender === 'probot' || String(data?.senderRole || '').toLowerCase() === 'probot') {
                const probotText = String(data?.text || '');
                const isTimeRemainingNotice = probotText.startsWith('상담가능시간이 ');
                if (isConsultant && isTimeRemainingNotice) {
                    return;
                }

                setChatLog((prev) => [...prev, {
                    id: nextMsgId(),
                    sender: 'probot',
                    senderName: '프로봇',
                    text: data.text,
                    time: data.time
                }]);
                return;
            }
            const receivedRole = String(data?.senderRole || '').toLowerCase();
            const mappedSender = receivedRole === 'user' ? 'user' : receivedRole === 'consultant' ? 'consultant' : (isConsultant ? 'user' : 'consultant');
            setChatLog((prev) => [...prev, {
                id: nextMsgId(),
                sender: mappedSender,
                senderName: data?.senderName || '',
                text: data.text,
                time: data.time
            }]);
        };

        const onConnectError = (error) => {
            console.error('❌ 소켓 에러:', error);
        };

        socket.on('connect', onConnect);
        socket.on('receive_message', onReceiveMessage);
        socket.on('connect_error', onConnectError);

        const onHandoff = (data) => {
            if (isConsultant) {
                setChatLog((prev) => [
                    ...prev,
                    {
                        id: nextMsgId(),
                        sender: 'probot',
                        senderName: '프로봇',
                        text: `[알림] ${data.userName}님과의 상담이 시작되었습니다.`,
                        time: data.time,
                    },
                ]);
            }
        };
        socket.on('handoff', onHandoff);

        const normalizeStatus = (status) => String(status ?? '').trim().toLowerCase();

        const canEnterChat = (status) => {
            const normalized = normalizeStatus(status);
            return ['accepted', 'confirmed', 'approved', '1', 'true', 'y', 'yes', '수락', '승인', '완료'].includes(normalized);
        };

        const getFallbackStatus = async () => {
            if (isConsultant) {
                const response = await axios.get(`http://localhost:5000/api/consultant/reservations/${encodeURIComponent(loginUserName)}`);
                if (!Array.isArray(response.data)) return '';
                const target = response.data.find((item) => String(item?.id) === String(id));
                return target?.status || '';
            }

            const response = await axios.get('http://localhost:5000/api/my-reservations', {
                params: { userId: loginUserId, userName: loginUserName },
            });

            if (!Array.isArray(response.data)) return '';
            const target = response.data.find((item) => String(item?.id) === String(id));
            return target?.status || '';
        };

        const fetchReservationDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/reservation/${id}`);
                const { name, consultant_name, res_date, res_time } = response.data || {};
                let status = response?.data?.status;
                const normalizeName = (value) => String(value || '').trim().toLowerCase();
                const currentUserIsConsultant =
                    normalizeName(loginUserName) === normalizeName(consultant_name);

                if (!normalizeStatus(status)) {
                    status = await getFallbackStatus();
                }

                if (!canEnterChat(status)) {
                    const currentStatus = normalizeStatus(status) || '알 수 없음';
                    alert(`🔒 상담사가 예약을 수락하지 않았습니다. 승인 완료 후 입장 가능합니다.\n(현재 상태: ${currentStatus})`);
                    navigate('/mypage', { replace: true });
                    return;
                }

                const startDate = parseReservationStart(res_date, res_time);

                if (!currentUserIsConsultant) {
                    if (!startDate) {
                        alert('예약 시간 정보를 확인할 수 없어 채팅방에 입장할 수 없습니다.\n마이페이지에서 예약 정보를 확인해 주세요.');
                        navigate('/mypage', { replace: true });
                        return;
                    }

                    const now = new Date();
                    const tenMinBefore = new Date(startDate.getTime() - 10 * 60 * 1000);
                    if (now < tenMinBefore) {
                        alert('상담 시작 10분 전부터 채팅방 입장이 가능합니다.\n상담 시작 10분 전에 다시 입장해 주세요.');
                        navigate('/mypage', { replace: true });
                        return;
                    }
                }

                setConsultantName(consultant_name);
                setUserName(name);
                reservationConsultantName = consultant_name || '';
                reservationUserName = name || '';

                if (startDate) {
                    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
                    reservationEndTimeIso = endDate.toISOString();
                }

                if (!socket.connected) {
                    socket.connect();
                } else {
                    socket.emit('join_room', roomId);
                    console.log(`📂 [Room ${roomId}] 기존 연결에서 입장 emit 완료`);
                    if (reservationEndTimeIso) {
                        socket.emit('register_endtime', {
                            roomId,
                            endTime: reservationEndTimeIso,
                            consultantName: reservationConsultantName,
                            userName: reservationUserName
                        });
                        console.log(`⏰ [Room ${roomId}] 종료 알림 타이머 등록 요청 전송: ${reservationEndTimeIso}`);
                    }
                }
                if (!isUnmounted) {
                    setLoading(false);
                }
            } catch (err) {
                console.error(err);
                alert("예약 정보를 불러오는 중 오류가 발생했습니다.");
                if (!isUnmounted) {
                    navigate('/mypage', { replace: true });
                }
            }
        };
        fetchReservationDetail();

        return () => {
            isUnmounted = true;
            socket.off('connect', onConnect);
            socket.off('receive_message', onReceiveMessage);
            socket.off('connect_error', onConnectError);
            socket.off('handoff', onHandoff);
        };

    }, [id, isConsultant, loginUserId, loginUserName, navigate]);

    useEffect(() => {
        if (isConsultant || loading || userEnded || surveyPrompted) return;
        const userTalkCount = chatLog.filter((msg) => msg.sender === 'user').length;
        const consultantTalkCount = chatLog.filter((msg) => msg.sender === 'consultant').length;
        const realTalkCount = userTalkCount + consultantTalkCount;
        if (realTalkCount >= 4 && userTalkCount >= 2 && consultantTalkCount >= 2) {
            setSurveyPrompted(true);
            setTimeout(() => {
                setChatLog((prev) => [
                    ...prev,
                    {
                        id: nextMsgId(),
                        sender: 'probot',
                        senderName: '프로봇',
                        text: `${loginUserName || '사용자'}님 전문 상담사와 상담은 잘 받고 계시나요? 잠시 간단 설문을 참여해주시면 대단히 감사하겠습니다.`,
                        time: new Date().toLocaleTimeString(),
                    },
                    {
                        id: nextMsgId(),
                        sender: 'probot',
                        senderName: '프로봇',
                        text: (
                            <a href="https://docs.google.com/forms/d/1pvyQTXvMtWpE3aotGo8yYXkgU00Q2EhW45hvEEWitVA/viewform" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'underline' }}>
                                [상담 만족도 조사 참여하기]
                            </a>
                        ),
                        time: new Date().toLocaleTimeString(),
                    }
                ]);
            }, 800);
        }
    }, [chatLog, isConsultant, loading, userEnded, surveyPrompted, loginUserName]);

    useEffect(() => {
        if (!loading || isConsultant || infoPrompted) return;
        setInfoPrompted(true);

        const timer = setTimeout(() => {
            setChatLog((prev) => [
                ...prev,
                {
                    id: nextMsgId(),
                    sender: 'probot',
                    senderName: '프로봇',
                    text: (
                        <>
                            {loginUserName || '사용자'}님! 잠시만요, 원활한 상담을 위해 해당링크를 통해 상담정보를 입력해 주세요.<br />
                            해당 상담정보는 상담 목적으로만 사용되며, 고객님의 개인정보를 수집하지 않습니다.<br />
                            <a href={`/survey?reservationId=${encodeURIComponent(String(id))}&returnTo=${encodeURIComponent(`/chat/${id}`)}`} style={{ color: '#2563eb', fontWeight: 'bold' }}>
                                [상담정보 입력하기 (클릭)]
                            </a>
                            <br />
                            설문 제출 후 채팅창에 '입력완료'를 입력해 주세요.
                        </>
                    ),
                    time: new Date().toLocaleTimeString(),
                },
            ]);
        }, 500);

        return () => clearTimeout(timer);
    }, [loading, isConsultant, infoPrompted, loginUserName]);

    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={headerStyle}>
                    <button style={backBtnStyle} onClick={() => navigate('/mypage')}>←</button>
                    <div style={headerInfoStyle}>
                        <strong>{consultantName} 상담사</strong>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>상담방 정보를 불러오는 중...</span>
                    </div>
                </div>
                <div style={{ ...chatAreaStyle, alignItems: 'center', justifyContent: 'center' }}>
                    <div style={systemTextStyle}>예약 정보를 확인하고 있습니다...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <button style={backBtnStyle} onClick={() => navigate('/mypage')}>←</button>
                <div style={headerInfoStyle}>
                    <strong>{consultantName} 상담사</strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                        <span style={statusDot}></span>
                        {isConsultant ? `${userName || '내담자'}님과 상담 중` : '상담이 진행 중입니다'}
                    </span>
                </div>
                {!userEnded && (
                    <button style={exitBtnStyle} onClick={handleEndConsultation}>상담 종료</button>
                )}
            </div>

            <div style={chatAreaStyle} ref={scrollRef}>
                {chatLog.map((msg, index) => {
                    const isConsultantMsg = msg.sender === 'consultant';
                    const isProbot = msg.sender === 'probot';
                    return (
                        <div key={`${msg.id}-${index}`} style={isConsultantMsg ? consultantMsgWrapper : otherMsgWrapper}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isConsultantMsg ? 'flex-end' : 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: isProbot ? '#64748b' : (isConsultantMsg ? '#2563eb' : '#334155'), marginRight: isConsultantMsg ? 0 : 8, marginLeft: isConsultantMsg ? 8 : 0 }}>
                                        {isProbot ? '🤖 프로봇' : isConsultantMsg ? ((msg.senderName ? msg.senderName + ' 상담사' : `${consultantName} 상담사`)) : (msg.senderName || '내담자')}
                                    </span>
                                    <span style={{ ...timeStyle, marginLeft: isConsultantMsg ? 8 : 0, marginRight: isConsultantMsg ? 0 : 8 }}>{msg.time}</span>
                                </div>
                                <div style={isConsultantMsg ? consultantMsgStyle : otherMsgStyle}>
                                    {typeof msg.text === 'string' ? (
                                        msg.text.startsWith('IMAGE:') ? (
                                            <img src={msg.text.replace('IMAGE:', '')} alt="이미지" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, border: '1px solid #eee', margin: 4 }} />
                                        ) : msg.text.startsWith('FILE:') ? (
                                            msg.text.includes(':') && msg.text.split(':').length > 2 ? (
                                                <div style={{whiteSpace:'pre-wrap',fontSize:'13px',color:'#334155',background:'#f1f5f9',padding:'8px',borderRadius:'8px',border:'1px solid #e2e8f0',maxWidth:'220px'}}>
                                                    <b>{msg.text.split(':')[1]}</b>
                                                    <br/>
                                                    {msg.text.split(':').slice(2).join(':')}
                                                </div>
                                            ) : (
                                                <span>📎 {msg.text.replace('FILE:', '')}</span>
                                            )
                                        ) : (
                                            msg.text
                                        )
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}


            </div>

            {userEnded ? (
                <div style={{ padding: '24px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '18px', fontSize: '16px', color: '#2563eb', fontWeight: 'bold' }}>상담이 종료되었습니다.</div>
                    <div style={{ marginBottom: '18px' }}>
                        소중한 시간을 내어 상담에 참여해 주셔서 감사합니다. ✨<br /><br />
                        더 나은 서비스를 위해 아래 <b>만족도 조사</b>에 참여해 주세요!<br />
                        <a
                            href="https://docs.google.com/forms/d/1pvyQTXvMtWpE3aotGo8yYXkgU00Q2EhW45hvEEWitVA/viewform"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'underline' }}
                        >
                            [상담 만족도 조사 참여하기]
                        </a>
                    </div>
                    <button
                        style={{ ...exitBtnStyle, background: '#2563eb', marginTop: '10px' }}
                        onClick={() => { window.location.href = '/mypage'; }}
                    >
                        마이페이지로 이동
                    </button>
                </div>
            ) : (
                <form style={inputAreaStyle} onSubmit={handleSendMessage}>
                    <button type="button" style={plusBtnStyle} onClick={handlePlusClick}>＋</button>
                    <input
                        type="text"
                        style={inputStyle}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                        disabled={userEnded}
                    />
                    <button type="submit" style={sendBtnStyle} disabled={!message.trim() || userEnded}>전송</button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept="image/*,text/plain"
                        disabled={userEnded}
                    />
                </form>
            )}
        </div>
    );
};

export default ChatRoom;