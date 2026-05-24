import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Narvar from './components/Narvar';
import ChatBot from './components/ChatBot';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import FindId from './pages/FindId';
import FindPw from './pages/FindPw';
import ConsultantList from './pages/ConsultantList';
import ConsultantReserve from './pages/ConsultantReserve';
import DateSelect from './pages/DateSelect';
import TimeSelect from './pages/TimeSelect';
import MyReservations from './pages/MyReservations';
import VocListPage from './pages/VOC/VocListPage';
import VocDetailPage from './pages/VocDetailPage';
import VocRegistration from './pages/VocRegistration';
import ChatRoom from './pages/ChatRoom';
import LogDetail from './pages/LogDetail';
import AdminDashboard from './pages/AdminDashboard';
import ReservationModifyListPage from './pages/ReservationModifyListPage';
import NoticeList from './pages/NoticeList';
import NoticeWrite from './pages/NoticeWrite';
import NoticeEdit from './pages/NoticeEdit';
import NoticeDetail from './pages/NoticeDetail';
import MyPage from './pages/MyPage';
import Survey from './pages/Survey';

const checkAuth = () => {
    const user = sessionStorage.getItem('user');
    return user !== null && user !== 'undefined' && user !== 'null';
};

const PrivateRoute = ({ children }) => {
    const isAuth = checkAuth();

    useEffect(() => {
        if (!isAuth) {
            alert("로그인 후 이용 가능합니다.");
        }
    }, [isAuth]);

    return isAuth ? children : <Navigate to="/login" replace />;
};

const AuthManager = ({ isLoggedIn, setIsLoggedIn }) => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(600);
    const timerRef = useRef(null);

    const handleAutoLogout = useCallback(() => {
        if (!checkAuth()) return;
        alert("활동이 없어 보안을 위해 자동 로그아웃되었습니다.");
        sessionStorage.clear();
        setIsLoggedIn(false);
        navigate('/login');
        window.location.reload();
    }, [navigate, setIsLoggedIn]);

    const resetTimer = useCallback(() => {
        if (checkAuth()) {
            setTimeLeft(600);
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleAutoLogout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    }, [handleAutoLogout]);

    useEffect(() => {
        if (isLoggedIn) {
            resetTimer();
            window.addEventListener('click', resetTimer);
            window.addEventListener('keydown', resetTimer);
            window.addEventListener('scroll', resetTimer);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            window.removeEventListener('click', resetTimer);
            window.removeEventListener('keydown', resetTimer);
            window.removeEventListener('scroll', resetTimer);
        };
    }, [isLoggedIn, resetTimer]);

    if (!isLoggedIn) return null;

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div style={timerBoxStyle}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>자동 로그아웃</span>
            <strong style={{ color: '#ef4444', fontSize: '15px' }}>{formatTime(timeLeft)}</strong>
            <button onClick={resetTimer} style={extendBtnStyle}>연장</button>
        </div>
    );
};

const timerBoxStyle = {
    position: 'absolute', // Adjusted to align near the logo
    top: '20px', // Near the logo
    left: '200px', // Moved further to the right to ensure no overlap with the logo
    backgroundColor: '#ffffff',
    padding: '12px 15px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid #fee2e2',
    minWidth: '85px'
};
const extendBtnStyle = { marginTop: '6px', padding: '3px 8px', fontSize: '10px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' };

function App() {
    const [isChatBotOpen, setIsChatBotOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(checkAuth());

    useEffect(() => {
        const handleStatusChange = () => {
            const auth = checkAuth();
            setIsLoggedIn(auth);
        };
        window.addEventListener("loginStatusChange", handleStatusChange);
        return () => window.removeEventListener("loginStatusChange", handleStatusChange);
    }, []);

    return (
        <>
            <AuthManager isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <div className="App">
                <Narvar isLoggedIn={isLoggedIn} />
                
                <div style={{ minHeight: '80vh', paddingTop: '20px' }}>
                    <Routes>
                        <Route path="/" element={<Home setIsChatBotOpen={setIsChatBotOpen} />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/survey" element={<Survey />} />
                        
                        <Route path="/find-id" element={<FindId />} />
                        <Route path="/find-pw" element={<FindPw />} />
                        
                        <Route path="/consultants" element={<PrivateRoute><ConsultantList /></PrivateRoute>} />
                        <Route path="/reserve/consultants" element={<PrivateRoute><ConsultantReserve /></PrivateRoute>} /> 
                        <Route path="/reserve/date/:id" element={<PrivateRoute><DateSelect /></PrivateRoute>} />
                        <Route path="/reserve/time/:id" element={<PrivateRoute><TimeSelect /></PrivateRoute>} />
                        <Route path="/reserve/modify-list" element={<PrivateRoute><ReservationModifyListPage /></PrivateRoute>} />
                        
                        <Route path="/check" element={<PrivateRoute><MyReservations /></PrivateRoute>} />
                        <Route path="/cancel" element={<PrivateRoute><MyReservations /></PrivateRoute>} />
                        <Route path="/modify" element={<PrivateRoute><MyReservations /></PrivateRoute>} />
                        
                        <Route path="/voc" element={<PrivateRoute><VocListPage /></PrivateRoute>} />
                        <Route path="/voc/detail/:id" element={<PrivateRoute><VocDetailPage /></PrivateRoute>} />
                        <Route path="/voc/:category" element={<PrivateRoute><VocListPage /></PrivateRoute>} />
                        <Route path="/voc/register" element={<PrivateRoute><VocRegistration /></PrivateRoute>} />
                        <Route path="/notices" element={<NoticeList />} />
                        <Route path="/notices/write" element={<NoticeWrite />} />
                        <Route path="/notices/:id" element={<NoticeDetail />} />
                        <Route path="/notices/:id/edit" element={<NoticeEdit />} />
                        <Route path="/chat/:id" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />
                        <Route path="/log/:id" element={<PrivateRoute><LogDetail /></PrivateRoute>} />
                        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                        <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
                    </Routes>
                </div>

                {isChatBotOpen && (
                    <ChatBot isOpen={isChatBotOpen} setIsOpen={setIsChatBotOpen} isLoggedIn={isLoggedIn} />
                )}

                <ToastContainer />
            </div>
        </>
    );
}

export default App;