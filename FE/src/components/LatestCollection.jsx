import React , {useContext, useEffect, useState}from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = () => {

    const {products} = useContext(ShopContext);
    const [LatestProducts,setLatesProducts] = useState([]);
    useEffect(()=>{
        setLatesProducts(products.slice(0,10));
    },[products])

  return (
    <div className='my-10'>
        <div className='text-center py-5 text-3xl'>
            <Title text1={'LATEST'} text2={'COLLECTIONs'}/>
            <p className='w-3/4 m-auto text-xs sm:text-sm md:txt-base text-gray-600'>
            "Redefining Style, Elevating Your Wardrobe."
            </p>
        </div>
        {/*đầu sản phẩm */}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
            {
                LatestProducts.map((item,index)=>(
                    <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price}/>
                ))
            }
        </div>
    </div>
  )
}
export default LatestCollection