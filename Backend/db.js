const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'studyDB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

db.query('SELECT 1', (err) => {
    if (err) {
        console.error('❌ DB 연결 실패:', err.message);
        return;
    }
    console.log('✅ MySQL 연결 성공! (db pool 연결 완료)');
});

module.exports = db;