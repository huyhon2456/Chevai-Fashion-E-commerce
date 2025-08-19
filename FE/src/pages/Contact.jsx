import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsSales from '../components/NewsSales'
const Contact = () => {
  return (
    <div >
      <div className='text-center text-2xl pt-10 border-t'>
        <Title text2={'LIÊN HỆ CHÚNG MÌNH'}/>
      </div>
      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
        <img className='w-full md:max-w-[480px]' src={assets.contact_img} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-xl text-gray-600'>Cửa Hàng Của Chúng Mình</p>
          <p className='text-gray-500'>24C TamBinh, HiepBinhChanh<br/>ThuDuc city, HoChiMinh city</p>
          <p className='text-gray-500'>Tel: (89) 901 363 148 <br/> Email: Chevai@.com</p>
          <p className='font-semibold text-xl text-gray-600'>Cơ Hội Nghề Nghiệp Tại Chevai</p>
          <p className='text-gray-500'>Tìm hiểu thêm về các đội ngũ của chúng mình và nhấp vào đây</p>
          <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>Công Việc</button>
        </div>
      </div>
      <NewsSales/>
    </div>
  )
}
export default Contact