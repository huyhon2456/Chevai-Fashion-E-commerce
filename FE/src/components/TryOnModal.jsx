import React, { useState } from "react";
import axios from "axios";

export default function TryOnModal({ productImageUrl, productName, onClose }) {
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError("");
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleTryOn = async () => {
    if (!avatarFile) {
      return setError("Hãy chọn ảnh của bạn trước nhé.");
    }
    
    setLoading(true);
    setError("");
    setResult(null);
    
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      formData.append("clothing_url", productImageUrl);

      const { data } = await axios.post("/api/tryon/try-on", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setResult(`data:image/jpeg;base64,${data.imageBase64}`);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 text-2xl hover:text-gray-600 z-10"
        >
          ✕
        </button>
        
        <h3 className="text-xl font-semibold mb-4 text-center">
          🤖 Thử đồ AI - {productName}
        </h3>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Upload ảnh người */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <p className="text-sm font-medium mb-3">1️⃣ Chọn ảnh của bạn</p>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileSelect}
              className="mb-3 w-full text-sm"
            />
            {preview && (
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full max-h-80 object-contain rounded-lg border"
              />
            )}
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Chọn ảnh chính diện, ánh sáng tốt để có kết quả tốt nhất
            </p>
          </div>

          {/* Ảnh sản phẩm */}
          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium mb-3">2️⃣ Sản phẩm được chọn</p>
            <img 
              src={productImageUrl} 
              alt="Product" 
              className="w-full max-h-80 object-contain rounded-lg"
            />
          </div>
        </div>

        {/* Button và error */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <button
            disabled={loading || !avatarFile}
            onClick={handleTryOn}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:scale-100"
          >
            {loading ? "🔄 Đang xử lý..." : "✨ Thử ngay"}
          </button>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              ❌ {error}
            </div>
          )}
        </div>

        {/* Kết quả */}
        {result && (
          <div className="border-t pt-6">
            <p className="text-lg font-semibold mb-4 text-center">🎉 Kết quả</p>
            <div className="flex justify-center">
              <img 
                src={result} 
                alt="Try-on result" 
                className="max-w-md w-full rounded-lg shadow-lg border"
              />
            </div>
            <div className="text-center mt-4">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = result;
                  link.download = `tryon-${productName}.jpg`;
                  link.click();
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm"
              >
                💾 Tải xuống
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-4 text-center">
          ⚠️ Lưu ý: Kết quả có thể khác nhau tùy thuộc vào chất lượng ảnh nguồn. 
          File tối đa 8MB.
        </p>
      </div>
    </div>
  );
}