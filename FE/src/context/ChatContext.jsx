
import { createContext, useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import { ShopContext } from "./ShopContext";

export const ChatContext = createContext();

const ChatContextProvider = (props) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isAdminOnline, setIsAdminOnline] = useState(false);
    const { token, userData } = useContext(ShopContext);
    const backendUrl = import.meta.env.VITE_BE_URL || 'http://localhost:4000';

    // Load chat history when user logs in
    const loadChatHistory = async () => {
        if (token && userData) {
            try {
                const roomId = `user_${userData._id}`;
                const response = await fetch(`${backendUrl}/api/chat/history/${roomId}`, {
                    headers: { token }
                });
                const data = await response.json();
                if (data.success) {
                    setMessages(data.messages);
                }
            } catch (error) {
                console.log('Error loading chat history:', error);
            }
        }
    };

    useEffect(() => {
        if (token && userData) {
            // Load chat history first
            loadChatHistory();
            // Initialize socket connection
            const newSocket = io(backendUrl);
            setSocket(newSocket);
            // Join user's room
            const roomId = `user_${userData._id}`;
            newSocket.emit('join_room', roomId);
            
            // Request current admin status
            newSocket.emit('check_admin_status');
            // Listen for incoming messages
            newSocket.on('receive_message', (message) => {
                console.log('User received message:', message);
                
                setMessages(prevMessages => {
                    // Remove temp message if it exists and add the real one
                    const filteredMessages = prevMessages.filter(msg => 
                        !msg.isTemp || 
                        !(msg.message === message.message && msg.senderType === message.senderType)
                    );
                    
                    // Check if real message already exists
                    const exists = filteredMessages.some(msg => msg._id === message._id);
                    if (!exists) {
                        return [...filteredMessages, message];
                    }
                    return filteredMessages;
                });
                
                // Increase unread count if chat is closed
                if (!isChatOpen && message.senderType !== 'user') {
                    setUnreadCount(prev => prev + 1);
                }
            });

            // Listen for global message notifications
            newSocket.on('new_message_global', (message) => {
                console.log('User received global message:', message);
                
                const roomId = `user_${userData._id}`;
                if (message.roomId === roomId) {
                    setMessages(prevMessages => {
                        const exists = prevMessages.some(msg => msg._id === message._id);
                        if (!exists) {
                            return [...prevMessages, message];
                        }
                        return prevMessages;
                    });
                    
                    if (!isChatOpen && message.senderType !== 'user') {
                        setUnreadCount(prev => prev + 1);
                    }
                }
            });

            // Listen for typing indicators
            newSocket.on('admin_typing', (data) => {
                console.log('Admin typing:', data.isTyping);
                setIsTyping(data.isTyping);
            });

            // Listen for AI typing indicators
            newSocket.on('ai_typing_start', () => {
                console.log('AI started typing');
                setIsTyping(true);
            });

            newSocket.on('ai_typing_stop', () => {
                console.log('AI stopped typing');
                setIsTyping(false);
            });

            // Listen for admin status updates
            newSocket.on('admin_status', (data) => {
                setIsAdminOnline(data.isAdminOnline);
            });

            // Listen for admin status changes (from backend)
            newSocket.on('admin_status_changed', (data) => {
                setIsAdminOnline(data.isOnline);
                console.log('Admin status changed:', data.isOnline);
            });

            // Listen for legacy admin status
            newSocket.on('adminStatus', (data) => {
                setIsAdminOnline(data.online);
                console.log('Admin status (legacy):', data.online);
            });

            // Listen for message errors
            newSocket.on('message_error', (data) => {
                console.error('Message error:', data.error);
            });

            return () => {
                newSocket.close();
            };
        }
    }, [token, userData, backendUrl]);

    const sendMessage = (message) => {
        if (socket && userData) {
            const roomId = `user_${userData._id}`;
            const messageData = {
                roomId,
                senderId: userData._id,
                senderName: userData.name,
                senderType: 'user',
                message
            };
            
            // Add message to UI immediately for instant feedback
            const tempMessage = {
                ...messageData,
                _id: 'temp-' + Date.now(),
                timestamp: new Date(),
                isTemp: true
            };
            
            setMessages(prevMessages => [...prevMessages, tempMessage]);
            
            // Send via socket
            socket.emit('send_message', messageData);
            console.log('User sent message:', messageData);
        }
    };

    const openChat = () => {
        setIsChatOpen(true);
        setUnreadCount(0);
    };

    const closeChat = () => {
        setIsChatOpen(false);
    };

    const value = {
        messages,
        sendMessage,
        isTyping,
        isChatOpen,
        openChat,
        closeChat,
        unreadCount,
        isAdminOnline
    };

    return (
        <ChatContext.Provider value={value}>
            {props.children}
        </ChatContext.Provider>
    );
};

export default ChatContextProvider;
