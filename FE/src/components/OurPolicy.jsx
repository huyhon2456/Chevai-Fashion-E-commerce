import React from 'react'
import { assets } from '../assets/assets'
const OurPolicy = () => {
  return (
    <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-8 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700 mr-10 ml-10'>
      <div>
        <img src={assets.exchange_icon} className='w-12 m-auto mb-5  ' alt="" />
        <p className='font-semibold'>CHÍNH SÁCH ĐỔI TRẢ</p>
        <p className='text-gray-400'>Shop cung cấp chính sách đổi trả dễ dàng</p>
      </div>
      <div>
        <img src={assets.quality_icon} className='w-12 m-auto mb-5 ' alt="" />
        <p className='font-semibold'>TRẢ HÀNG 3 NGÀY</p>
        <p className='text-gray-400'>Đổi trả miễn phí trong 3 ngày</p>
      </div>
      <div>
        <img src={assets.support_img} className='w-12 m-auto mb-5 ' alt="" />
        <p className='font-semibold'>HỖ TRỢ NHANH CHÓNG</p>
        <p className='text-gray-400'>Shop hỗ trợ 24/7</p>
      </div>
    </div>
  )
}
export default OurPolicy