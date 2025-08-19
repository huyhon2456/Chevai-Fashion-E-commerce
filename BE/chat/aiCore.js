/**
 * Core AI Functions - Tối ưu và ngắn gọn
 * @author Chevai AI Team
 */

import Product from '../models/productModel.js';
import { learningService } from './learningService.js';

// ==================== INTENT ANALYSIS ====================
const INTENT_PATTERNS = {
   greeting: [/^(xin\s*chào|chào|hello|hi|hey)/i],
   product_search: [/(áo|quần|hoodie|sweater|jogger|t-shirt)/i, /(có.*gì|show.*product)/i],
   price_inquiry: [/(giá|price|bao\s*nhiều)/i],
   image_request: [/(ảnh|hình|image|xem)/i],
   confirmation: [/^(có|ok|yes|được|ừ)$/i],
   goodbye: [/(tạm\s*biệt|bye|goodbye)/i]
};

export function analyzeIntent(message) {
   const intents = [];
   const lowerMsg = message.toLowerCase();
   
   for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      if (patterns.some(pattern => pattern.test(lowerMsg))) {
         intents.push(intent);
      }
   }
   
   // Extract product types
   const productTypes = [];
   if (/t-shirt|áo\s*thun/i.test(lowerMsg)) productTypes.push('T-shirt');
   if (/hoodie|áo\s*khoác/i.test(lowerMsg)) productTypes.push('Hoodie');
   if (/sweater|áo\s*len/i.test(lowerMsg)) productTypes.push('Sweater');
   if (/jogger|quần/i.test(lowerMsg)) productTypes.push('Jogger');
   if (/relaxed/i.test(lowerMsg)) productTypes.push('RelaxedFit');
   if (/ringer/i.test(lowerMsg)) productTypes.push('Ringer');
   
   return { intents, productTypes, confidence: intents.length > 0 ? 0.8 : 0.3 };
}

// ==================== PRODUCT SEARCH ====================
export async function searchProducts(analysis, limit = 5) {
   try {
      let query = {};
      
      if (analysis.productTypes.length > 0) {
         query.productType = { $in: analysis.productTypes };
      }
      
      let products = await Product.find(query)
         .sort({ bestseller: -1, date: -1 })
         .limit(limit);
      
      // Fallback to bestsellers
      if (products.length === 0) {
         products = await Product.find({ bestseller: true })
            .sort({ date: -1 })
            .limit(limit);
      }
      
      return products;
   } catch (error) {
      console.error('Search error:', error);
      return [];
   }
}

// ==================== RESPONSE GENERATION ====================
export function generateResponse(message, analysis, products) {
   const { intents } = analysis;
   const hasVietnamese = /[àáạảãâầấậẩẫ]/i.test(message);
   
   // Greeting
   if (intents.includes('greeting')) {
      return hasVietnamese ? 
         "Xin chào! 👋 Mình là AI của Chevai Fashion! Bạn cần gì? 😊" :
         "Hello! 👋 I'm Chevai Fashion AI! How can I help? 😊";
   }
   
   // Product search
   if (intents.includes('product_search') && products.length > 0) {
      const product = products[0];
      const price = Math.round(product.price / 1000) + 'k';
      
      if (product.image && product.image.length > 0) {
         return {
            message: hasVietnamese ?
               `✨ **${product.name}**\n💰 Giá: ${price}\n📏 Size: ${product.sizes?.join(', ') || 'S,M,L'}\n\nBạn thích không? 😍` :
               `✨ **${product.name}**\n💰 Price: $${Math.round(product.price/25000)}\n📏 Size: ${product.sizes?.join(', ') || 'S,M,L'}\n\nDo you like it? 😍`,
            image: product.image[0]
         };
      }
   }
   
   // Price inquiry
   if (intents.includes('price_inquiry') && products.length > 0) {
      const prices = products.map(p => Math.round(p.price / 1000));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      return hasVietnamese ?
         `💰 Giá từ ${minPrice}k - ${maxPrice}k\n🔥 Free ship từ 500k!\nBạn muốn xem sản phẩm nào? 😊` :
         `💰 Price range: $${Math.round(minPrice/25)}-$${Math.round(maxPrice/25)}\n🔥 Free shipping over $20!\nWhat would you like to see? 😊`;
   }
   
   // Default
   return hasVietnamese ?
      "Mình có thể giúp bạn tìm áo, quần hay tư vấn giá cả! Bạn cần gì? 😊" :
      "I can help you find clothes or check prices! What do you need? 😊";
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
                                                        