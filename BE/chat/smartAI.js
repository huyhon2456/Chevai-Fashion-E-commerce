/**
 * Smart AI Router - Tự động chọn AI phù hợp
 * @author Chevai AI Team
 */

import { processMessage } from './aiCore.js';
import { generateGeminiAI, shouldGeminiRespond } from './aiServiceGemini.js';
import { learningService } from './learningService.js';

class SmartAI {
   constructor() {
      this.geminiUsage = 0;
      this.lastReset = new Date().toDateString();
      this.GEMINI_LIMIT = 1400; // Daily limit
   }
   
   // Main AI function - tự động chọn AI tốt nhất
   async chat(message, userId = null, roomId = null) {
      try {
         console.log(`🤖 Smart AI processing: "${message}"`);
         
         // 1. Kiểm tra personalized response trước
         if (userId) {
            const personalizedResponse = await learningService.getPersonalizedResponse(userId, message);
            if (personalizedResponse) {
               console.log(`🎯 Using personalized response for user ${userId}`);
               return personalizedResponse;
            }
         }
         
         // 2. Phân tích complexity
         const analysis = this.analyzeComplexity(message);
         console.log(`📊 Complexity analysis:`, analysis);
         
         // 3. Check quota
         this.checkQuotaReset();
         const canUseGemini = this.geminiUsage < this.GEMINI_LIMIT;
         
         // 4. Chọn AI
         let useGemini = false;
         let reason = '';
         
         if (!canUseGemini) {
            reason = `Gemini quota exceeded (${this.geminiUsage}/${this.GEMINI_LIMIT})`;
         } else if (analysis.isSimple && analysis.confidence > 0.8) {
            reason = 'Simple query - using Core AI for efficiency';
         } else if (analysis.isComplex || shouldGeminiRespond(message)) {
            useGemini = true;
            reason = 'Complex query - using Gemini AI';
         } else {
            reason = 'Using Core AI as default';
         }
         
         console.log(`🎯 AI Decision: ${useGemini ? 'GEMINI' : 'CORE'} - ${reason}`);
         
         // 5. Generate response
         let response;
         let aiProvider;
         
         if (useGemini) {
            try {
               response = await generateGeminiAI(message, roomId);
               this.geminiUsage++;
               aiProvider = 'Gemini AI';
               console.log(`✅ Gemini used (${this.geminiUsage}/${this.GEMINI_LIMIT})`);
            } catch (error) {
               console.log(`⚠️ Gemini failed, using Core AI: ${error.message}`);
               response = await processMessage(message, userId);
               aiProvider = 'Core AI (Gemini fallback)';
            }
         } else {
            response = await processMessage(message, userId);
            aiProvider = 'Core AI';
         }
         
         // 6. Add metadata
         if (typeof response === 'string') {
            response = { message: response };
         }
         response.aiProvider = aiProvider;
         response.reason = reason;
         
         return response;
         
      } catch (error) {
         console.error('🚨 Smart AI Error:', error);
         return {
            message: "Xin lỗi, mình gặp sự cố! Thử lại nhé 😅",
            aiProvider: 'Error Fallback',
            reason: error.message
         };
      }
   }
   
   // Phân tích độ phức tạp của message
   analyzeComplexity(message) {
      const trimmed = message.trim();
      const wordCount = trimmed.split(/\s+/).length;
      
      // Simple patterns
      const simplePatterns = [
         /^(chào|hello|hi|xin chào)$/i,
         /^(cảm ơn|thank you|thanks)$/i,
         /(giá|price|bao nhiều)/i,
         /(size|kích thước)/i,
         /^(có.*không|do you have)/i,
         /(màu|color)/i,
         /^(bye|tạm biệt|goodbye)$/i
      ];
      
      // Complex patterns
      const complexPatterns = [
         /\?.*\?/i, // Multiple questions
         /(tư vấn|advice|suggest|gợi ý)/i,
         /(so sánh|compare|khác nhau)/i,
         /(phối đồ|outfit|style|fashion)/i,
         /(trend|xu hướng|mới nhất)/i,
         /sản phẩm số \d+/i, // Specific product references
         /(hình|ảnh|image|photo|pic|xem|show)/i, // Image requests
         /(cho.*xem|muốn xem|xem.*đi)/i // View requests
      ];
      
      const isSimple = simplePatterns.some(pattern => pattern.test(trimmed)) && wordCount <= 6;
      const isComplex = complexPatterns.some(pattern => pattern.test(trimmed)) || wordCount > 12;
      
      return {
         isSimple,
         isComplex,
         wordCount,
         confidence: isSimple ? 0.9 : isComplex ? 0.8 : 0.5
      };
   }
   
   // Check và reset quota
   checkQuotaReset() {
      const today = new Date().toDateString();
      if (this.lastReset !== today) {
         this.geminiUsage = 0;
         this.lastReset = today;
         console.log('📊 Daily quota reset');
      }
   }
   
   // Nhận feedback từ user
   async receiveFeedback(userId, rating, roomId = null) {
      if (userId) {
         await learningService.receiveFeedback(userId, rating);
         console.log(`⭐ Received feedback: ${rating}/5 from user ${userId}`);
      }
   }
   
   // Lấy stats
   getStats() {
      return {
         geminiUsage: this.geminiUsage,
         geminiLimit: this.GEMINI_LIMIT,
         quotaRemaining: this.GEMINI_LIMIT - this.geminiUsage,
         lastReset: this.lastReset,
         provider: 'Smart AI Router'
      };
   }
   
   // Lấy user learning stats
   async getUserStats(userId) {
      return await learningService.getLearningStats(userId);
   }
}

// Export singleton instance
export const smartAI = new SmartAI();
