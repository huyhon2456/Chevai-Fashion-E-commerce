# 🤖 Chevai AI System - Tối ưu & Thông minh

## 📁 Cấu trúc file AI cuối cùng (tối ưu tối đa)

```
BE/chat/
├── aiCore.js              # Core AI functions (200 dòng, thay thế aiService.js)
├── smartAI.js             # Smart router (thay thế aiHybrid.js)  
├── learningService.js     # Học từ người dùng
├── aiServiceGemini.js     # Gemini AI (giữ nguyên)
├── conversationContext.js # Context management
├── chatHandler.js         # Xử lý chat (đã cập nhật)
├── aiTest.js              # Test suite (optional)
└── README.md              # Tài liệu này
```



## 🚀 Tính năng mới

### 1. AI Learning System
- **Học cách nói chuyện** từ user feedback
- **Nhớ preferences**: ngôn ngữ, style, sản phẩm yêu thích
- **Personalized responses** cho từng user
- **Rating system** 1-5 sao để cải thiện

### 2. Smart AI Router
- **Tự động chọn** AI tốt nhất (Core AI hoặc Gemini)
- **Tiết kiệm quota** Gemini cho câu hỏi phức tạp
- **Fallback thông minh** khi có lỗi

### 3. Compact Code
- **aiCore.js**: 200 dòng thay vì 800+ dòng
- **Dễ maintain** và debug
- **Performance tốt hơn**

## 📝 API Learning mới

```javascript
// Gửi feedback
POST /api/learning/feedback
{
  "userId": "user123",
  "rating": 5,
  "roomId": "room456"
}

// Lấy stats user
GET /api/learning/user-stats/user123

// Test AI response
POST /api/learning/test-response
{
  "message": "xin chào",
  "userId": "user123"
}
```

## 🎯 Cách AI học

1. **Language Detection**: Tự động nhận biết tiếng Việt/English
2. **Style Learning**: Formal ("xin chào ạ") vs Casual ("hi bro")
3. **Mood Analysis**: Happy 😊 vs Frustrated 😞
4. **Feedback Integration**: Rating cao → nhớ pattern đó
5. **Personalization**: Tự động adapt theo user preference

## 🔧 Setup & Test

1. **Start server**:
```bash
npm start
```

2. **Test learning**:
```bash
# Trong browser console hoặc Postman
fetch('/api/learning/test-response', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'xin chào, tôi muốn mua áo hoodie',
    userId: 'demo-user'
  })
})
```

3. **Gửi feedback**:
```bash
fetch('/api/learning/feedback', {
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'demo-user',
    rating: 5
  })
})
```

## 🎨 Frontend Integration

### Thêm rating buttons:
```jsx
const RatingButtons = ({ onRate }) => (
  <div className="rating-buttons">
    {[1,2,3,4,5].map(rating => (
      <button 
        key={rating}
        onClick={() => onRate(rating)}
        className="rating-btn"
      >
        {rating}⭐
      </button>
    ))}
  </div>
);
```

### Hiển thị learning stats:
```jsx
const UserStats = ({ userId }) => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetch(`/api/learning/user-stats/${userId}`)
      .then(res => res.json())
      .then(data => setStats(data.userStats));
  }, [userId]);
  
  return (
    <div className="user-stats">
      <p>Messages: {stats?.totalMessages}</p>
      <p>AI Rating: {stats?.avgRating?.toFixed(1)}⭐</p>
      <p>Language: {stats?.language}</p>
      <p>Style: {stats?.style}</p>
    </div>
  );
};
```

## 🎪 Example Conversations

```
👤 User: "xin chào ạ" (formal detected)
🤖 AI: "Kính chào quý khách! Chevai có thể hỗ trợ gì ạ?"

👤 User: "hi bro!" (casual detected)  
🤖 AI: "Yo! Chevai có gì hot không bro? 😎"

👤 User rates 5⭐ → AI learns this style works

Next conversation:
🤖 AI: Automatically adapts to user's preferred style!
```

## 🔥 Benefits

- ✅ **Code ngắn gọn** (giảm 70% dòng code)
- ✅ **AI thông minh hơn** (học từ user)
- ✅ **Performance tốt hơn** (smart routing)
- ✅ **Dễ maintain** (code organized)
- ✅ **User experience cá nhân hóa**
- ✅ **Tiết kiệm Gemini quota**

## 🚀 Next Steps

1. **Deploy** và test với real users
2. **Collect feedback** data
3. **Analyze learning patterns**
4. **Optimize** AI responses
5. **Add more** personalization features

---
**Made with ❤️ by Chevai AI Team**
