import React from 'react';
import './Loading.css';

const Loading = ({ message = "처리 중입니다..." }) => {
    return (
        <div className="loading-container">
        <div className="spinner"></div>
        <p>{message}</p>
        </div>
    );
    };

export default Loading;