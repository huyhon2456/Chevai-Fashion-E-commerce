// routes/tryon.js
import express from "express";
import multer from "multer";
import axios from "axios";

const router = express.Router();

// Cải thiện multer config với validation
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: (process.env.MAX_UPLOAD_MB ? Number(process.env.MAX_UPLOAD_MB) : 8) * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    if (!/image\/(jpeg|png|webp)/.test(file.mimetype)) {
      return cb(new Error("Chỉ chấp nhận file JPEG/PNG/WebP"));
    }
    cb(null, true);
  }
});

router.post("/try-on", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Thiếu ảnh người (avatar)" });
    }

    const { clothing_url } = req.body;
    if (!clothing_url) {
      return res.status(400).json({ message: "Thiếu clothing_url" });
    }

    const avatarBuffer = req.file.buffer.toString("base64");

    const hfResponse = await axios.post(
      "https://api-inference.huggingface.co/models/fashionchevai", 
      {
        inputs: {
          image: avatarBuffer,
          cloth: clothing_url
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer",
        timeout: 120000 // 2 phút timeout cho Hugging Face
      }
    );

    // Trả về base64 cho FE
    const base64Image = Buffer.from(hfResponse.data, "binary").toString("base64");
    res.json({ 
      imageBase64: base64Image,
      mime: "image/jpeg"
    });
  } catch (err) {
    console.error("Try-on error:", err.response?.data || err.message);
    
    // Xử lý lỗi đặc biệt của Hugging Face
    if (err.response?.status === 503) {
      return res.status(503).json({ 
        message: "Model đang khởi động, vui lòng thử lại sau 30 giây" 
      });
    }
    
    if (err.response?.status === 429) {
      return res.status(429).json({ 
        message: "Quá nhiều requests, vui lòng thử lại sau" 
      });
    }

    res.status(500).json({ message: "Lỗi khi gọi AI Try-on" });
  }
});

export default router;
