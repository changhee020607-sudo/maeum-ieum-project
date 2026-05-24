import React, { useEffect, useRef, useState } from 'react';
import './Narvar.css';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Narvar({ isLoggedIn }) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const hasFetchedOnceRef = useRef(false);

    const sessionUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const userName =
        localStorage.getItem('userName') ||
        sessionUser.userName ||
        sessionUser.name ||
        '';

    const rawRole =
        localStorage.getItem('userRole') ||
        sessionUser.role ||
        sessionUser.userRole ||
        sessionUser.type ||
        'user';
    const finalRole = String(rawRole).trim().toLowerCase();

    const isAdmin = finalRole === 'admin' || finalRole === '관리자';
    const isCounselor =
        finalRole === 'counselor' ||
        finalRole === 'consultant' ||
        finalRole === '상담사' ||
        finalRole === 'teacher';

    const unreadCount = notifications.filter((n) => n.is_read === 0).length;
    const moveToMyPage = () => navigate('/mypage');

    const fetchNotifications = async () => {
        if (!isLoggedIn || !userName) return;

        try {
            const res = await axios.get(`http://localhost:5000/api/notifications?userName=${encodeURIComponent(userName)}`);
            const list = Array.isArray(res.data) ? res.data : [];
            const filtered = list.filter(
                (n) => n.user_name === userName || n.user_name === '전체'
            );

            setNotifications((prev) => {
                if (!hasFetchedOnceRef.current) {
                    hasFetchedOnceRef.current = true;
                    return filtered;
                }

                const prevIds = new Set(prev.map((n) => n.id));
                const freshNotis = filtered.filter((n) => !prevIds.has(n.id));

                if (freshNotis.length > 0) {
                    freshNotis.forEach((noti) => {
                        if (noti.message?.includes('수락')) {
                            toast.success(`수락 알림: ${noti.message}`, {
                                position: 'top-right',
                                autoClose: 5000,
                                onClick: moveToMyPage,
                                closeOnClick: true,
                            });
                        } else if (noti.message?.includes('거절')) {
                            toast.error(`거절 알림: ${noti.message}`, {
                                position: 'top-right',
                                autoClose: false,
                                onClick: moveToMyPage,
                                closeOnClick: true,
                            });
                        } else {
                            toast.info(`새 알림: ${noti.message}`, {
                                position: 'top-right',
                                autoClose: 5000,
                                onClick: moveToMyPage,
                                closeOnClick: true,
                            });
                        }
                    });
                }

                return filtered;
            });
        } catch (err) {
            console.error('알림 로드 실패:', err);
        }
    };

    useEffect(() => {
        if (!isLoggedIn || !userName) {
            setNotifications([]);
            hasFetchedOnceRef.current = false;
            return;
        }

        hasFetchedOnceRef.current = false;
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000);
        return () => clearInterval(interval);
    }, [isLoggedIn, userName]);

    const handleBellClick = async () => {
        setShowDropdown((prev) => !prev);

        if (unreadCount > 0 && userName) {
            try {
                await axios.post('http://localhost:5000/api/notifications/read', { userName });
                setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleDeleteNotification = async (e, id) => {
        e.stopPropagation();

        try {
            await axios.delete(`http://localhost:5000/api/notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            console.error('알림 삭제 실패:', err);
            alert('알림 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        localStorage.clear();
        window.dispatchEvent(new Event("loginStatusChange"));
        navigate('/login');
    };

    return (
        <nav className="navbar" style={navStyle}>
            <div className="navbar-logo-container" style={logoStyle} onClick={() => navigate('/')}> 
                <img 
                    src="/images/logo.png" 
                    alt="마음이음 로고" 
                    className="navbar-logo"
                    style={{ 
                        height: '100px',
                        filter: 'drop-shadow(0px 2px 4px rgba(255, 140, 0, 0.3))', 
                        display: 'block',
                        objectFit: 'contain'
                    }} 
                />
            </div>

            <div className="navbar-menu" style={menuStyle}>
                
                {!isAdmin && !isCounselor && (
                    <>
                        <Link to="/reserve/consultants" style={linkStyle}>상담 예약</Link>
                        <Link to="/check" style={linkStyle}>예약 확인</Link>
                        <Link to="/reserve/modify-list" style={linkStyle}>일정 변경</Link>
                        <Link to="/cancel" style={linkStyle}>예약 취소</Link>
                    </>
                )}

                {!isAdmin && <div style={divider} />}

                <span style={{ ...linkStyle, cursor: 'pointer', fontWeight: 'bold', color: '#222' }} onClick={() => navigate('/notices')}>
                    공지사항
                </span>
                <span style={{ ...linkStyle, cursor: 'pointer', fontWeight: 'bold', color: '#222' }} onClick={() => navigate('/voc/전체')}>
                    고객의 소리
                </span>

                {isLoggedIn ? (
                    <>
                        <span style={welcomeMessageStyle}>
                            {userName}님 환영합니다
                        </span>
                        <div style={bellWrapperStyle} onClick={handleBellClick}>
                            <span style={bellIconStyle}>🔔</span>
                            {unreadCount > 0 && <span style={badgeStyle}>{unreadCount}</span>}

                            {showDropdown && (
                                <div style={dropdownStyle} onClick={(e) => e.stopPropagation()}>
                                    <div style={dropdownTitleStyle}>알림 센터</div>
                                    {notifications.length === 0 ? (
                                        <div style={emptyStyle}>도착한 알림이 없습니다.</div>
                                    ) : (
                                        notifications.map((item) => (
                                            <div
                                                key={item.id}
                                                style={{
                                                    ...itemStyle,
                                                    backgroundColor: item.is_read === 0 ? '#f0f9ff' : '#fff',
                                                }}
                                            >
                                                <div style={{ whiteSpace: 'pre-line', lineHeight: '1.4' }}>{item.message}</div>
                                                <small style={dateStyle}>
                                                    {new Date(item.created_at).toLocaleString('ko-KR', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </small>
                                                <button
                                                    onClick={(e) => handleDeleteNotification(e, item.id)}
                                                    style={deleteBtnStyle}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.color = '#ef4444';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.color = '#94a3b8';
                                                    }}
                                                >
                                                    x
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        {!isAdmin && (
                            <Link to="/mypage" style={linkStyle}>마이페이지</Link>
                        )}
                        <button onClick={handleLogout} style={logoutBtnStyle}>로그아웃</button>
                    </>
                ) : (
                    <Link to="/login" style={loginBtnStyle}>로그인</Link>
                )}
            </div>
        </nav>
    );
}

const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '120px', padding: '0 40px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 };
const logoStyle = { cursor: 'pointer', display: 'flex', alignItems: 'center' };
const menuStyle = { display: 'flex', alignItems: 'center', gap: '25px' };
const linkStyle = { textDecoration: 'none', color: '#475569', fontWeight: '600', fontSize: '15px' }; 
const divider = { width: '1px', height: '16px', backgroundColor: '#e2e8f0', margin: '0 10px' };
const welcomeMessageStyle = { fontSize: '13px', color: '#2563eb', fontWeight: 'bold', marginLeft: '10px' };
const loginBtnStyle = { textDecoration: 'none', padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: '500' };
const logoutBtnStyle = { padding: '10px 20px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#475569', fontSize: '14px', fontWeight: '500', marginLeft: '10px' };
const bellWrapperStyle = { position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const bellIconStyle = { fontSize: '20px' };
const badgeStyle = {
    position: 'absolute',
    top: '-6px',
    right: '-8px',
    background: '#ef4444',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 'bold',
    borderRadius: '50%',
    padding: '2px 5px',
    lineHeight: 1,
};
const dropdownStyle = {
    position: 'absolute',
    top: '30px',
    right: '0',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
    width: '300px',
    zIndex: 9999,
    maxHeight: '360px',
    overflowY: 'auto',
    padding: '12px 0',
};
const dropdownTitleStyle = {
    padding: '0 16px 10px 16px',
    borderBottom: '1px solid #f1f5f9',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#1e293b',
};
const emptyStyle = { padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' };
const itemStyle = { position: 'relative', padding: '12px 40px 12px 16px', borderBottom: '1px solid #f8fafc', fontSize: '13px', color: '#334155', textAlign: 'left' };
const dateStyle = { color: '#94a3b8', fontSize: '11px', marginTop: '6px', display: 'block' };
const deleteBtnStyle = {
    position: 'absolute',
    top: '12px',
    right: '14px',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 'bold',
    padding: '0 4px',
    lineHeight: 1,
};