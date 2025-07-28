import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsSales from '../components/NewsSales'
const About = () => {
  return (
    
    <div >
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'}/>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
            <p>At Chevai, we believe that fashion is more than just clothing – it’s a statement of confidence and individuality. Our mission is to bring you high-quality, stylish, and affordable fashion that fits your lifestyle. With a commitment to craftsmanship and sustainability, we ensure that every piece is designed to make you look and feel your best. Explore our latest collections and redefine your style with us!</p>
            <p>Founded with a passion for fashion, Chevai started as a dream to create clothing that blends elegance, comfort, and self-expression. From humble beginnings, we have grown into a trusted brand that values quality, innovation, and customer satisfaction. Every design we create is inspired by the latest trends and crafted with care. Join us on this journey and embrace a style that truly represents you!</p>
            <b className='text-gray-800'>Our Mission</b>
            <p>Our mission is to empower individuals through fashion by providing high-quality, stylish, and sustainable clothing. We strive to create designs that not only follow trends but also embrace comfort, confidence, and self-expression. At Chevai, we believe that everyone deserves to look and feel their best, no matter the occasion.</p>
        </div>
      </div>
      <div className='text-4xl py-4'>
        <Title text1={'WHY CHOOSE'} text2={'US'}/>
      </div>
      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Quality Assurance</b>
          <p className='text-gray-600'>At Chevai, quality is our top priority. We carefully select premium fabrics and work with skilled artisans to ensure every piece meets the highest standards. From design to production, our rigorous quality control process guarantees durability, comfort, and style. We are committed to delivering fashion that not only looks good but also lasts.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Convenience</b>
          <p className='text-gray-600'>At Chevai, we prioritize your shopping convenience. Our user-friendly website, seamless checkout process, and multiple payment options ensure a hassle-free experience. With fast shipping and easy returns, we make sure that fashion is just a click away.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Exceptional Cutomer Service</b>
          <p className='text-gray-600'>At Chevai, customer satisfaction is our top priority. Our dedicated support team is always ready to assist you with any inquiries, ensuring a seamless shopping experience. From personalized recommendations to hassle-free returns, we go the extra mile to make sure you feel valued and cared for.</p>
        </div>
      </div>
      <NewsSales/>
    </div>
  )
}
export default About