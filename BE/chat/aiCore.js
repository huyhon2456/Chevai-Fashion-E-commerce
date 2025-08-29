/**
 * Core AI Functions - Tối ưu và ngắn gọn
 * @author Chevai AI Team
 */

import Product from '../models/productModel.js';
import { learningService } from './learningService.js';

// ==================== INTENT ANALYSIS ====================
const INTENT_PATTERNS = {
   greeting: [/^(xin\s*chào|chào|hello|hi|hey|chào\s*bạn)/i],
   product_search: [
      /(áo|quần|hoodie|sweater|jogger|t-shirt|ringer|relaxed)/i, 
      /(có.*gì|show.*product|tìm|mua|cần|muốn)/i,
      /(đẹp|thời\s*trang|trendy|hot|mới)/i,
      /(đi\s*chơi|đi\s*làm|đi\s*học|casual|formal)/i
   ],
   price_inquiry: [/(giá|price|bao\s*nhiều|chi\s*phí|tiền)/i],
   image_request: [/(ảnh|hình|image|xem|show|cho.*xem|muốn.*xem)/i],
   size_inquiry: [/(size|kích\s*thước|form|kg|cân\s*nặng)/i],
   style_advice: [/(phối|style|tư\s*vấn|gợi\s*ý|advice|suggest)/i],
   confirmation: [/^(có|ok|yes|được|ừ|đúng|vậy)$/i],
   goodbye: [/(tạm\s*biệt|bye|goodbye|cảm\s*ơn|thanks)/i]
};

export function analyzeIntent(message) {
   const intents = [];
   const lowerMsg = message.toLowerCase().trim();
   
   for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      if (patterns.some(pattern => pattern.test(lowerMsg))) {
         intents.push(intent);
      }
   }
   
   // Extract product types with better matching
   const productTypes = [];
   if (/t-shirt|áo\s*thun|thun/i.test(lowerMsg)) productTypes.push('T-shirt');
   if (/hoodie|áo\s*khoác|khoác/i.test(lowerMsg)) productTypes.push('Hoodie');
   if (/sweater|áo\s*len|len|áo\s*nỉ/i.test(lowerMsg)) productTypes.push('Sweater');
   if (/jogger|quần|pant/i.test(lowerMsg)) productTypes.push('Jogger');
   if (/relaxed|relax/i.test(lowerMsg)) productTypes.push('RelaxedFit');
   if (/ringer/i.test(lowerMsg)) productTypes.push('Ringer');
   
   // Detect context for better understanding
   const context = {
      bodyWeight: extractWeight(lowerMsg),
      occasion: extractOccasion(lowerMsg),
      style: extractStyle(lowerMsg)
   };
   
   return { 
      intents, 
      productTypes, 
      context,
      confidence: intents.length > 0 ? 0.8 : 0.3 
   };
}

// Helper functions for better context understanding
function extractWeight(message) {
   const weightMatch = message.match(/(\d+)\s*kg/i);
   return weightMatch ? parseInt(weightMatch[1]) : null;
}

function extractOccasion(message) {
   if (/(đi\s*chơi|hang\s*out|casual)/i.test(message)) return 'casual';
   if (/(đi\s*làm|work|formal)/i.test(message)) return 'work';
   if (/(đi\s*học|school|university)/i.test(message)) return 'school';
   return null;
}

function extractStyle(message) {
   if (/(cute|dễ\s*thương|xinh)/i.test(message)) return 'cute';
   if (/(cool|ngầu|chất)/i.test(message)) return 'cool';
   if (/(trendy|hot|thời\s*trang)/i.test(message)) return 'trendy';
   return null;
}

// ==================== PRODUCT SEARCH ====================
export async function searchProducts(analysis, limit = 5) {
   try {
      let query = {};
      const { productTypes, context } = analysis;
      
      // Filter by product type if specified
      if (productTypes.length > 0) {
         query.productType = { $in: productTypes };
      }
      
      // Advanced filtering based on context
      let sortCriteria = { bestseller: -1, date: -1 };
      
      // If asking for trendy/hot items, prioritize newer products
      if (context.style === 'trendy') {
         sortCriteria = { date: -1, bestseller: -1 };
      }
      
      let products = await Product.find(query)
         .sort(sortCriteria)
         .limit(limit);
      
      // Fallback strategies
      if (products.length === 0) {
         // Try broader search
         if (productTypes.length > 0) {
            // Search for similar product types
            const broadTypes = expandProductTypes(productTypes);
            products = await Product.find({ 
               productType: { $in: broadTypes }
            })
            .sort({ bestseller: -1, date: -1 })
            .limit(limit);
         }
         
         // Final fallback to bestsellers
         if (products.length === 0) {
            products = await Product.find({ bestseller: true })
               .sort({ date: -1 })
               .limit(limit);
         }
      }
      
      return products;
   } catch (error) {
      console.error('Search error:', error);
      return [];
   }
}

// Helper function to expand product types for better matching
function expandProductTypes(types) {
   const expanded = [...types];
   
   // Add related types
   if (types.includes('T-shirt')) {
      expanded.push('RelaxedFit', 'Ringer');
   }
   if (types.includes('Jogger')) {
      expanded.push('T-shirt', 'Hoodie'); // Good combinations
   }
   if (types.includes('Hoodie')) {
      expanded.push('Sweater', 'Jogger');
   }
   
   return [...new Set(expanded)]; // Remove duplicates
}

// ==================== RESPONSE GENERATION ====================
export function generateResponse(message, analysis, products) {
   const { intents, context } = analysis;
   const hasVietnamese = /[àáạảãâầấậẩẫ]/i.test(message);
   
   // Greeting - tự nhiên hơn
   if (intents.includes('greeting')) {
      const greetings = hasVietnamese ? [
         "Chào bạn! � Mình có thể giúp bạn tìm outfit đẹp nào hôm nay?",
         "Hi! 👋 Bạn cần tìm trang phục gì không?",
         "Hello! ✨ Mình sẵn sàng tư vấn thời trang cho bạn!"
      ] : [
         "Hello! 👋 How can I help you find great fashion today?",
         "Hi there! 😊 Looking for something stylish?",
         "Hey! ✨ Ready to find your perfect outfit?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
   }
   
   // Product search - phản hồi theo context
   if (intents.includes('product_search') && products.length > 0) {
      const product = products[0];
      const price = formatPrice(product.price);
      
      // Tạo response dựa trên context
      let responseText = '';
      
      if (context.occasion === 'casual') {
         responseText = hasVietnamese ? 
            `Cho đi chơi thì mình gợi ý này nha! 🎉\n\n` :
            `Perfect for hanging out! 🎉\n\n`;
      } else if (context.bodyWeight) {
         responseText = hasVietnamese ?
            `Với cân nặng ${context.bodyWeight}kg thì size này sẽ vừa vặn! 📏\n\n` :
            `For ${context.bodyWeight}kg, this size should fit perfectly! 📏\n\n`;
      } else {
         responseText = hasVietnamese ?
            `Mình có món đẹp này cho bạn! ✨\n\n` :
            `I have this beautiful piece for you! ✨\n\n`;
      }
      
      if (product.image && product.image.length > 0) {
         responseText += hasVietnamese ?
            `**${product.name}**\n💰 Giá: ${price}\n📏 Size có: ${product.sizes?.join(', ') || 'S,M,L,XL'}\n🏷️ ${product.productType}\n\nBạn thích không? 😍` :
            `**${product.name}**\n💰 Price: $${Math.round(product.price/25000)}\n📏 Sizes: ${product.sizes?.join(', ') || 'S,M,L,XL'}\n🏷️ ${product.productType}\n\nDo you like it? 😍`;
            
         return {
            message: responseText,
            image: product.image[0]
         };
      }
   }
   
   // Style advice
   if (intents.includes('style_advice')) {
      return hasVietnamese ?
         "Bạn muốn phối đồ kiểu gì? Casual, formal hay trendy? Mình sẽ tư vấn chi tiết! 👗✨" :
         "What style are you going for? Casual, formal, or trendy? I'll give you detailed advice! 👗✨";
   }
   
   // Price inquiry
   if (intents.includes('price_inquiry') && products.length > 0) {
      const prices = products.map(p => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      return hasVietnamese ?
         `💰 Giá dao động từ ${formatPrice(minPrice)} - ${formatPrice(maxPrice)}\n🔥 Miễn phí ship từ 500k!\n🎁 Có nhiều ưu đãi hot đấy!` :
         `💰 Price range: $${Math.round(minPrice/25000)}-$${Math.round(maxPrice/25000)}\n🔥 Free shipping over $20!\n🎁 Great deals available!`;
   }
   
   // Size inquiry
   if (intents.includes('size_inquiry')) {
      return hasVietnamese ?
         "Bạn cho mình biết cân nặng và chiều cao để mình tư vấn size chuẩn nhất nha! 📏😊" :
         "Please share your weight and height so I can recommend the perfect size! 📏😊";
   }
   
   // Image request
   if (intents.includes('image_request') && products.length > 0) {
      const product = products[0];
      if (product.image && product.image.length > 0) {
         return {
            message: hasVietnamese ?
               `Đây nha bạn! 📸✨\n\n**${product.name}**\nBạn thấy thế nào?` :
               `Here you go! �✨\n\n**${product.name}**\nWhat do you think?`,
            image: product.image[0]
         };
      }
   }
   
   // Default - thân thiện hơn
   const defaultResponses = hasVietnamese ? [
      "Mình có thể giúp bạn tìm áo, quần, hay tư vấn phối đồ! Bạn cần gì nào? 😊",
      "Bạn muốn xem những món đồ hot nhất không? Hay cần tư vấn gì khác? 🔥",
      "Hãy nói cho mình biết bạn thích style nào để mình gợi ý nha! ✨"
   ] : [
      "I can help you find clothes or give styling advice! What do you need? 😊",
      "Want to see our hottest items? Or need other recommendations? 🔥",
      "Tell me your style preference and I'll suggest something perfect! ✨"
   ];
   
   return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Helper function to format price
function formatPrice(price) {
   if (price >= 1000000) {
      return Math.round(price / 1000000) + 'tr';
   } else {
      return Math.round(price / 1000) + 'k';
   }
}

// ==================== MAIN AI FUNCTION ====================
export async function processMessage(message, userId = null) {
   try {
      // Learn from user message
      if (userId) {
         await learningService.learnFromMessage(userId, message);
      }
      
      // Analyze and respond
      const analysis = analyzeIntent(message);
      const products = await searchProducts(analysis);
      const response = generateResponse(message, analysis, products);
      
      // Learn from successful response
      if (userId && response) {
         await learningService.learnFromResponse(userId, message, response);
      }
      
      return response;
   } catch (error) {
      console.error('AI processing error:', error);
      return "Xin lỗi, mình gặp sự cố! Thử lại nhé 😅";
   }
}
                                                        