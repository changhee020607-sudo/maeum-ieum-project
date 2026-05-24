const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');
require('dotenv').config();

const db = require('./db'); 
const reservationRouter = require('./routes/reservation');

const app = express();
const port = 5000;
const otpStore = new Map();
const verifiedStore = new Map();
const dailySendStore = new Map();
const DAILY_SEND_LIMIT = 5;

app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());

const normalizePhone = (value) => String(value || '').replace(/\D/g, '');

const isValidPhone = (value) => /^01\d{8,9}$/.test(value);

const makeOtpKey = ({ purpose, phone, userId, userName }) => {
    return [
        purpose,
        normalizePhone(phone),
        String(userId || '').trim(),
        String(userName || '').trim()
    ].join('|');
};

const getKstDayKey = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
    const kst = new Date(utc + 9 * 60 * 60 * 1000);
    const y = kst.getFullYear();
    const m = String(kst.getMonth() + 1).padStart(2, '0');
    const d = String(kst.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const makeDailyLimitKey = ({ purpose, phone, userId, userName }) => {
    return [
        getKstDayKey(),
        purpose,
        normalizePhone(phone),
        String(userId || '').trim(),
        String(userName || '').trim()
    ].join('|');
};

const cleanupAuthStores = () => {
    const now = Date.now();
    for (const [key, value] of otpStore.entries()) {
        if (value.expiresAt <= now) otpStore.delete(key);
    }
    for (const [token, value] of verifiedStore.entries()) {
        if (value.expiresAt <= now) verifiedStore.delete(token);
    }
};

setInterval(cleanupAuthStores, 60 * 1000).unref();

const ensureUsersPhoneColumn = () => {
    const sql = 'ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL';
    db.query(sql, (err) => {
        if (!err) {
            console.log('✅ users.phone 컬럼이 준비되었습니다.');
            return;
        }
        if (err.code === 'ER_DUP_FIELDNAME') {
            return;
        }
        console.error('users.phone 컬럼 준비 실패:', err.message);
    });
};

app.get('/api/consultant/reservations/:consultantName', (req, res) => {
    let consultantName = req.params.consultantName;
    try {
        consultantName = decodeURIComponent(consultantName);
    } catch (e) {
        console.error("디코딩 에러:", e);
    }
    console.log("====== [백엔드 수신] 조회 요청된 상담사 이름: ======", consultantName);
    const sql = `
        SELECT
            id,
            DATE_FORMAT(res_date, '%Y-%m-%d') AS res_date,
            res_time,
            name,
            consultant_name,
            status,
            rejection_reason
        FROM reservations
        WHERE consultant_name = ?
        ORDER BY res_date ASC, res_time ASC
    `;
    db.query(sql, [consultantName], (err, result) => {
        if (err) {
            console.error("DB 쿼리 에러:", err);
            return res.status(500).json(err);
        }
        console.log(`[DB 조회 완료] ${consultantName}의 예약 개수:`, result.length);
        res.json(result);
    });
});

app.patch('/api/reservation/:id/accept', (req, res) => {
    const { id } = req.params;
    console.log(`[알림 디버깅] 예약 수락 요청 발생 - 예약 ID: ${id}`);

    const selectSql = "SELECT name AS user_name, consultant_name AS counselor_name FROM reservations WHERE id = ?";

    db.query(selectSql, [id], (selectErr, rows) => {
        if (selectErr) {
            console.error("수락 전 조회 실패:", selectErr);
            return res.status(500).json(selectErr);
        }
        if (rows.length === 0) {
            console.log(`[알림 디버깅] ID ${id}에 해당하는 예약을 찾을 수 없습니다.`);
            return res.status(404).json({ message: "예약을 찾을 수 없습니다." });
        }

        const targetUser = rows[0].user_name;
        const counselorName = rows[0].counselor_name;
        console.log(`[알림 디버깅] 수신자: ${targetUser}, 상담사: ${counselorName}`);

        const updateSql = "UPDATE reservations SET status = 'confirmed' WHERE id = ?";
        db.query(updateSql, [id], (err, result) => {
            if (err) return res.status(500).json(err);

            const alertSql = "INSERT INTO notifications (user_name, message) VALUES (?, ?)";
            const alertMsg = `✔️ [${counselorName}] 상담사님이 예약을 수락하셨습니다. 마이페이지를 확인해주세요!`;

            db.query(alertSql, [targetUser, alertMsg], (alertErr) => {
                if (alertErr) {
                    console.error("❌ 수락 알림 DB 인서트 실패:", alertErr);
                } else {
                    console.log(`✅ [${targetUser}]님에게 수락 알림 저장 완료!`);
                }

                return res.json({ message: "예약이 수락되었습니다." });
            });
        });
    });
});

app.patch('/api/reservation/:id/reject', (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    const selectSql = "SELECT name AS user_name, consultant_name AS counselor_name FROM reservations WHERE id = ?";

    db.query(selectSql, [id], (selectErr, rows) => {
        if (selectErr) return res.status(500).json(selectErr);
        if (rows.length === 0) return res.status(404).json({ message: "예약을 찾을 수 없습니다." });

        const targetUser = rows[0].user_name;
        const counselorName = rows[0].counselor_name;

        const sql = "UPDATE reservations SET status = 'rejected', rejection_reason = ? WHERE id = ?";
        db.query(sql, [reason, id], (err, result) => {
            if (err) return res.status(500).json(err);

            const alertSql = "INSERT INTO notifications (user_name, message) VALUES (?, ?)";
            const alertMsg = `❌ [${counselorName}] 상담사님이 예약을 거절하셨습니다.\n(사유: ${reason || '일정 조율 불가'})`;

            db.query(alertSql, [targetUser, alertMsg], (alertErr) => {
                if (alertErr) console.error("거절 알림 실패:", alertErr);
                res.json({ message: "예약이 거절되었습니다." });
            });
        });
    });
});

app.post('/api/reservation/status', (req, res) => {
    const { reservationId, status } = req.body; 
    const sql = "UPDATE reservations SET status = ? WHERE id = ?";
    
    db.query(sql, [status, reservationId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: `상태가 ${status}로 변경되었습니다.` });
    });
});

app.post('/api/survey', (req, res) => {
    const { mood, goal, mbti, reservationId, userName } = req.body || {};

    if (!io.roomTimers) io.roomTimers = {};

    if (!mood || !goal) {
        return res.status(400).json({ success: false, message: 'mood와 goal은 필수입니다.' });
    }

    const createTableSql = `
        CREATE TABLE IF NOT EXISTS surveys (
            id INT AUTO_INCREMENT PRIMARY KEY,
            reservation_id INT NULL,
            user_name VARCHAR(100) NULL,
            mood VARCHAR(50) NOT NULL,
            goal TEXT NOT NULL,
            mbti VARCHAR(20) NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(createTableSql, (createErr) => {
        if (createErr) {
            console.error('설문 테이블 생성 실패:', createErr);
            return res.status(500).json({ success: false, message: '설문 저장 준비 중 오류가 발생했습니다.' });
        }

        const insertSql = `
            INSERT INTO surveys (reservation_id, user_name, mood, goal, mbti)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            insertSql,
            [reservationId || null, userName || null, mood, goal, mbti || null],
            (insertErr, result) => {
                if (insertErr) {
                    console.error('설문 저장 실패:', insertErr);
                    return res.status(500).json({ success: false, message: '설문 저장 중 오류가 발생했습니다.' });
                }
                return res.json({ success: true, id: result.insertId, message: '설문이 저장되었습니다.' });
            }
        );
    });
});

app.post('/api/notices/:id/view', (req, res) => {
    const { id } = req.params;
    const sql = "UPDATE notices SET views = views + 1 WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        res.json({ success: true });
    });
});

app.get('/api/notices', (req, res) => {
    const sql = "SELECT * FROM notices ORDER BY created_at DESC";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

app.post('/api/notices', (req, res) => {
    const { title, content, writer } = req.body;
    const sql = "INSERT INTO notices (title, content, writer, created_at) VALUES (?, ?, ?, NOW())";
    db.query(sql, [title, content, writer || '관리자'], (err, result) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });

        const alertSql = "INSERT INTO notifications (user_name, message) VALUES ('전체', ?)";
        const alertMsg = `📢 새로운 공지사항이 등록되었습니다: ${title}`;

        db.query(alertSql, [alertMsg], (alertErr) => {
            if (alertErr) console.error("공지 알림 실패:", alertErr);
            res.json({ success: true, message: "공지사항이 등록되었습니다." });
        });
    });
});

app.get('/api/notices/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM notices WHERE id = ?";
    db.query(sql, [id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (!data || data.length === 0) return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
        return res.json(data[0]);
    });
});

app.put('/api/notices/:id', (req, res) => {
    const { id } = req.params;
    const { title, content, writer } = req.body;
    const sql = "UPDATE notices SET title = ?, content = ?, writer = ? WHERE id = ?";
    db.query(sql, [title, content, writer || '관리자', id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: '공지사항이 수정되었습니다.' });
    });
});

app.delete('/api/notices/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM notices WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: '공지사항이 삭제되었습니다.' });
    });
});

app.get('/api/notifications', (req, res) => {
    const { userName } = req.query;
    if (!userName) {
        return res.status(400).json({ message: 'userName이 필요합니다.' });
    }

    const sql = `
        SELECT id, user_name, message, is_read, created_at
        FROM notifications
        WHERE user_name IN (?, '전체')
        ORDER BY created_at DESC, id DESC
    `;

    db.query(sql, [userName], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(results);
    });
});

app.post('/api/notifications/read', (req, res) => {
    const { userName } = req.body;
    if (!userName) {
        return res.status(400).json({ message: 'userName이 필요합니다.' });
    }

    const sql = "UPDATE notifications SET is_read = 1 WHERE user_name IN (?, '전체') AND is_read = 0";
    db.query(sql, [userName], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ success: true, updated: result.affectedRows });
    });
});

app.delete('/api/notifications/:id', (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM notifications WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ success: true, message: '알림이 삭제되었습니다.' });
    });
});

app.get("/api/reservation/booked-times", (req, res) => {
    const { consultantName, date } = req.query; 
    const query = `
        SELECT res_time 
        FROM reservations 
        WHERE consultant_name = ? AND res_date = ?
    `;
    db.query(query, [consultantName, date], (err, results) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });

        let allSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
        let day = -1;
        if (date && date.length >= 10) {
            const [year, month, dayStr] = date.split('-');
            const dateObj = new Date(year, month - 1, dayStr);
            day = dateObj.getDay();
        }
        const isWeekend = (day === 0 || day === 6);
        if (!isWeekend) {
            allSlots = allSlots.filter(slot => slot !== "12:00");
        }

        const reservedTimes = results.map(r => r.res_time);
        const now = new Date();
        const availableSlots = allSlots.filter((time) => {
            if (reservedTimes.includes(time)) return false;

            const [hour, minute] = String(time).split(':').map(Number);
            const [year, month, dayStr] = String(date).split('-').map(Number);
            const slotStart = new Date(year, month - 1, dayStr, hour, minute, 0, 0);
            const cutoff = new Date(slotStart.getTime() - 10 * 60 * 1000);

            const isSameDate =
                now.getFullYear() === year &&
                now.getMonth() === month - 1 &&
                now.getDate() === dayStr;

            if (isSameDate && now >= cutoff) return false;
            return true;
        });
        res.json(availableSlots);
    });
});

app.use('/api/reservation', reservationRouter);

app.get('/api/voc', (req, res) => {
    const { userRole, userName } = req.query;
    const normalizedRole = String(userRole || '').trim().toUpperCase();

    if (normalizedRole === 'ADMIN' || normalizedRole === 'COUNSELOR') {
        const sql = "SELECT * FROM voc_list ORDER BY id DESC";
        db.query(sql, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json(results);
        });
        return;
    }

    const sql = "SELECT * FROM voc_list WHERE name = ? ORDER BY id DESC";
    db.query(sql, [userName], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(results);
    });
});

app.post('/api/voc', (req, res) => {
    const { category, name, email, title, content, date } = req.body;
    const sql = "INSERT INTO voc_list (category, name, email, title, content, date, views) VALUES (?, ?, ?, ?, ?, ?, 0)";
    db.query(sql, [category, name, email, title, content, date], (err, result) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        res.json({ message: "성공적으로 등록되었습니다.", id: result.insertId });
    });
});

app.get('/api/voc/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM voc_list WHERE id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "게시글이 없습니다." });
        return res.json(results[0]);
    });
});

app.put('/api/voc/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const sql = "UPDATE voc_list SET title = ?, content = ? WHERE id = ?";
    db.query(sql, [title, content, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        res.json({ message: "수정되었습니다." });
    });
});

app.delete('/api/voc/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM voc_list WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("VOC 삭제 에러:", err);
            return res.status(500).json({ error: "데이터베이스 삭제 오류" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "해당 게시글을 찾을 수 없습니다." });
        }

        return res.json({ message: "성공적으로 삭제되었습니다." });
    });
});

app.post('/api/voc/:id/reply', (req, res) => {
    const { id } = req.params;
    const { reply } = req.body;

    const sql = "UPDATE voc_list SET reply = ? WHERE id = ?";
    db.query(sql, [reply, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "해당 게시글을 찾을 수 없습니다." });
        }
        return res.json({ message: "답변이 성공적으로 저장되었습니다." });
    });
});

app.get('/api/check-id/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = "SELECT COUNT(*) as count FROM users WHERE userId = ?";
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ isDuplicate: result[0].count > 0 });
    });
});

app.post('/api/auth/phone/send-code', (req, res) => {
    const { purpose, userId, userName } = req.body || {};
    const phone = normalizePhone(req.body?.phone);

    if (!['find-id', 'reset-password'].includes(purpose)) {
        return res.status(400).json({ message: '올바른 인증 목적이 아닙니다.' });
    }

    if (!isValidPhone(phone)) {
        return res.status(400).json({ message: '휴대폰 번호 형식이 올바르지 않습니다.' });
    }

    if (purpose === 'find-id' && !String(userName || '').trim()) {
        return res.status(400).json({ message: '이름을 입력해 주세요.' });
    }

    if (purpose === 'reset-password' && !String(userId || '').trim()) {
        return res.status(400).json({ message: '아이디를 입력해 주세요.' });
    }

    const key = makeOtpKey({ purpose, phone, userId, userName });
    const limitKey = makeDailyLimitKey({ purpose, phone, userId, userName });
    const currentSentCount = dailySendStore.get(limitKey) || 0;

    if (currentSentCount >= DAILY_SEND_LIMIT) {
        return res.status(429).json({
            message: '하루 발송횟수를 초과했습니다.',
            quotaLabel: '하루 발송횟수 0/5'
        });
    }

    const sql = purpose === 'find-id'
        ? "SELECT id FROM users WHERE userName = ? AND REPLACE(REPLACE(phone, '-', ''), ' ', '') = ? LIMIT 1"
        : "SELECT id FROM users WHERE userId = ? AND REPLACE(REPLACE(phone, '-', ''), ' ', '') = ? LIMIT 1";

    const params = purpose === 'find-id'
        ? [String(userName).trim(), phone]
        : [String(userId).trim(), phone];

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ message: '인증번호 발송 중 오류가 발생했습니다.' });
        if (!results || results.length === 0) {
            return res.status(404).json({ message: '입력한 정보와 일치하는 계정을 찾을 수 없습니다.' });
        }

        const code = String(Math.floor(100000 + Math.random() * 900000));

        otpStore.set(key, {
            code,
            expiresAt: Date.now() + 3 * 60 * 1000,
            attempts: 0
        });

        const nextSentCount = currentSentCount + 1;
        dailySendStore.set(limitKey, nextSentCount);
        const quotaDisplay = DAILY_SEND_LIMIT - nextSentCount + 1;

        const isProduction = process.env.NODE_ENV === 'production';
        console.log(`[PHONE OTP] ${purpose} ${phone} code=${code}`);

        return res.json({
            success: true,
            message: '인증번호가 발급되었습니다.',
            devCode: isProduction ? undefined : code,
            quotaLabel: `하루 발송횟수 ${quotaDisplay}/5`
        });
    });
});

app.post('/api/auth/phone/verify-code', (req, res) => {
    const { purpose, userId, userName } = req.body || {};
    const phone = normalizePhone(req.body?.phone);
    const code = String(req.body?.code || '').trim();

    if (!['find-id', 'reset-password'].includes(purpose)) {
        return res.status(400).json({ message: '올바른 인증 목적이 아닙니다.' });
    }

    const key = makeOtpKey({ purpose, phone, userId, userName });
    const otp = otpStore.get(key);
    if (!otp || otp.expiresAt < Date.now()) {
        otpStore.delete(key);
        return res.status(400).json({ message: '인증번호가 만료되었거나 존재하지 않습니다.' });
    }

    if (otp.code !== code) {
        otp.attempts += 1;
        if (otp.attempts >= 5) otpStore.delete(key);
        return res.status(400).json({ message: '인증번호가 일치하지 않습니다.' });
    }

    otpStore.delete(key);
    const verifyToken = crypto.randomBytes(24).toString('hex');

    verifiedStore.set(verifyToken, {
        purpose,
        phone,
        userId: String(userId || '').trim(),
        userName: String(userName || '').trim(),
        expiresAt: Date.now() + 10 * 60 * 1000
    });

    return res.json({ success: true, verifyToken, message: '휴대폰 인증이 완료되었습니다.' });
});

app.post('/api/auth/find-id-by-phone', (req, res) => {
    const { userName, verifyToken } = req.body || {};
    const phone = normalizePhone(req.body?.phone);
    const verified = verifiedStore.get(String(verifyToken || ''));

    if (!verified || verified.expiresAt < Date.now() || verified.purpose !== 'find-id') {
        return res.status(401).json({ message: '휴대폰 인증이 필요합니다.' });
    }

    if (verified.phone !== phone || verified.userName !== String(userName || '').trim()) {
        return res.status(401).json({ message: '인증 정보가 일치하지 않습니다.' });
    }

    const sql = "SELECT userId FROM users WHERE userName = ? AND REPLACE(REPLACE(phone, '-', ''), ' ', '') = ? LIMIT 1";
    db.query(sql, [String(userName).trim(), phone], (err, results) => {
        if (err) return res.status(500).json({ message: '아이디 조회 중 오류가 발생했습니다.' });
        if (!results || results.length === 0) {
            return res.status(404).json({ message: '일치하는 계정을 찾을 수 없습니다.' });
        }

        verifiedStore.delete(String(verifyToken || ''));
        return res.json({ success: true, userId: results[0].userId });
    });
});

app.post('/api/auth/reset-password-by-phone', (req, res) => {
    const { userId, newPassword, verifyToken } = req.body || {};
    const phone = normalizePhone(req.body?.phone);
    const verified = verifiedStore.get(String(verifyToken || ''));

    if (!String(newPassword || '').trim()) {
        return res.status(400).json({ message: '새 비밀번호를 입력해 주세요.' });
    }

    if (!verified || verified.expiresAt < Date.now() || verified.purpose !== 'reset-password') {
        return res.status(401).json({ message: '휴대폰 인증이 필요합니다.' });
    }

    if (verified.phone !== phone || verified.userId !== String(userId || '').trim()) {
        return res.status(401).json({ message: '인증 정보가 일치하지 않습니다.' });
    }

    const sql = "UPDATE users SET password = ? WHERE userId = ? AND REPLACE(REPLACE(phone, '-', ''), ' ', '') = ?";
    db.query(sql, [String(newPassword).trim(), String(userId).trim(), phone], (err, result) => {
        if (err) return res.status(500).json({ message: '비밀번호 변경 중 오류가 발생했습니다.' });
        if (!result || result.affectedRows === 0) {
            return res.status(404).json({ message: '일치하는 계정을 찾을 수 없습니다.' });
        }

        verifiedStore.delete(String(verifyToken || ''));
        return res.json({ success: true, message: '비밀번호가 변경되었습니다.' });
    });
});

app.post('/api/auth/signup', (req, res) => {
    const { userId, password, userName, email, role } = req.body;
    const phone = normalizePhone(req.body?.phone);

    if (!isValidPhone(phone)) {
        return res.status(400).json({ message: '회원가입을 위해 올바른 휴대폰 번호를 입력해 주세요.' });
    }

    const checkSql = "SELECT * FROM users WHERE userId = ?";
    db.query(checkSql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) return res.status(400).json({ message: "이미 존재하는 아이디입니다." });
        const insertSql = "INSERT INTO users (userId, password, userName, email, role, phone) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(insertSql, [userId, password, userName, email, role, phone], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ success: true, message: "회원가입 성공!", userId: userId });
        });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { userId, password } = req.body;
    const sql = "SELECT * FROM users WHERE userId = ? AND password = ?";
    db.query(sql, [userId, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) res.json({ success: true, user: results[0] });
        else res.status(401).json({ success: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." });
    });
});

app.get('/api/admin/stats', (req, res) => {
    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM reservations) as totalReservations,
            (SELECT COUNT(*) FROM reservations WHERE res_date = CURDATE()) as todayReservations,
            (SELECT COUNT(*) FROM voc_list) as totalVoc
    `;
    db.query(statsQuery, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});

app.get('/api/my-reservations', (req, res) => {
    const { userId, userName, consultantName } = req.query;

    if ((userId === 'all' || userName === 'all' || consultantName === 'all') || (!userId && !userName && !consultantName)) {
        const allSql = "SELECT id, DATE_FORMAT(res_date, '%Y-%m-%d') as res_date, res_time, name, consultant_name, status FROM reservations ORDER BY res_date DESC, res_time DESC";
        db.query(allSql, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
        return;
    }

    const conditions = [];
    const params = [];

    if (userId) {
        conditions.push("name = ?");
        params.push(userId);
    }

    if (userName && userName !== userId) {
        conditions.push("name = ?");
        params.push(userName);
    }

    if (consultantName) {
        conditions.push("consultant_name = ?");
        params.push(consultantName);
    }

    if (conditions.length === 0) {
        return res.json([]);
    }

    const sql = `
        SELECT id, DATE_FORMAT(res_date, '%Y-%m-%d') as res_date, res_time, name, consultant_name, status, rejection_reason
        FROM reservations
        WHERE ${conditions.join(' OR ')}
        ORDER BY res_date DESC, res_time DESC
    `;

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.delete('/api/reservation/cancel/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM reservations WHERE id = ?";
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "예약이 취소되었습니다." });
    });
});

app.put('/api/reservation/update/:id', (req, res) => {
    const { id } = req.params;
    const { reserveDate, reserveTime } = req.body;
    const sql = "UPDATE reservations SET res_date = ?, res_time = ? WHERE id = ?";
    db.query(sql, [reserveDate, reserveTime, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "예약이 변경되었습니다." });
    });
});

app.get('/api/admin/recent-reservations', (req, res) => {
    const sql = "SELECT id, DATE_FORMAT(res_date, '%Y-%m-%d') as res_date, res_time, name, consultant_name FROM reservations ORDER BY id DESC LIMIT 5";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/', (req, res) => {
    res.send('백엔드 서버가 정상적으로 실행 중입니다! (PW: 1234)');
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('🔗 새로운 사용자 접속:', socket.id);

    if (!io.roomTimers) {
        io.roomTimers = {};
    }

    socket.on('register_endtime', (data) => {
        const { roomId, endTime, userName } = data || {};
        if (!roomId || !endTime) return;

        if (io.roomTimers[roomId]) {
            return;
        }

        const endDate = new Date(endTime);
        if (Number.isNaN(endDate.getTime())) return;

        const now = new Date();
        const alertMinutes = [10, 5, 1];
        io.roomTimers[roomId] = [];

        alertMinutes.forEach((min) => {
            const alertAt = new Date(endDate.getTime() - min * 60 * 1000);
            const delay = alertAt.getTime() - now.getTime();

            if (delay <= 0) return;

            const timer = setTimeout(() => {
                io.to(roomId).emit('receive_message', {
                    room: roomId,
                    sender: 'probot',
                    senderRole: 'probot',
                    senderName: '프로봇',
                    text: min === 1
                        ? `상담가능시간이 1분 남았습니다. ${userName || '사용자'}님! 상담을 마무리 부탁드립니다!`
                        : `상담가능시간이 ${min}분 남았습니다.`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            }, delay);

            io.roomTimers[roomId].push(timer);
        });

        const cleanupDelay = endDate.getTime() - now.getTime() + 60 * 1000;
        if (cleanupDelay > 0) {
            const cleanupTimer = setTimeout(() => {
                if (io.roomTimers[roomId]) {
                    io.roomTimers[roomId].forEach(clearTimeout);
                    delete io.roomTimers[roomId];
                }
            }, cleanupDelay);
            io.roomTimers[roomId].push(cleanupTimer);
        }
    });

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`📂 [Room ${roomId}] 사용자가 입장했습니다. (Socket ID: ${socket.id})`);
    });
    socket.on('send_message', (data) => {
        console.log(`📩 메시지 전송: Room ${data.room}, Sender: ${data.senderRole}, Name: ${data.senderName}, Message: ${data.text}`);

        if (data.text === '입력완료' && data.senderRole === 'user') {
            const reservationId = data.room;
            const updateSql = "UPDATE reservations SET status = 'in-progress' WHERE id = ?";
            db.query(updateSql, [reservationId], (err) => {
                if (err) {
                    console.error('예약 상태 변경 실패:', err);
                } else {
                    console.log(`[Handoff] 예약 ${reservationId} 상태를 in-progress로 변경 완료.`);
                }
            });
            socket.to(data.room).emit('handoff', {
                room: data.room,
                userName: data.senderName,
                time: new Date().toLocaleTimeString(),
                message: '상담 연결이 시작되었습니다.'
            });
        }
        socket.to(data.room).emit('receive_message', data);
    });
    socket.on('disconnect', () => {
        console.log('❌ 사용자 접속 종료:', socket.id);
    });
});

server.listen(port, () => {
    ensureUsersPhoneColumn();
    console.log(`🚀 서버가 포트 ${port}에서 작동 중입니다.`);
});