import express from "express";
import { getChatHistory, saveMessage, getChatRooms, markAsRead, deleteChatRoom, deleteMessage } from "../controllers/chatController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const chatRouter = express.Router();

// User routes
chatRouter.get('/history/:roomId', authUser, getChatHistory);
chatRouter.post('/message', authUser, saveMessage);
chatRouter.put('/read/:roomId', authUser, markAsRead);

// Admin routes
chatRouter.get('/rooms', adminAuth, getChatRooms);
chatRouter.get('/admin/history/:roomId', adminAuth, getChatHistory);
chatRouter.post('/admin/message', adminAuth, saveMessage);
chatRouter.delete('/admin/room/:roomId', adminAuth, deleteChatRoom);
chatRouter.delete('/admin/message/:messageId', adminAuth, deleteMessage);

export default chatRouter;
