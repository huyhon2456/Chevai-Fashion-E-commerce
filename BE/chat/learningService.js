/**
 * AI Learning Service - Học từ cách nói chuyện của người dùng
 * @author Chevai AI Team
 */

import mongoose from 'mongoose';

// ==================== USER LEARNING SCHEMA ====================
const UserLearningSchema = new mongoose.Schema({
   userId: { type: String, required: true, index: true },
   conversations: [{
      message: String,
      response: String,
      timestamp: { type: Date, default: Date.now },
      rating: { type: Number, min: 1, max: 5 }, // User feedback
      context: {
         intents: [String],
         productTypes: [String],
         mood: String, // happy, neutral, frustrated
         language: String // vi, en
      }
   }],
   preferences: {
      language: { type: String, default: 'vi' },
      communicationStyle: { type: String, default: 'friendly' }, // formal, friendly, casual
      favoriteProducts: [String],
      commonQuestions: [String],
      responsePatterns: Map // Learned patterns
   },
   statistics: {
      totalMessages: { type: Number, default: 0 },
      avgRating: { type: Number, default: 0 },
      lastActive: { type: Date, default: Date.now },
      learningScore: { type: Number, default: 0 }
   }
}, { timestamps: true });

// ==================== ADVANCED LEARNING PATTERNS ====================
const PatternSchema = new mongoose.Schema({
   pattern: String, // Pattern text
   intent: String, // What user wants
   confidence: { type: Number, default: 0 },
   successRate: { type: Number, default: 0 },
   usageCount: { type: Number, default: 0 },
   lastUsed: { type: Date, default: Date.now },
   examples: [String] // Example messages that match this pattern
});

const GlobalPattern = mongoose.model('GlobalPattern', PatternSchema);

// ==================== PRODUCT PREFERENCE LEARNING ====================
const ProductPreferenceSchema = new mongoose.Schema({
   userId: String,
   productId: String,
   productName: String,
   interactionType: String, // viewed, asked, selected, purchased
   preferences: {
      priceRange: { min: Number, max: Number },
      preferredStyles: [String],
      preferredColors: [String],
      preferredSizes: [String]
   },
   frequency: { type: Number, default: 1 },
   lastInteraction: { type: Date, default: Date.now }
});

const ProductPreference = mongoose.model('ProductPreference', ProductPreferenceSchema);

const UserLearning = mongoose.model('UserLearning', UserLearningSchema);

// ==================== NEURAL NETWORK SIMULATION ====================
class SimpleNeuralNetwork {
   constructor() {
      this.weights = {
         greeting: 0.8,
         productInquiry: 0.9,
         priceQuestion: 0.7,
         styleAdvice: 0.6,
         sizeHelp: 0.8,
         complaint: 0.3
      };
      this.learningRate = 0.1;
   }

   // Predict intent confidence
   predict(features) {
      let totalScore = 0;
      let maxIntent = 'unknown';
      let maxScore = 0;

      for (const [intent, weight] of Object.entries(this.weights)) {
         const score = features[intent] ? features[intent] * weight : 0;
         totalScore += score;
         if (score > maxScore) {
            maxScore = score;
            maxIntent = intent;
         }
      }

      return {
         intent: maxIntent,
         confidence: Math.min(maxScore, 1.0),
         allScores: this.weights
      };
   }

   // Learn from feedback
   train(features, actualIntent, feedback) {
      if (feedback >= 4) { // Good feedback
         if (this.weights[actualIntent]) {
            this.weights[actualIntent] += this.learningRate * (1 - this.weights[actualIntent]);
         }
      } else if (feedback <= 2) { // Bad feedback
         if (this.weights[actualIntent]) {
            this.weights[actualIntent] -= this.learningRate * this.weights[actualIntent];
         }
      }

      // Normalize weights
      const maxWeight = Math.max(...Object.values(this.weights));
      if (maxWeight > 1) {
         Object.keys(this.weights).forEach(key => {
            this.weights[key] = this.weights[key] / maxWeight;
         });
      }
   }
}

const neuralNet = new SimpleNeuralNetwork();

// ==================== LEARNING PATTERNS ====================
class LearningService {
   
   // Học từ tin nhắn của user với deep learning
   async learnFromMessage(userId, message) {
      try {
         const analysis = this.deepAnalyzeMessage(message);
         
         // Tìm hoặc tạo user learning record
         let userLearning = await UserLearning.findOne({ userId });
         if (!userLearning) {
            userLearning = new UserLearning({ userId });
         }
         
         // Cập nhật preferences dựa trên message
         this.updatePreferences(userLearning, analysis);
         
         // Learn global patterns
         await this.learnGlobalPatterns(message, analysis);
         
         // Neural network prediction
         const prediction = neuralNet.predict(analysis.features);
         console.log(`🧠 Neural prediction for "${message}": ${prediction.intent} (${prediction.confidence.toFixed(2)})`);
         
         // Tăng statistics
         userLearning.statistics.totalMessages += 1;
         userLearning.statistics.lastActive = new Date();
         userLearning.statistics.learningScore += prediction.confidence;
         
         await userLearning.save();
         
         console.log(`📚 Deep learned from user ${userId}: ${analysis.language} style, ${analysis.mood} mood, ${analysis.intents.length} intents`);
         
         return prediction;
         
      } catch (error) {
         console.error('Deep learning error:', error);
      }
   }
   
   // Học từ response thành công
   async learnFromResponse(userId, originalMessage, response) {
      try {
         const userLearning = await UserLearning.findOne({ userId });
         if (!userLearning) return;
         
         const conversation = {
            message: originalMessage,
            response: typeof response === 'object' ? response.message : response,
            context: this.analyzeMessage(originalMessage)
         };
         
         userLearning.conversations.push(conversation);
         
         // Giữ chỉ 50 conversation gần nhất để tiết kiệm bộ nhớ
         if (userLearning.conversations.length > 50) {
            userLearning.conversations = userLearning.conversations.slice(-50);
         }
         
         await userLearning.save();
         
      } catch (error) {
         console.error('Response learning error:', error);
      }
   }
   
   // Nhận feedback từ user và train neural network
   async receiveFeedback(userId, rating, conversationIndex = -1) {
      try {
         const userLearning = await UserLearning.findOne({ userId });
         if (!userLearning || userLearning.conversations.length === 0) return;
         
         const targetIndex = conversationIndex >= 0 ? conversationIndex : userLearning.conversations.length - 1;
         const conversation = userLearning.conversations[targetIndex];
         conversation.rating = rating;
         
         // Train neural network with feedback
         if (conversation.context && conversation.context.features) {
            const features = conversation.context.features;
            const intent = conversation.context.intents[0] || 'unknown';
            neuralNet.train(features, intent, rating);
            console.log(`🧠 Neural network trained with feedback ${rating}/5 for intent: ${intent}`);
         }
         
         // Cập nhật average rating
         const ratings = userLearning.conversations
            .filter(c => c.rating)
            .map(c => c.rating);
         
         if (ratings.length > 0) {
            userLearning.statistics.avgRating = ratings.reduce((a, b) => a + b) / ratings.length;
         }
         
         // Tăng learning score nếu rating cao
         if (rating >= 4) {
            userLearning.statistics.learningScore += 2;
         } else if (rating <= 2) {
            userLearning.statistics.learningScore = Math.max(0, userLearning.statistics.learningScore - 1);
         }
         
         await userLearning.save();
         
         console.log(`⭐ User ${userId} rated: ${rating}/5 stars. Avg: ${userLearning.statistics.avgRating.toFixed(1)}, Learning Score: ${userLearning.statistics.learningScore}`);
         
      } catch (error) {
         console.error('Feedback error:', error);
      }
   }
   
   // Lấy personalized response dựa trên learning
   async getPersonalizedResponse(userId, message) {
      try {
         const userLearning = await UserLearning.findOne({ userId });
         if (!userLearning) return null;
         
         const prefs = userLearning.preferences;
         const stats = userLearning.statistics;
         
         // Tìm pattern tương tự trong lịch sử
         const similarConversations = userLearning.conversations
            .filter(c => c.rating >= 4 && this.isSimilarMessage(message, c.message))
            .sort((a, b) => b.rating - a.rating);
         
         if (similarConversations.length > 0) {
            const bestConversation = similarConversations[0];
            console.log(`🎯 Found similar conversation for ${userId}: "${bestConversation.message}" -> personalized response`);
            
            return this.personalizeResponse(bestConversation.response, prefs);
         }
         
         return null;
         
      } catch (error) {
         console.error('Personalization error:', error);
         return null;
      }
   }
   
   // Phân tích message để học
   analyzeMessage(message) {
      const lowerMsg = message.toLowerCase();
      
      // Detect language
      const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(message);
      const language = hasVietnamese ? 'vi' : 'en';
      
      // Detect mood
      let mood = 'neutral';
      if (/(cảm ơn|thank|great|tuyệt|đẹp|thích|love|😍|😊|👍|🔥)/i.test(lowerMsg)) {
         mood = 'happy';
      } else if (/(không|no|bad|tệ|dở|😞|😔|👎)/i.test(lowerMsg)) {
         mood = 'frustrated';
      }
      
      // Detect communication style
      let style = 'friendly';
      if (/(xin|please|ạ|dạ)/i.test(lowerMsg)) {
         style = 'formal';
      } else if (/(bro|dude|mày|tao)/i.test(lowerMsg)) {
         style = 'casual';
      }
      
      // Extract intents
      const intents = [];
      if (/(chào|hello|hi)/i.test(lowerMsg)) intents.push('greeting');
      if (/(áo|quần|hoodie)/i.test(lowerMsg)) intents.push('product_search');
      if (/(giá|price)/i.test(lowerMsg)) intents.push('price_inquiry');
      
      return { language, mood, style, intents };
   }
   
   // Cập nhật preferences
   updatePreferences(userLearning, analysis) {
      const prefs = userLearning.preferences;
      
      // Update language preference
      prefs.language = analysis.language;
      
      // Update communication style (weighted average)
      if (analysis.style && analysis.style !== prefs.communicationStyle) {
         prefs.communicationStyle = analysis.style;
      }
      
      // Track common questions
      if (analysis.intents.length > 0) {
         analysis.intents.forEach(intent => {
            if (!prefs.commonQuestions.includes(intent)) {
               prefs.commonQuestions.push(intent);
            }
         });
      }
   }
   
   // Kiểm tra message tương tự
   isSimilarMessage(msg1, msg2) {
      const words1 = msg1.toLowerCase().split(' ');
      const words2 = msg2.toLowerCase().split(' ');
      
      const commonWords = words1.filter(word => 
         words2.includes(word) && word.length > 2
      );
      
      return commonWords.length >= Math.min(3, Math.min(words1.length, words2.length) * 0.6);
   }
   
   // Personalize response theo preferences
   personalizeResponse(response, preferences) {
      let personalizedResponse = response;
      
      // Adjust language style
      if (preferences.communicationStyle === 'formal') {
         personalizedResponse = personalizedResponse
            .replace(/bạn/g, 'quý khách')
            .replace(/mình/g, 'chúng tôi');
      } else if (preferences.communicationStyle === 'casual') {
         personalizedResponse = personalizedResponse
            .replace(/quý khách/g, 'bạn')
            .replace(/chúng tôi/g, 'mình');
      }
      
      return personalizedResponse;
   }
   
   // Lấy thống kê learning
   async getLearningStats(userId) {
      try {
         const userLearning = await UserLearning.findOne({ userId });
         if (!userLearning) {
            return { error: 'User not found' };
         }
         
         return {
            totalMessages: userLearning.statistics.totalMessages,
            avgRating: userLearning.statistics.avgRating,
            learningScore: userLearning.statistics.learningScore,
            language: userLearning.preferences.language,
            style: userLearning.preferences.communicationStyle,
            commonQuestions: userLearning.preferences.commonQuestions,
            recentConversations: userLearning.conversations.slice(-5)
         };
         
      } catch (error) {
         console.error('Stats error:', error);
         return { error: 'Could not fetch stats' };
      }
   }
   
   // Deep analyze message với neural features
   deepAnalyzeMessage(message) {
      const basic = this.analyzeMessage(message);
      const lowerMsg = message.toLowerCase();
      
      // Extract neural network features
      const features = {
         greeting: /(chào|hello|hi|xin chào)/i.test(lowerMsg) ? 1 : 0,
         productInquiry: /(áo|quần|hoodie|sweater|sản phẩm)/i.test(lowerMsg) ? 1 : 0,
         priceQuestion: /(giá|price|bao nhiều|cost)/i.test(lowerMsg) ? 1 : 0,
         styleAdvice: /(phối|outfit|style|tư vấn|gợi ý)/i.test(lowerMsg) ? 1 : 0,
         sizeHelp: /(size|cỡ|kích thước|to|nhỏ)/i.test(lowerMsg) ? 1 : 0,
         complaint: /(không|bad|tệ|dở|sai|lỗi)/i.test(lowerMsg) ? 1 : 0
      };
      
      // Advanced pattern detection
      const patterns = {
         isProductSelection: /(đi|nha|vậy|ok|được|chọn|lấy)\s*$/i.test(message.trim()),
         isComparison: /(so sánh|khác|better|different)/i.test(lowerMsg),
         isUrgent: /(gấp|urgent|nhanh|immediately)/i.test(lowerMsg),
         isSpecific: message.length > 20 && features.productInquiry,
         hasEmoji: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(message)
      };
      
      return {
         ...basic,
         features,
         patterns,
         complexity: this.calculateComplexity(message, features),
         sentiment: this.analyzeSentiment(message)
      };
   }
   
   // Học patterns toàn cục
   async learnGlobalPatterns(message, analysis) {
      try {
         for (const intent of analysis.intents) {
            let pattern = await GlobalPattern.findOne({ intent });
            if (!pattern) {
               pattern = new GlobalPattern({
                  pattern: message,
                  intent,
                  examples: [message]
               });
            } else {
               pattern.usageCount += 1;
               pattern.lastUsed = new Date();
               
               // Add to examples if unique enough
               const isUnique = !pattern.examples.some(ex => 
                  this.isSimilarMessage(message, ex)
               );
               if (isUnique && pattern.examples.length < 10) {
                  pattern.examples.push(message);
               }
            }
            
            await pattern.save();
         }
      } catch (error) {
         console.error('Global pattern learning error:', error);
      }
   }
   
   // Tính độ phức tạp
   calculateComplexity(message, features) {
      const wordCount = message.split(' ').length;
      const featureCount = Object.values(features).reduce((a, b) => a + b, 0);
      
      return {
         wordCount,
         featureCount,
         score: Math.min((wordCount * 0.1 + featureCount * 0.3), 1.0)
      };
   }
   
   // Phân tích sentiment
   analyzeSentiment(message) {
      const positive = /(tuyệt|great|love|thích|đẹp|good|amazing|perfect|😍|😊|👍|❤️|🔥)/i.test(message);
      const negative = /(tệ|bad|hate|không thích|xấu|poor|terrible|😞|😔|👎|😡)/i.test(message);
      
      if (positive && !negative) return 'positive';
      if (negative && !positive) return 'negative';
      return 'neutral';
   }
   
   // Học từ product interactions
   async learnProductPreference(userId, productId, productName, interactionType, productData = {}) {
      try {
         let preference = await ProductPreference.findOne({ userId, productId });
         
         if (!preference) {
            preference = new ProductPreference({
               userId,
               productId,
               productName,
               interactionType,
               preferences: {
                  priceRange: productData.price ? { min: productData.price * 0.8, max: productData.price * 1.2 } : {},
                  preferredStyles: productData.productType ? [productData.productType] : [],
                  preferredSizes: productData.sizes || []
               }
            });
         } else {
            preference.frequency += 1;
            preference.lastInteraction = new Date();
            
            // Update preferences
            if (productData.price && preference.preferences.priceRange) {
               const currentRange = preference.preferences.priceRange;
               preference.preferences.priceRange.min = Math.min(currentRange.min || productData.price, productData.price * 0.9);
               preference.preferences.priceRange.max = Math.max(currentRange.max || productData.price, productData.price * 1.1);
            }
         }
         
         await preference.save();
         console.log(`🛍️ Learned product preference: User ${userId} ${interactionType} ${productName}`);
         
      } catch (error) {
         console.error('Product preference learning error:', error);
      }
   }
   
   // Dự đoán sản phẩm user sẽ thích
   async predictProductPreferences(userId) {
      try {
         const preferences = await ProductPreference.find({ userId })
            .sort({ frequency: -1, lastInteraction: -1 })
            .limit(10);
         
         const predicted = {
            preferredPriceRange: this.calculateAveragePriceRange(preferences),
            preferredStyles: this.getTopStyles(preferences),
            preferredInteractionTypes: this.getTopInteractionTypes(preferences),
            confidence: preferences.length > 0 ? Math.min(preferences.length * 0.1, 1.0) : 0
         };
         
         console.log(`🔮 Predicted preferences for user ${userId}:`, predicted);
         return predicted;
         
      } catch (error) {
         console.error('Prediction error:', error);
         return null;
      }
   }
   
   // Helper methods cho prediction
   calculateAveragePriceRange(preferences) {
      const ranges = preferences
         .map(p => p.preferences.priceRange)
         .filter(r => r && r.min && r.max);
      
      if (ranges.length === 0) return null;
      
      const avgMin = ranges.reduce((sum, r) => sum + r.min, 0) / ranges.length;
      const avgMax = ranges.reduce((sum, r) => sum + r.max, 0) / ranges.length;
      
      return { min: Math.round(avgMin), max: Math.round(avgMax) };
   }
   
   getTopStyles(preferences) {
      const styleCount = {};
      preferences.forEach(p => {
         p.preferences.preferredStyles.forEach(style => {
            styleCount[style] = (styleCount[style] || 0) + p.frequency;
         });
      });
      
      return Object.entries(styleCount)
         .sort(([,a], [,b]) => b - a)
         .slice(0, 3)
         .map(([style]) => style);
   }
   
   getTopInteractionTypes(preferences) {
      const typeCount = {};
      preferences.forEach(p => {
         typeCount[p.interactionType] = (typeCount[p.interactionType] || 0) + p.frequency;
      });
      
      return Object.entries(typeCount)
         .sort(([,a], [,b]) => b - a)
         .map(([type]) => type);
   }
}

export const learningService = new LearningService();
