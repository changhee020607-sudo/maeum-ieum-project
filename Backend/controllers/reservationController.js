const db = require('../db');

exports.getBookedTimes = (req, res) => {
    const { consultantName, date } = req.query;
    const sql = "SELECT res_time FROM reservations WHERE consultant_name = ? AND res_date = ?";
    
    db.query(sql, [consultantName, date], (err, results) => {
        if (err) {
            console.error("❌ 예약된 시간 조회 에러:", err.message);
            return res.status(500).json({ error: err.message });
        }
        const bookedTimes = results.map(row => row.res_time);
        res.json(bookedTimes);
    });
};

exports.createReservation = (req, res) => {
    const { userId, reserveDate, reserveTime, consultantName, isModifying, prevDate, prevTime, originId, name } = req.body;

    const isClosedByCutoff = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return false;
        const [year, month, day] = String(dateStr).split('-').map(Number);
        const [hour, minute] = String(timeStr).split(':').map(Number);
        if ([year, month, day, hour, minute].some((v) => Number.isNaN(v))) return false;

        const now = new Date();
        const slotStart = new Date(year, month - 1, day, hour, minute, 0, 0);
        const cutoff = new Date(slotStart.getTime() - 10 * 60 * 1000);
        const isSameDate =
            now.getFullYear() === year &&
            now.getMonth() === month - 1 &&
            now.getDate() === day;

        return isSameDate && now >= cutoff;
    };

    if (isClosedByCutoff(reserveDate, reserveTime)) {
        return res.status(400).json({ message: '해당 시간은 시작 10분 전 마감되어 예약할 수 없습니다.' });
    }

    const handleInsert = () => {
        const checkQuery = "SELECT * FROM reservations WHERE res_date = ? AND res_time = ? AND consultant_name = ?";

        db.query(checkQuery, [reserveDate, reserveTime, consultantName], (err, results) => {
            if (err) return res.status(500).send(err);
            if (results.length > 0) return res.status(400).json({ message: "이미 예약된 시간대입니다." });

            const insertQuery = "INSERT INTO reservations (name, res_date, res_time, consultant_name) VALUES (?, ?, ?, ?)";
            db.query(insertQuery, [name, reserveDate, reserveTime, consultantName], (err, result) => {
                if (err) {
                    console.error("❌ 신규 예약 등록 실패:", err.message);
                    return res.status(500).send(err);
                }
                console.log(`✅ 신규 예약 완료 (ID: ${result.insertId})`);
                res.status(201).json({ message: "성공", reservationId: result.insertId });
            });
        });
    };

    if (isModifying) {
        console.log("-----------------------------------------");
        console.log(`🔄 [변경 모드] 기존 예약 삭제 시도...`);

        const deleteQuery = originId
            ? "DELETE FROM reservations WHERE id = ?"
            : `DELETE FROM reservations 
                WHERE name = ? 
                AND (DATE_FORMAT(res_date, '%Y-%m-%d') = ? OR res_date = ?)
                AND res_time = ?`;

        const deleteParams = originId
            ? [originId]
            : [name, prevDate, prevDate, prevTime];

        console.log(`📍 삭제 조건 - ${originId ? `ID: ${originId}` : `사용자: ${name}, 날짜: ${prevDate}`}`);

        db.query(deleteQuery, deleteParams, (err, result) => {
            if (err) {
                console.error("❌ 기존 예약 삭제 쿼리 에러:", err.message);
                return res.status(500).json({ error: "기존 예약 삭제 중 오류가 발생했습니다." });
            }

            if (result.affectedRows === 0) {
                console.warn("⚠️ [주의] 삭제된 행이 0건입니다. 조건을 확인하세요.");
            } else {
                console.log(`✅ 기존 예약 삭제 성공! (삭제된 건수: ${result.affectedRows})`);
            }

            console.log("-----------------------------------------");
            handleInsert();
        });
    } else {
        handleInsert();
    }
};

exports.getReservationDetail = (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT
            id,
            name,
            consultant_name,
            DATE_FORMAT(res_date, '%Y-%m-%d') AS res_date,
            TIME_FORMAT(res_time, '%H:%i') AS res_time,
            status
        FROM reservations
        WHERE id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("❌ 상세 예약 정보 조회 에러:", err.message);
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "해당 예약 정보를 찾을 수 없습니다." });
        }
        console.log(`📡 상담방 정보 로드 완료: [${results[0].consultant_name} 전문가 - ${results[0].name} 고객]`);
        res.json(results[0]);
    });
};

exports.getMyReservations = (req, res) => {
    const { userId } = req.query;
    const sql = (userId === 'all' || !userId) 
        ? "SELECT * FROM reservations" 
        : "SELECT id, DATE_FORMAT(res_date, '%Y-%m-%d') as res_date, res_time, name, consultant_name FROM reservations WHERE name = ? ORDER BY res_date DESC, res_time DESC";
    
    const queryParams = (userId === 'all' || !userId) ? [] : [userId];

    db.query(sql, queryParams, (err, results) => {
        if (err) {
            console.error("❌ DB 조회 에러:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log(`📡 예약 조회 완료: [${userId || '전체'}] - ${results.length}건`);
        res.json(results);
    });
};

exports.updateReservation = (req, res) => {
    const { id } = req.params;
    const { reserveDate, reserveTime } = req.body;
    const sql = "UPDATE reservations SET res_date = ?, res_time = ? WHERE id = ?";
    db.query(sql, [reserveDate, reserveTime, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
};

exports.cancelReservation = (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM reservations WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
};