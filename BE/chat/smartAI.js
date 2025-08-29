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
         
         // 2. Kiểm tra context trước khi analyze complexity
         const { getConversationContext } = await import('./conversationContext.js');
         const context = getConversationContext(roomId);
         const hasActiveContext = context && (context.lastAction === 'asked_for_image' || context.lastAction === 'mentioned_product');
         
         // 3. Phân tích complexity
         const analysis = this.analyzeComplexity(message, hasActiveContext);
         console.log(`📊 Complexity analysis:`, analysis);
         
         // 4. Check quota
         this.checkQuotaReset();
         const canUseGemini = this.geminiUsage < this.GEMINI_LIMIT;
         
         // 5. Chọn AI thông minh hơn - IMPROVED LOGIC
         let useGemini = false;
         let reason = '';
         
         if (!canUseGemini) {
            reason = `Gemini quota exceeded (${this.geminiUsage}/${this.GEMINI_LIMIT}) - using Core AI`;
         } else if (hasActiveContext && /(có|ok|yes|được|ừ|đồng\s*ý|xem|show)/i.test(message.trim())) {
            // IMPORTANT: If user is responding to a Gemini context (like confirming to see image), continue with Gemini
            useGemini = true;
            reason = 'Continuing Gemini conversation context';
         } else if (analysis.isSimple && analysis.confidence > 0.8 && !hasActiveContext) {
            reason = 'Simple query - Core AI is sufficient';
         } else if (analysis.isComplex || shouldGeminiRespond(message)) {
            useGemini = true;
            reason = 'Complex query requires Gemini AI';
         } else if (analysis.isMedium && analysis.needsPersonalization) {
            useGemini = true;
            reason = 'Personalized response needed - using Gemini AI';
         } else if (analysis.needsContext) {
            useGemini = true;
            reason = 'Context-aware response needed - using Gemini AI';
         } else {
            reason = 'Standard query - using Core AI';
         }
         
         console.log(`🎯 AI Decision: ${useGemini ? 'GEMINI' : 'CORE'} - ${reason}`);
         
         // 6. Generate response
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
         
         // 7. Add metadata
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
   analyzeComplexity(message, hasActiveContext = false) {
      const trimmed = message.trim();
      const wordCount = trimmed.split(/\s+/).length;
      
      // Simple patterns - queries đơn giản
      const simplePatterns = [
         /^(chào|hello|hi|xin chào)$/i,
         /^(cảm ơn|thank you|thanks)$/i,
         /^(bye|tạm biệt|goodbye)$/i,
         /^(giá|price)\?*$/i,
         /^(size|kích thước)\?*$/i
      ];
      
      // UPDATED: Don't treat confirmation as simple if there's active context
      if (!hasActiveContext) {
         simplePatterns.push(/^(có|ok|yes|được|ừ)$/i);
      }
      
      // Complex patterns - cần AI thông minh hơn
      const complexPatterns = [
         /\?.*\?/i, // Multiple questions
         /(tư vấn|advice|suggest|gợi ý|recommend)/i,
         /(so sánh|compare|khác nhau|difference)/i,
         /(phối đồ|outfit|style|fashion|mix\s*&\s*match)/i,
         /(trend|xu hướng|mới nhất|hot|trendy)/i,
         /(cho.*xem|muốn xem|xem.*đi|show.*me)/i, // View requests
         /(đi\s*chơi|đi\s*làm|đi\s*học|occasion)/i, // Context-based requests
         /(\d+\s*kg|cân\s*nặng|weight|size.*nào|vừa.*không|fit.*không|mặc.*có|đi.*được|phù\s*hợp)/i, // Size consultation - ENHANCED
         /(áo.*quần|quần.*áo|outfit|set)/i, // Combination requests
         /(đẹp.*không|thế\s*nào|how.*look)/i // Opinion requests
      ];
      
      // Medium complexity patterns
      const mediumPatterns = [
         /(giá.*bao\s*nhiều|how\s*much)/i,
         /(có.*màu|color.*available)/i,
         /(size.*nào|what\s*size)/i,
         /(chất\s*liệu|material|fabric)/i
      ];
      
      const isSimple = simplePatterns.some(pattern => pattern.test(trimmed)) && wordCount <= 5;
      const isComplex = complexPatterns.some(pattern => pattern.test(trimmed)) || wordCount > 10 || hasActiveContext;
      const isMedium = mediumPatterns.some(pattern => pattern.test(trimmed)) && !isSimple && !isComplex;
      
      let confidence = 0.5;
      if (isSimple) confidence = 0.9;
      else if (isComplex) confidence = 0.85;
      else if (isMedium) confidence = 0.7;
      
      return {
         isSimple,
         isComplex,
         isMedium,
         wordCount,
         confidence,
         needsPersonalization: /(tôi|mình|em|bạn)/i.test(trimmed),
         needsContext: /(đi\s*chơi|đi\s*làm|occasion|\d+\s*kg|cân\s*nặng|size.*nào|vừa.*không|fit.*không|mặc.*có)/i.test(trimmed) || hasActiveContext
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
