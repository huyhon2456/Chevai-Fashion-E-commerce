import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import RelatedProducts from '../components/RelatedProducts'
import TryOnModal from '../components/TryOnModal'


const Product = () => {
    
  const sizeGuideImages = {
    'T-shirt': assets.tshirt,
    'RelaxedFit': assets.tshirt,
    'Ringer': assets.ringer,
    'Hoodie': assets.hoodie,
    'Sweater': assets.sweeter,
    'Jogger': assets.pant,
   
  };
  const [tab, setTab] = useState('size');
  const [showTryOn, setShowTryOn] = useState(false);
  const toggleTab = (key) => {
    setTab(tab === key ? '' : key);
  };
  const { productId } = useParams();
  const { products, formatCurrency, AddToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('')
  const [size, setSize] = useState('')
  

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item)
        setImage(item.image[0])
        return null;
      }
    })
  }
  useEffect(() => {
    fetchProductData();
  }, [productId, products])

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/*dữ liệu sản phẫm */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        {/*dữ liệu hình ảnh */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {
              productData.image.map((item, index) => (
                <img onClick={() => setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' alt="" />
              ))
            }
          </div>
          <div className='w-full sm:w-[80%]'>
            <img className='w-full h-aut0' src={image} alt="" />
          </div>
        </div>
        {/*thông tin sản phẫm */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl my-2'>{productData.name}</h1>
          <div className='flex items-center gap-1 mt-2'>
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_dull_icon} alt="" className="w-3 5" />
            <p className='pl-2'>(245)</p>
          </div>
          <p className='mt-5 text-3xl font-medium'>{formatCurrency(productData.price)}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
          <div className='flex flex-col gap-4 my-8'>
            <p>Kích cỡ</p>
            <div className='flex gap-2'>
              {productData.sizes.map((item, index) => (
                <button onClick={() => setSize(item)} className={`border py-2 px-4 bg-gray-100 ${item == size ? 'border-black' : ''}`} key={index}>{item}</button>
              ))}
            </div>
          </div>
          <div className='flex flex-wrap gap-3 mt-2'>
            <button onClick={() => AddToCart(productData._id, size)} className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>
              THÊM VÀO GIỎ</button>
            {/*nút thử đồ */}
            <button 
              onClick={() => setShowTryOn(true)} 
              className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-sm rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg'>
              🤖 THỬ NGAY (AI)
            </button>
          </div>
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>Vui lòng kiểm tra size cẩn thận trước khi đặt hàng.</p>
            <p>Vui lòng quay video khi mở gói hàng.</p>
            <p>Cửa hàng chỉ chấp nhận đổi hoặc trả lại áo nếu khách hàng có video.</p>

          </div>
          {/*các hướng dẫn */}
          <div className='mt-20 '>
            <div className='flex flex-col gap-2 w-full mx-auto'>
              {/* HƯỚNG DẪN ĐẶT SIZE */}
              <button
                className={`flex items-center justify-between border px-5 py-3 text-sm w-full font-bold ${tab === 'size' ? ' border-black' : 'bg-white'}`}
                onClick={() => toggleTab('size')}
              >
                <span>HƯỚNG DẪN CHỌN KÍCH CỠ</span>
                <span>{tab === 'size' ? '▲' : '▼'}</span>
              </button>
              {tab === 'size' && (
                <div className='flex flex-col gap-2 border-l border-r border-b px-6 py-4 text-sm text-gray-700 items-center w-full '>
                  {sizeGuideImages[productData.productType] && (
                    <img src={sizeGuideImages[productData.productType]} alt={`Bảng size ${productData.productType}`} className='max-w-md w-full mb-4' />
                  )}
                  <p>Nếu bạn không chắc, hãy liên hệ shop để được tư vấn nhé</p>
                </div>
              )}
              {/* BẢO QUẢN */}
              <button
                className={`flex items-center justify-between border px-5 py-3 text-sm w-full font-bold ${tab === 'care' ? 'border-black' : 'bg-white'}`}
                onClick={() => toggleTab('care')}
              >
                <span>BẢO QUẢN</span>
                <span>{tab === 'care' ? '▲' : '▼'}</span>
              </button>
              {tab === 'care' && (
                <div className='flex flex-col gap-2 border-l border-r border-b px-6 py-4 text-sm text-gray-700 w-full '>
                  <p>Để bảo quản sản phẩm đúng cách, luôn mới và bền đẹp thì bạn nên giặt ở nhiệt độ thấp, sử dụng các chế độ vắt nhẹ nhàng sẽ có lợi hơn cho sản phẩm, giúp duy trì màu sắc, hình dạng và cấu trúc của vải.</p>
                  <p>+ Không sử dụng nước tẩy / thuốc tẩy</p>
                  <p>+ Phơi sản phẩm ở nơi thoáng mát, tránh ánh nắng trực tiếp</p>
                  <p>+ Ủi ở nhiệt độ thấp, không ủi trực tiếp lên họa tiết</p>
                  <p>+ Lộn trái sản phẩm khi giặt và phơi</p>
                </div>
              )}
              {/* CHÍNH SÁCH ĐỔI TRẢ */}
              <button
                className={`flex items-center justify-between border px-5 py-3 text-sm w-full font-bold ${tab === 'policy' ? 'border-black' : 'bg-white'}`}
                onClick={() => toggleTab('policy')}
              >
                <span>CHÍNH SÁCH ĐỔI TRẢ</span>
                <span>{tab === 'policy' ? '▲' : '▼'}</span>
              </button>
              {tab === 'policy' && (
                <div className='flex flex-col gap-2 border-l border-r border-b px-6 py-4 text-sm text-gray-700 w-full '>
                  <p>+ Vui lòng quay video khi mở gói hàng</p>
                  <p>+ Cửa hàng chỉ chấp nhận đổi hoặc trả lại áo nếu khách hàng có video</p>
                  <p>+ Giao hàng toàn quốc, hỗ trợ đổi trả trong 3 ngày</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Try-On Modal */}
      {showTryOn && (
        <TryOnModal
          productImageUrl={image}
          productName={productData.name}
          onClose={() => setShowTryOn(false)}
        />
      )}
     
      {/*sản phẫm liên quan*/}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  ) : <div className='opacity-0'></div>
}
export default Product