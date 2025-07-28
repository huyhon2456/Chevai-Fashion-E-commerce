import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div>
        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'> 
            <div>
                <img src={assets.logo} className='mb-5 w-32' alt="" />
                <p className='w-full md:w-2/3 text-gray-600'>
                Elevate your style with refined designs and premium fabrics.
                </p>
                <p className='w-full md:w-2/3 text-gray-600'>
                More than just clothing, it’s a statement of your personality.
                </p>
                <p className='w-full md:w-2/3 text-gray-600'>
                Redefining fashion: Modern, elegant, and always ahead of the trend.
                </p>
                <p className='w-full md:w-2/3 text-gray-600'>
                Turning every outfit into a bold expression of your individuality.
                </p>

            </div>
            <div>
                <p className='text-xl font-medium mb-5'>Chevai</p>
                <ul className='flex flex-col gap-1 text-gray-600'>
                    <li>Home</li>
                    <li>About us</li>
                    <li>Delivery</li>
                    <li>Privacy policy</li>
                </ul>
            </div>
            <div>
                <p className='text-xl font-medium mb-5'>GET STARTED</p>
                <ul className='flex flex-col gap-1 text-gray-600'>
                    <li>+89 01 363 148</li>
                    <li>Chevai@.com</li>
                </ul>
            </div>
        </div>
            <div>
                <hr />
                <p className='py-5 text-sm text-center'>Copyright 2025@ Chevai.com - All Right Reserved. </p>
            </div>
    </div>
  )
}
export default Footer
