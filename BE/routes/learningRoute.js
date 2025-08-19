/**
 * Learning Routes - API để quản lý AI learning
 * @author Chevai AI Team
 */

import express from 'express';
import { smartAI } from '../chat/smartAI.js';
import { learningService } from '../chat/learningService.js';

const router = express.Router();

// ==================== FEEDBACK ROUTES ====================

// Nhận feedback từ user về AI response
router.post('/feedback', async (req, res) => {
   try {
      const { userId, rating, roomId } = req.body;
      
      if (!userId || !rating || rating < 1 || rating > 5) {
         return res.status(400).json({
            success: false,
            message: 'userId and rating (1-5) are required'
         });
      }
      
      await smartAI.receiveFeedback(userId, rating, roomId);
      
      res.json({
         success: true,
         message: 'Feedback received successfully',
         rating
      });
      
   } catch (error) {
      console.error('Feedback error:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to process feedback'
      });
   }
});

// ==================== STATS ROUTES ====================

// Lấy thống kê AI usage
router.get('/stats', async (req, res) => {
   try {
      const aiStats = smartAI.getStats();
      
      res.json({
         success: true,
         stats: aiStats
      });
      
   } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to get stats'
      });
   }
});

// Lấy thống kê learning của user cụ thể
router.get('/user-stats/:userId', async (req, res) => {
   try {
      const { userId } = req.params;
      
      if (!userId) {
         return res.status(400).json({
            success: false,
            message: 'userId is required'
         });
      }
      
      const userStats = await smartAI.getUserStats(userId);
      
      res.json({
         success: true,
         userStats
      });
      
   } catch (error) {
      console.error('User stats error:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to get user stats'
      });
   }
});

// ==================== LEARNING MANAGEMENT ====================

// Reset learning data của user (nếu cần)
router.post('/reset-learning/:userId', async (req, res) => {
   try {
      const { userId } = req.params;
      
      // Implement reset logic here if needed
      // For now, just return success
      
      res.json({
         success: true,
         message: `Learning data reset for user ${userId}`
      });
      
   } catch (error) {
      console.error('Reset learning error:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to reset learning data'
      });
   }
});

// Test AI response (for debugging)
router.post('/test-response', async (req, res) => {
   try {
      const { message, userId, roomId } = req.body;
      
      if (!message) {
         return res.status(400).json({
            success: false,
            message: 'message is required'
         });
      }
      
      const response = await smartAI.chat(message, userId, roomId);
      
      res.json({
         success: true,
         response
      });
      
   } catch (error) {
      console.error('Test response error:', error);
      res.status(500).json({
         success: false,
         message: 'Failed to generate test response'
      });
   }
});

export default router;
