import React, { useState, useEffect, useRef } from 'react';
import { url } from '../App';
import axios from 'axios';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const AdminChat = () => {
    const [socket, setSocket] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchChatRooms = async () => {
        try {
            const response = await axios.get(`${url}/api/chat/rooms`, {
                headers: { token: localStorage.getItem('token') }
            });
            if (response.data.success) {
                setChatRooms(response.data.rooms);
            }
        } catch (error) {
            console.log(error);
            toast.error('Error fetching chat rooms');
        }
    };

    const fetchMessages = async (roomId) => {
        try {
            const response = await axios.get(`${url}/api/chat/admin/history/${roomId}`, {
                headers: { token: localStorage.getItem('token') }
            });
            if (response.data.success) {
                setMessages(response.data.messages);
            }
        } catch (error) {
            console.log(error);
            toast.error('Error fetching messages');
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedRoom) return;

        // Stop typing indicator when sending message
        if (socket && selectedRoom) {
            console.log('Admin sending message, stopping typing in room:', selectedRoom);
            socket.emit('admin_typing', {
                roomId: selectedRoom,
                isTyping: false
            });
        }

        const messageData = {
            roomId: selectedRoom,
            senderId: 'admin',
            senderName: 'Admin',
            senderType: 'admin',
            message: newMessage
        };

        // Add message to UI immediately for instant feedback
        const tempMessage = {
            ...messageData,
            _id: 'temp-' + Date.now(),
            timestamp: new Date(),
            isTemp: true
        };

        setMessages(prevMessages => [...prevMessages, tempMessage]);
        const currentMessage = newMessage;
        setNewMessage('');

        console.log('Admin sending message:', messageData);

        try {
            // Send message via Socket.IO for immediate real-time delivery
            if (socket) {
                socket.emit('send_message', messageData);
                console.log('Message emitted via socket');
            }
        } catch (error) {
            console.log(error);
            toast.error('Error sending message');
            // Remove temp message on error and restore input
            setMessages(prevMessages =>
                prevMessages.filter(msg => msg._id !== tempMessage._id)
            );
            setNewMessage(currentMessage);
        }
    };

    // Handle typing indicator
    const handleTyping = (value) => {
        setNewMessage(value);

        if (!socket || !selectedRoom) return;

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (value.trim()) {
            // Start typing
            if (!isTyping) {
                setIsTyping(true);
                socket.emit('admin_typing', {
                    roomId: selectedRoom,
                    isTyping: true
                });
            }

            // Stop typing after 5 seconds of no typing (instead of 1 second)
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                socket.emit('admin_typing', {
                    roomId: selectedRoom,
                    isTyping: false
                });
            }, 5000);
        } else {
            // Stop typing immediately if input is empty
            setIsTyping(false);
            
            socket.emit('admin_typing', {
                roomId: selectedRoom,
                isTyping: false
            });
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleString('vi-VN');
    };

    const deleteChatRoom = async (roomId) => {
        if (!window.confirm('Bạn có chắc muốn xóa đoạn chat này? Hành động này không thể hoàn tác.')) {
            return;
        }

        try {
            const response = await axios.delete(`${url}/api/chat/admin/room/${roomId}`, {
                headers: { token: localStorage.getItem('token') }
            });

            if (response.data.success) {
                toast.success('Đã xóa đoạn chat thành công');
                fetchChatRooms();
                if (selectedRoom === roomId) {
                    setSelectedRoom(null);
                    setMessages([]);
                }
            }
        } catch (error) {
            console.log(error);
            toast.error('Error deleting chat room');
        }
    };

    const deleteMessage = async (messageId) => {
        if (!window.confirm('Bạn có chắc muốn xóa tin nhắn này?')) {
            return;
        }

        try {
            const response = await axios.delete(`${url}/api/chat/admin/message/${messageId}`, {
                headers: { token: localStorage.getItem('token') }
            });

            if (response.data.success) {
                toast.success('Đã xóa tin nhắn');
                fetchMessages(selectedRoom);
            }
        } catch (error) {
            console.log(error);
            toast.error('Error deleting message');
        }
    };

    // Cleanup typing timeout on component unmount or room change
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [selectedRoom]);

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io(url, {
            transports: ['websocket'],
            upgrade: false
        });
        setSocket(newSocket);

        // Register as admin immediately when socket connects
        newSocket.on('connect', () => {
            console.log('Admin socket connected:', newSocket.id);

            // Register as admin - this makes admin online
            newSocket.emit('admin_login', {
                name: 'Admin',
                role: 'admin',
                timestamp: new Date(),
                socketId: newSocket.id
            });

            console.log('Admin registered as online');
        });

        // Listen for connection status
        newSocket.on('admin_status', (data) => {
            console.log('Admin status confirmed:', data);
        });

        // Handle disconnection
        newSocket.on('disconnect', () => {
            console.log('Admin socket disconnected');
        });

        fetchChatRooms();
        const interval = setInterval(fetchChatRooms, 10000); // Refresh more frequently

        return () => {
            clearInterval(interval);
            newSocket.close();
        };
    }, []);

    // Separate effect for socket message handling
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (message) => {
            console.log('Admin received message:', message, 'Current selectedRoom:', selectedRoom);

            // ALWAYS refresh chat rooms when any message comes
            fetchChatRooms();

            // If this room is currently selected, add message immediately
            if (selectedRoom && message.roomId === selectedRoom) {
                console.log('Adding message to current room:', selectedRoom);
                setMessages(prevMessages => {
                    // Remove temp message if it exists
                    const filteredMessages = prevMessages.filter(msg =>
                        !msg.isTemp ||
                        !(msg.message === message.message && msg.senderType === message.senderType)
                    );

                    // Check if message already exists
                    const exists = filteredMessages.some(msg => msg._id === message._id);
                    if (!exists) {
                        console.log('Message added to UI');
                        const newMessages = [...filteredMessages, message];
                        // Auto scroll after a short delay to ensure DOM is updated
                        setTimeout(scrollToBottom, 100);
                        return newMessages;
                    }
                    console.log('Message already exists, skipping');
                    return filteredMessages;
                });
            } else {
                console.log('Message for different room:', message.roomId, 'current:', selectedRoom);
            }
        };

        const handleMessageUpdate = (message) => {
            if (selectedRoom && message.roomId === selectedRoom) {
                setMessages(prevMessages =>
                    prevMessages.map(msg =>
                        msg.message === message.message &&
                            msg.senderId === message.senderId ? message : msg
                    )
                );
            }
        };

        const handleNewMessageNotification = (data) => {
            fetchChatRooms();
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('message_update', handleMessageUpdate);
        socket.on('new_message_notification', handleNewMessageNotification);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('message_update', handleMessageUpdate);
            socket.off('new_message_notification', handleNewMessageNotification);
        };
    }, [socket, selectedRoom]);

    useEffect(() => {
        if (selectedRoom && socket) {
            console.log('Selected room changed to:', selectedRoom);
            fetchMessages(selectedRoom);

            // Join the room as admin for real-time updates
            socket.emit('admin_join_room', selectedRoom);
            console.log('Admin joined room:', selectedRoom);

            // Cleanup function to leave room when switching
            return () => {
                if (selectedRoom && socket) {
                    socket.emit('admin_leave_room', selectedRoom);
                    console.log('Admin left room:', selectedRoom);
                }
            };
        }
    }, [selectedRoom, socket]);

    return (
        <div className="flex flex-col lg:flex-row h-screen lg:h-[600px] bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Mobile Header */}
            <div className="lg:hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Trò chuyện với Admin</h2>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Chat Rooms List */}
            <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block w-full lg:w-1/3 border-r border-gray-200 bg-gray-50`}>
                <div className="hidden lg:block p-4 border-b border-gray-200 bg-white">
                    <h2 className="text-lg font-semibold text-gray-800">Danh sách phòng chat</h2>
                    <p className="text-sm text-gray-500">Quản lý cuộc trò chuyện</p>
                </div>
                <div className="overflow-y-auto h-full lg:h-[calc(100%-80px)] max-h-screen lg:max-h-none">
                    {chatRooms.map((room) => (
                        <div
                            key={room._id}
                            className={`relative group p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${selectedRoom === room._id ? 'bg-blue-100 border-blue-300 shadow-sm' : ''
                                }`}
                        >
                            <div
                                onClick={() => {
                                    setSelectedRoom(room._id);
                                    setIsMobileMenuOpen(false); // Close mobile menu when selecting room
                                }}
                                className="flex justify-between items-start"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                            {room.senderName?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <p className="font-semibold text-sm text-gray-800 truncate">{room.senderName}</p>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate pl-10">{room.lastMessage}</p>
                                    <div className="flex items-center justify-between pl-10 mt-1">
                                        <p className="text-xs text-gray-400">{formatTime(room.lastMessageTime)}</p>
                                        {room.unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center animate-pulse">
                                                {room.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Delete button - appears on hover */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteChatRoom(room._id);
                                }}
                                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 text-xs shadow-lg"
                                title="Xóa đoạn chat"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))}
                    {chatRooms.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            <div className="text-4xl mb-4">💬</div>
                            <p className="font-medium">Chưa có cuộc trò chuyện nào</p>
                            <p className="text-sm mt-2">Khách hàng sẽ xuất hiện ở đây khi họ nhắn tin</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Messages */}
            <div className={`${isMobileMenuOpen ? 'hidden' : 'flex'} lg:flex flex-1 flex-col bg-white`}>
                {selectedRoom ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    👤
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Chat với khách hàng</h3>
                                    <p className="text-sm text-gray-500">Hỗ trợ trực tiếp</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => deleteChatRoom(selectedRoom)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors shadow-sm"
                                    title="Xóa toàn bộ đoạn chat"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span className="hidden sm:inline">Xóa chat</span>
                                </button>
                            </div>
                        </div>

                        {/* Messages Container with auto-scroll */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white max-h-[60vh] lg:max-h-none chat-messages chat-scroll">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`group flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'
                                        } animate-fade-in`}
                                >
                                    <div className="relative max-w-xs lg:max-w-md">
                                        <div
                                            className={`px-4 py-3 rounded-2xl text-sm shadow-md transition-all duration-200 transform hover:scale-105 ${message.senderType === 'admin'
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm'
                                                : message.senderType === 'ai'
                                                    ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-l-4 border-green-400 rounded-bl-sm'
                                                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-l-4 border-gray-400 rounded-bl-sm'
                                                }`}
                                        >
                                            {message.senderType !== 'admin' && (
                                                <div className="flex items-center mb-2">
                                                    <span className="text-xs font-semibold">
                                                        {message.senderType === 'ai' ? '🤖 AI Assistant' : '👤 ' + message.senderName}
                                                    </span>
                                                </div>
                                            )}
                                            <p className="whitespace-pre-wrap break-words">{message.message}</p>
                                            {/* Display image if AI sends one */}
                                            {message.image && (
                                                <div className="mt-3">
                                                    <img
                                                        src={message.image}
                                                        alt="Product"
                                                        className="max-w-full h-auto rounded-lg shadow-md max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => window.open(message.image, '_blank')}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <p className={`text-xs mt-2 ${message.senderType === 'admin'
                                                ? 'text-blue-100'
                                                : 'text-gray-500'
                                                }`}>
                                                {formatTime(message.timestamp)}
                                            </p>
                                        </div>

                                        {/* Delete message button */}
                                        <button
                                            onClick={() => deleteMessage(message._id)}
                                            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg"
                                            title="Xóa tin nhắn"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {/* Auto-scroll target */}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
                            <div className="flex space-x-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => handleTyping(e.target.value)}
                                    placeholder="Nhập tin nhắn của bạn..."
                                    className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm transition-all duration-200"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-full px-6 py-3 transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-white">
                        <div className="text-center p-8">
                            <div className="text-6xl mb-4">💬</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chọn một cuộc trò chuyện</h3>
                            <p className="text-gray-500">Chọn một khách hàng từ danh sách để bắt đầu hỗ trợ</p>
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Xem danh sách chat
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;
