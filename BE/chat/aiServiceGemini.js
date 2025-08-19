import Product from '../models/productModel.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { setConversationContext, getConversationContext, isImageConfirmation, getLastMentionedProduct } from './conversationContext.js';
import dotenv from 'dotenv';
dotenv.config();

// Simple in-memory cache for product context by roomId (or userId)
const productContextCache = {};

// Khởi tạo Gemini AI (FREE 15 requests/minute - 1500 requests/day)
let genAI = null;
try {
   const apiKey = process.env.GEMINI_API_KEY?.trim();
   if (apiKey && apiKey.length > 10) {
      genAI = new GoogleGenerativeAI(apiKey);
      console.log('✅ Gemini AI initialized successfully');
   } else {
      console.log('⚠️ Gemini API key not found or invalid');
   }
} catch (error) {
   console.error('❌ Failed to initialize Gemini AI:', error.message);
}

/**
 * Tìm sản phẩm đơn giản cho Gemini với productType structure
 */
async function findProductsForGemini(message) {
   try {
      const lowerMessage = message.toLowerCase();
      let query = {};
      
      // Check if user is asking about a specific product by name OR selecting a product
      const isSpecificProductQuery = (lowerMessage.length > 20 && 
                                    /(áo\s*thun.*|hoodie.*|sweater.*|quần.*)\s+\w+/i.test(message)) ||
                                    /(đi|nha|vậy|ok|được|chọn|lấy)\s*$/i.test(message.trim());
      
      if (isSpecificProductQuery) {
         // Search by partial name match for specific products
         const cleanMessage = lowerMessage.replace(/(đi|nha|vậy|ok|được|chọn|lấy)\s*$/i, '').trim();
         const keywords = cleanMessage.split(' ').filter(word => word.length > 2);
         if (keywords.length >= 2) {
            const searchPattern = keywords.slice(0, 6).join('.*'); // Take more keywords for better match
            query.name = { $regex: searchPattern, $options: 'i' };
            console.log(`🔍 Searching by name pattern: "${searchPattern}"`);
         }
      } else {
         // Use productType detection for general queries
         const productTypeMap = [
            { key: 'Hoodie', regex: /(hoodie|hodie|hoody|áo\s*khoác|áo\s*có\s*mũ|khoác)/i },
            { key: 'Sweater', regex: /(sweater|swetter|áo\s*len|áo\s*ấm|len)/i },
            { key: 'T-shirt', regex: /(áo\s*thun|t-shirt|tshirt|t\s*shirt|áo\s*tee|thun(?!\s*(relaxed|ringer)))/i },
            { key: 'RelaxedFit', regex: /(relaxed\s*fit|áo thun relaxed fit|relaxed)/i },
            { key: 'Ringer', regex: /(ringer|áo thun ringer|viền)/i },
            { key: 'Jogger', regex: /(jogger|jooger|quần\s*thể\s*thao|quần\s*dài|quần\s*ống\s*suông|quần(?!\s*(short|sort)))/i }
         ];

         for (const { key, regex } of productTypeMap) {
            if (regex.test(lowerMessage)) {
               query.productType = key;
               console.log(`🎯 Detected productType: ${key} from message: "${message}"`);
               break;
            }
         }
      }

      console.log('🔍 Gemini Query:', query);
      
      // Tìm sản phẩm - TĂNG LIMIT để có đủ sản phẩm cho user request
      let products = await Product.find(query).sort({ bestseller: -1, date: -1 }).limit(10);
      
      // Fallback nếu không tìm thấy
      if (products.length === 0) {
         console.log('⚠️ No products found with specific query, trying bestsellers...');
         products = await Product.find({ bestseller: true }).sort({ date: -1 }).limit(10);
      }
      
      // Final fallback
      if (products.length === 0) {
         console.log('⚠️ No bestsellers found, trying any products...');
         products = await Product.find({}).sort({ date: -1 }).limit(5);
      }
      
      console.log(`📦 Found ${products.length} products for Gemini processing`);
      return products;
      
   } catch (error) {
      console.error('Error in findProductsForGemini:', error);
      return [];
   }
}

/**
 * Generate Gemini AI response với Smart Image Logic
 */
export async function generateGeminiAI(message, roomId = null) {
   try {
      console.log(`🤖 Gemini AI Processing: "${message}"`);
      console.log(`🔍 genAI status: ${genAI ? 'Initialized' : 'NULL - Using fallback'}`);
      
      // Check if user is asking for specific product type
      const hasSpecificProductType = /(hoodie|sweater|jogger|t-shirt|áo thun|quần|ringer|relaxed)/i.test(message);
      
      // Check for image confirmation first - BUT NOT if asking for different product
      if (isImageConfirmation(message, roomId) && !hasSpecificProductType) {
         const lastProduct = getLastMentionedProduct(roomId);
         if (lastProduct && lastProduct.image && lastProduct.image.length > 0) {
            const price = Math.round(lastProduct.price / 1000) + 'k';
            console.log(`📸 Showing image for confirmed product: ${lastProduct.name}`);
            return {
               message: `Dạ! Đây là ảnh sản phẩm ạ! 😍\n\n📸 **${lastProduct.name}**\n💰 Giá: ${price}\n📏 Size: ${lastProduct.sizes?.join(', ') || 'S, M, L'}\n🎯 ${lastProduct.productType}\n\nSản phẩm này đẹp lắm! Bạn thích không? 🥰`,
               image: lastProduct.image[0]
            };
         }
      }

      if (!genAI) {
         // Fallback đơn giản khi không có Gemini
         console.log('⚠️ Using fallback response - Gemini not initialized');
         return "Xin chào! 👋 Chevai Fashion có đa dạng sản phẩm: T-shirt, Hoodie, Sweater, Jogger và nhiều loại khác! Bạn muốn xem gì? 😊";
      }
      
      console.log(`🚀 Using real Gemini AI for: "${message}"`);
      
      // 1. Check if user is referring to a previous product (STRICTER CHECK)
      const context = getConversationContext(roomId);
      let isReferringToPrevious = /(áo này|sản phẩm này|cái này|này.*có|có.*này|item này|product này)/i.test(message) &&
                                  !hasSpecificProductType;
      
      // 2. Tìm sản phẩm liên quan - ALWAYS SEARCH NEW if user mentions specific product type
      let products = [];
      
      if (isReferringToPrevious && context?.lastProducts?.length > 0) {
         // Use products from conversation context ONLY if no specific product type mentioned
         products = context.lastProducts;
         console.log(`🔗 Using products from conversation context: ${products.length} items`);
      } else {
         // Find new products - CLEAR old context when searching for new products
         if (hasSpecificProductType && roomId) {
            console.log(`🔄 Clearing old context - user asking for specific product type`);
            // Don't completely clear, but mark as new search
         }
         products = await findProductsForGemini(message);
      }
      console.log(`🛍️ Found ${products.length} products for Gemini`);
      
      // 3. Tạo context với thông tin ảnh theo productType structure
      let productContext = products.length > 0
         ? products.map((p, index) => {
            const price = Math.round(p.price / 1000) + 'k';
            const hasImage = p.image && p.image.length > 0 ? ' (có ảnh)' : '';
            const productInfo = p.productType ? ` - ${p.productType}` : '';
            const sizes = p.sizes && p.sizes.length > 0 ? ` - Sizes có sẵn: ${p.sizes.join(', ')}` : ' - Không có thông tin size';
            // Shorten description but keep important info
            const description = p.description ? ` - ${p.description.substring(0, 80).replace(/\r\n/g, ' ')}...` : '';
            return `${index + 1}. **${p.name}**${productInfo} - ${price}${sizes}${hasImage}${description}`;
         }).join('\n\n')
         : 'Không có sản phẩm cụ thể.';

      // Lưu context sản phẩm vào cache nếu có roomId và có danh sách
      if (roomId && products.length > 0) {
         productContextCache[roomId] = products;
      }

      // 4. Prompt cho Gemini - THÔNG MINH KHÔNG HARD-CODE
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      console.log('🎯 Using Gemini model: gemini-1.5-flash');
      const prompt = `Bạn là Ai-chan 🤖, trợ lý thời trang thông minh của Chevai Fashion.

QUAN TRỌNG: CHỈ sử dụng thông tin từ danh sách sản phẩm bên dưới. KHÔNG tự tạo ra tên sản phẩm, mô tả, hay thông tin nào khác.

User hỏi: "${message}"

DANH SÁCH SẢN PHẨM CÓ SẴN:
${productContext}

QUY TẮC BẮT BUỘC:
1. Nếu user nói TÊN SẢN PHẨM CỤ THỂ (có trong danh sách) + "đi/nha/vậy/ok" → Hiểu đây là CHỌN sản phẩm đó, trả lời chi tiết về sản phẩm đó với giá, mô tả, size
2. Nếu user hỏi về SIZE/CÂN NẶNG → CHỈ sử dụng sizes có SẴN của từng sản phẩm trong danh sách. Tư vấn theo nguyên tắc:
   - Xem sizes có sẵn của từng sản phẩm trong danh sách
   - Tư vấn size phù hợp: 45-55kg (S), 55-65kg (M), 65-75kg (L), 75kg+ (XL)
   - CHỈ giới thiệu sản phẩm có size phù hợp với cân nặng
   - Nếu sản phẩm không có size phù hợp → Không giới thiệu sản phẩm đó
   - VÍ DỤ: User 60kg → Chỉ giới thiệu sản phẩm nào có size M trong danh sách
3. Nếu user hỏi "áo này", "sản phẩm này" mà không rõ là gì → Hỏi lại: "Bạn đang muốn hỏi về áo nào nhỉ? 🤔"
4. CHỈ giới thiệu sản phẩm có TRONG DANH SÁCH TRÊN
5. KHÔNG tự tạo ra: "áo thun kiểu Ringer", "in hình anh đào", hay bất kỳ mô tả nào không có
6. Sử dụng CHÍNH XÁC tên sản phẩm từ danh sách
7. Trả lời ngắn gọn, thân thiên như người bạn
8. Nếu có sản phẩm phù hợp: giới thiệu với giá và thông tin CHÍNH XÁC
9. Kết thúc bằng câu hỏi để tiếp tục chat
10. Nếu không liên quan thời trang: "Mình chỉ hỗ trợ về thời trang Chevai thôi! 😊"

VÍ DỤ TƯ VẤN SIZE:
User: "60kg thì mình nên mặc size bao nhiêu"
→ Kiểm tra danh sách, tìm sản phẩm có size M, chỉ giới thiệu những sản phẩm đó
→ "Với cân nặng 60kg, bạn nên mặc size M. Trong danh sách có: [Tên sản phẩm có size M] - [giá] - Size: [chỉ liệt kê sizes thực tế]"

VÍ DỤ CHỌN SẢN PHẨM:
User: "Áo Thun Ringer Relaxed Fit Tropical Cherries Sweet đi"
→ Hiểu: User chọn sản phẩm này, trả lời chi tiết về nó với sizes thực tế

VÍ DỤ SAI: "áo thun kiểu Ringer Relaxed Fit in hình anh đào" ← KHÔNG ĐƯỢC LÀM
VÍ DỤ ĐÚNG: Sử dụng tên từ danh sách: "Áo Thun Relaxed Fit Porsche Berry Porsche T-Shirt"`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      console.log(`🤖 Gemini response: ${response.length} chars`);
      console.log(`📝 Response content: ${response.substring(0, 100)}...`);

      // 5. Chỉ lấy sản phẩm theo số thứ tự nếu AI vừa trả về danh sách context (ưu tiên lấy từ cache nếu có roomId)
      let recommendedProduct = null;
      let contextProducts = products;
      if (roomId && productContextCache[roomId]) {
         contextProducts = productContextCache[roomId];
      }
      const hasProductList = contextProducts && contextProducts.length > 0;
      const productIndexMatch = hasProductList && message.match(/(?:sản phẩm|item|product)\s*(?:số\s*)?(\d+)/i);
      
      if (hasProductList && productIndexMatch) {
         const requestedIndex = parseInt(productIndexMatch[1]) - 1;
         if (requestedIndex >= 0 && requestedIndex < contextProducts.length) {
            recommendedProduct = contextProducts[requestedIndex];
            console.log(`🎯 Found product by INDEX: #${requestedIndex + 1} - ${recommendedProduct.name}`);
         } else {
            console.log(`⚠️ User requested product #${requestedIndex + 1} but only have ${contextProducts.length} products`);
            return {
               message: `Xin lỗi bạn! 😅 Hiện tại mình chỉ có ${contextProducts.length} sản phẩm thôi (từ 1 đến ${contextProducts.length}).\n\nBạn muốn xem sản phẩm nào? 🛍️`,
               image: null
            };
         }
      }
      // NEW: Tìm sản phẩm theo tên khi user search cụ thể
      else if (hasProductList && /(cho|xem|muốn|tìm)\s*(sản phẩm|áo|quần)/i.test(message)) {
         // Tìm sản phẩm có tên khớp nhất với query
         const productNameInMessage = message.toLowerCase();
         for (const product of contextProducts) {
            if (product.name && productNameInMessage.includes(product.name.toLowerCase().substring(0, 20))) {
               recommendedProduct = product;
               console.log(`🎯 Found product by NAME: ${recommendedProduct.name}`);
               break;
            }
         }
         // Fallback: nếu không tìm thấy theo tên, lấy sản phẩm đầu tiên
         if (!recommendedProduct && contextProducts.length > 0) {
            recommendedProduct = contextProducts[0];
            console.log(`🎯 Using first product as fallback: ${recommendedProduct.name}`);
         }
      }
      
      // Nếu user hỏi câu mới không liên quan (nhưng giữ context cho confirmation)
      const isConfirmation = /^(có|ok|yes|được|đồng\s*ý|ừ|ừm|vâng)$/i.test(message.trim());
      if (roomId && !productIndexMatch && !isConfirmation) {
         // Chỉ xóa context nếu không phải confirmation và không phải tiếp tục cuộc trò chuyện
         const isContinuation = /(cho|xem|muốn|tìm)\s*(sản phẩm|áo|quần|ảnh|hình)/i.test(message);
         if (!isContinuation) {
            delete productContextCache[roomId];
         }
      }

      // 5. CHỈ hiển thị ảnh khi:
      // - User hỏi cụ thể về 1 sản phẩm (theo số thứ tự hoặc product name)
      // - User yêu cầu xem ảnh 
      // - User confirm (có, ok, yes) sau khi được hỏi
      // - AI recommend 1 sản phẩm cụ thể
      // - AI response có nhắc đến "ảnh" hoặc "image"
      const userWantsImage = /(ảnh|hình|image|xem|show|cho.*xem|muốn.*xem|cho.*mình.*xem)/i.test(message);
      const userAsksSpecificProduct = /(?:sản phẩm|item|product)\s*(?:số\s*)?\d+/i.test(message) || /(cho|xem|muốn|tìm)\s*(sản phẩm|áo|quần)/i.test(message);
      const userConfirms = /^(có|ok|yes|được|đồng\s*ý|ừ|ừm|vâng)$/i.test(message.trim());
      const responseMentionsImage = /(ảnh|image|hình)/i.test(response);
      const isRecommendingProduct = /(?:sản phẩm số|item \d+|product \d+)/i.test(response);

      // CHỈ show ảnh khi có sản phẩm phù hợp và user có intent xem hoặc AI recommend cụ thể
      const hasValidProduct = recommendedProduct !== null;
      const shouldShowImage = hasValidProduct && (userWantsImage || userAsksSpecificProduct || userConfirms || responseMentionsImage || isRecommendingProduct);

      if (shouldShowImage && recommendedProduct.image && recommendedProduct.image.length > 0) {
         const reason = userAsksSpecificProduct ? 'specific product requested' : 
                       responseMentionsImage ? 'AI mentioned image' : 
                       isRecommendingProduct ? 'AI recommending product' :
                       userConfirms ? 'user confirmed' :
                       'image requested';
         console.log(`📸 Adding relevant image from: ${recommendedProduct.name} (reason: ${reason})`);
         return {
            message: response,
            image: recommendedProduct.image[0]
         };
      }

      // 6. Store conversation context for product mentions and image requests
      const isAskingForImage = /(muốn xem ảnh|có muốn xem|xem ảnh không|want to see|see image|ảnh của sản phẩm|ảnh không)/i.test(response);
      const mentionsProduct = /(hoodie|sweater|jogger|t-shirt|áo|quần)/i.test(response) && contextProducts.length > 0;
      
      if (roomId && (isAskingForImage || mentionsProduct)) {
         const productToStore = recommendedProduct || (contextProducts.length > 0 ? contextProducts[0] : null);
         if (productToStore) {
            setConversationContext(roomId, {
               lastAction: isAskingForImage ? 'asked_for_image' : 'mentioned_product',
               lastProduct: productToStore,
               lastProducts: contextProducts, // Store all products for choice
               lastResponse: response,
               aiProvider: 'Gemini'
            });
            console.log(`💭 Stored context - ${isAskingForImage ? 'asking for image' : 'mentioned product'}: ${productToStore.name}`);
         }
      }

      // 7. KHÔNG có ảnh khi không cần thiết
      console.log(`📝 Returning text-only response (${hasValidProduct ? 'product found but no image needed' : 'no matching product'})`);
      return response;

   } catch (error) {
      console.error('🚨 Gemini AI Error:', error);

      // If it's a 503 Service Unavailable or rate limit error, throw it so hybrid can fallback to custom AI
      if (error.status === 503 || error.status === 429 || error.message?.includes('overloaded') || error.message?.includes('quota')) {
         console.log('🔄 Gemini overloaded/quota exceeded - throwing error for hybrid fallback');
         throw error;
      }

      // For other errors, provide intelligent fallback
      const keywords = ['chào', 'hello', 'hi', 'xin chào', 'áo', 'quần', 'giá', 'price'];
      const hasKeyword = keywords.some(keyword => message.toLowerCase().includes(keyword));

      if (hasKeyword) {
         return "Xin chào! 👋 Mình là AI của Chevai Fashion! Chevai có T-shirt, Hoodie, Sweater, Jogger và nhiều sản phẩm thời trang đẹp lắm! Bạn muốn xem gì? 😊✨";
      }

      return "Xin lỗi, mình đang gặp sự cố nhỏ! 😅 Thử hỏi lại hoặc liên hệ admin nhé! 🛠️";
   }
}

/**
 * Kiểm tra có nên dùng Gemini không - CẢI TIẾN
 */
export function shouldGeminiRespond(message) {
   const trimmed = message.trim();
   
   // Quá ngắn hoặc chỉ có ký tự đặc biệt
   if (trimmed.length < 2 || /^[\d\s\-_.,!?]*$/i.test(trimmed)) {
      return false;
   }
   
   // Chỉ emoji hoặc sticker
   if (/^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u.test(trimmed)) {
      return false;
   }
   
   // Tin nhắn admin only
   if (/(admin\s+only|private\s+message)/i.test(trimmed)) {
      return false;
   }
   
   // Có từ khóa thời trang hoặc câu hỏi hợp lệ hoặc yêu cầu xem hình
   const fashionKeywords = /(áo|quần|thời trang|fashion|clothes|shirt|pants|hoodie|sweater|jogger|tshirt|ringer|relaxed)/i;
   const validQuestion = /(gì|nào|sao|như|khi|có|bao|price|giá|size|màu|color)/i;
   const greeting = /(chào|hello|hi|xin)/i;
   const imageRequest = /(hình|ảnh|image|photo|pic|xem|show|cho.*xem|muốn.*xem)/i;
   
   return fashionKeywords.test(trimmed) || validQuestion.test(trimmed) || greeting.test(trimmed) || imageRequest.test(trimmed);
}

/**
 * Stats về Gemini usage
 */
export function getGeminiStats() {
   return {
      provider: 'Google Gemini',
      cost: 'FREE',
      limits: '15 requests/minute, 1500/day',
      getApiKey: 'https://makersuite.google.com/app/apikey'
   };
}
