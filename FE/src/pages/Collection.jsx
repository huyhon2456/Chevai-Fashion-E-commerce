import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import {ShopContext} from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {

  const {products,Search,ShowSearch} = useContext(ShopContext);
  const [ShowFilter,setShowFilter] = useState(false);
  const [FilterProducts,setFilterProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [SortType,setSortType] = useState('relavent');

  // Toggle loại sản phẩm
  const ToggleProductType = (e) => {
    if (productTypes.includes(e.target.value)) {
      setProductTypes(prev => prev.filter(item => item !== e.target.value))
    } else {
      setProductTypes(prev => [...prev, e.target.value])
    }
  }
  
  // Lọc theo dữ liệu
  const ApplyFilter = () => {
    let productsCopy = products.slice();
    if (ShowSearch && Search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(Search.toLowerCase()))
    }
    if (productTypes.length > 0) {
      // Lọc đúng theo productType
      productsCopy = productsCopy.filter(item => productTypes.includes(item.productType));
    }
    setFilterProducts(productsCopy)
  }

  const SortProduct = () =>{
    let dateCopy = FilterProducts.slice();
    switch (SortType){
      case 'low-high':
        setFilterProducts(dateCopy.sort((a,b)=>(a.price - b.price)));
        break;
      case 'high-low': 
        setFilterProducts(dateCopy.sort((a,b)=>(b.price - a.price)));
        break; 
      default:
        ApplyFilter();
        break;  
    }
  }
  
  // Lọc theo loại sản phẩm
  useEffect(()=>{
      ApplyFilter();
  },[productTypes,Search,ShowSearch,products])

  // Lọc theo giá
  useEffect(()=>{
    SortProduct();
  },[SortType])

  // Khởi tạo FilterProducts khi component mount
  useEffect(()=>{
    setFilterProducts(products);
  },[products])
 
  
  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>

        {/* Bộ lọc giao diện */}
        <div className='min-w-60'> 
          <p onClick={()=>setShowFilter(!ShowFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>BỘ LỌC
            <img className={`h-3 sm:hidden ${ShowFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
          </p>
        {/* Bộ lọc loại sản phẩm */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${ShowFilter ? '' :'hidden'} sm:block`}>
            <p className='mb-3 text-sm font-medium'>LOẠI SẢN PHẨM</p>
            <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
                <p className='flex gap-2'>
                  <input type="checkbox" className='w-3' value={'T-shirt'} onChange={ToggleProductType}/> T-shirt
                </p>
                <p className='flex gap-2'>
                  <input type="checkbox" className='w-3' value={'RelaxedFit'} onChange={ToggleProductType}/> Áo Thun Relaxed Fit
                </p>
                <p className='flex gap-2'>
                  <input type="checkbox" className='w-3' value={'Ringer'} onChange={ToggleProductType}/> Áo Thun Ringer
                </p>
                <p className='flex gap-2'>
                  <input type="checkbox" className='w-3' value={'Hoodie'} onChange={ToggleProductType}/> Áo Hoodie
                </p>
                <p className='flex gap-2'>
                  <input type="checkbox" className='w-3' value={'Sweater'} onChange={ToggleProductType}/> Áo Sweater
                </p>
                <p className='flex gap-2'>
                  <input type="checkbox" className='w-3' value={'Jogger'} onChange={ToggleProductType}/> Quần Jogger & Ống Suông
                </p>
            </div>
        </div>
        </div>
        {/* Hiển thị sản phẩm bên phải */}
        <div className='flex-1'>
          <div className='flex justify-between text-base sm:text-2xl mb-4'>
            <Title text2={'TẤT CẢ SẢN PHẨM'}/>
            {/* Danh sách giá sản phẩm theo thứ tự */}
            <select onChange={(e)=>setSortType(e.target.value)} className='border-2 border-gray-300 text-sm px-2'>
              <option value="relavent">Sort by: Gần đây</option>
              <option value="low-high">Sort by: Thấp đến Cao</option>
              <option value="high-low">Sort by: Cao đến Thấp</option>
            </select>
          </div>
            {/* Đổ dữ liệu sản phẩm */}
            <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 gap-y-6'>
                {
                  FilterProducts.map((item,index)=>(
                    <ProductItem key={index} name={item.name} id={item._id} price={item.price} image={item.image}/>
                  ))
                }
            </div>
        </div>
    </div>
  )
}
export default Collection