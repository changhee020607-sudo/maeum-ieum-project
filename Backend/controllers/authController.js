const db = require('../db');

exports.signup = (req, res) => {
    const { userId, password, userName, email } = req.body;

    const checkSql = "SELECT * FROM users WHERE userId = ?";
    db.query(checkSql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) return res.status(400).json({ message: "이미 존재하는 아이디입니다." });

        const insertSql = "INSERT INTO users (userId, password, userName, email, role) VALUES (?, ?, ?, ?, 'user')";
        db.query(insertSql, [userId, password, userName, email], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "회원가입 성공!", insertId: result.insertId });
        });
    });
};

exports.login = (req, res) => {
    const { userId, password } = req.body;

    const sql = "SELECT * FROM users WHERE userId = ? AND password = ?";
    db.query(sql, [userId, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length > 0) {
            const user = results[0];
            res.json({ 
                message: "로그인 성공!", 
                user: { userId: user.userId, userName: user.userName } 
            });
        } else {
            res.status(401).json({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
        }
    });
};