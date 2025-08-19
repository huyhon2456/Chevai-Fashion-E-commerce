import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'
const ProductItem = ({ id, image, name, price }) => {
  const { formatCurrency } = useContext(ShopContext);
  return (
    <Link className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
      <div className='overflow-hidden relative h-64 w-full'>
        <img
          className='h-64 w-full object-cover transition duration-300 ease-in-out rounded'
          src={image[0]}
          alt=""
        />
        {image[1] && (
          <img
            className='h-64 w-full object-cover transition duration-300 ease-in-out rounded absolute top-0 left-0 opacity-0 hover:opacity-100'
            src={image[1]}
            alt=""
          />
        )}
      </div>
      <p className='pt-3 pb-1 text-sm text-left font-bold text-black '>{name}</p>
      <p className='text-base font-medium'>{formatCurrency(price)}</p>

    </Link>


  )
}
export default ProductItem