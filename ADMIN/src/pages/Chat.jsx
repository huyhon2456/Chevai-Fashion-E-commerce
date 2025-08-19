import React from 'react';
import AdminChat from '../components/AdminChat';

const Chat = () => {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Customer Support Chat</h1>
                <p className="text-gray-600">Manage customer conversations and provide support</p>
            </div>
            <AdminChat />
        </div>
    );
};

export default Chat;
