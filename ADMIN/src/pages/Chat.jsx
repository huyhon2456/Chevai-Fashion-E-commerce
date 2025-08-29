import React from 'react';
import AdminChat from '../components/AdminChat';

const Chat = () => {
    return (
        <>
            <div className="mb-2">
                <h1 className="text-2xl font-bold">CHAT VỚI KHÁCH HÀNG</h1>
                <p className="text-gray-600">Quản lý cuộc trò chuyện với khách hàng và cung cấp hỗ trợ</p>
            </div>
            <AdminChat />
        </>
    );
};



export default Chat;
