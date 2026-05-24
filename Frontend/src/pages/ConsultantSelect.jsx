import React from 'react';
import ConsultantList from './ConsultantList';

export default function ConsultantSelect() {
    return (
        <div style={{ padding: '20px' }}>
        <h2 style={{ textAlign: 'center' }}>변경하실 상담사를 선택하세요</h2>
        <ConsultantList />
        </div>
    );
}