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
  const [category,setCategory] = useState([]);
  const [subCategory,setSubCategory] = useState([]);
  const [SortType,setSortType] = useState('relavent');

  const ToggleCategory = (e) => {
    if (category.includes(e.target.value)) {
        setCategory(prev=> prev.filter(item => item !== e.target.value))
    }
    else{
      setCategory(prev => [...prev, e.target.value])
    }
  }
  const ToggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev=> prev.filter(item => item !== e.target.value))
    }
    else{
    setSubCategory(prev => [...prev, e.target.value])
    }
  }
  
  // Lọc theo dữ liệu
  const ApplyFilter = () => {
    let productsCopy = products.slice();
    if (ShowSearch && Search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(Search.toLowerCase()))
    }
    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory));
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
  
  // Lọc theo danh mục và thể loại
  useEffect(()=>{
      ApplyFilter();
  },[category,subCategory,Search,ShowSearch,products])

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
          <p onClick={()=>setShowFilter(!ShowFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
            <img className={`h-3 sm:hidden ${ShowFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
          </p>
        {/* Danh mục */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${ShowFilter ? '' :'hidden'} sm:block`}>
            <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
            <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
                <p className='flex gap-2'>
                  <input type="checkbox" className='w-3' value={'Men'} onChange={ToggleCategory}/> Men
                </p>
                <p className='flex gap-2'>
                  <input type="checkbox" className='w-3' value={'Women'} onChange={ToggleCategory}/> Women
                </p>
                <p className='flex gap-2'>
                  <input type="checkbox" className='w-3' value={'Kids'} onChange={ToggleCategory}/> Kids
                </p>
            </div>
        </div>
        {/* Bộ lọc sản phẩm trong danh mục */}
        <div className={`border border-gray-300 pl-5 py-3 my-6 ${ShowFilter ? '' :'hidden'} sm:block`}>
            <p className='mb-3 text-sm font-medium'>TYPE</p>
            <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
                <p className='flex gap-2'>
                  <input type="checkbox" className='w-3' value={'Topwear'} onChange={ToggleSubCategory}/>Topwear
                </p>
                <p className='flex gap-2'>
                  <input type="checkbox" className='w-3' value={'Bottomwear'} onChange={ToggleSubCategory}/>Bottomwear
                </p>
                <p className='flex gap-2'>
                  <input type="checkbox" className='w-3' value={'Winterwear'} onChange={ToggleSubCategory}/>Winterwear
                </p>
            </div>
        </div>
        </div>
        {/* Hiển thị sản phẩm bên phải */}
        <div className='flex-1'>
          <div className='flex justify-between text-base sm:text-2xl mb-4'>
            <Title text1={'ALL'} text2={'COLLECTIONs'}/>
            {/* Danh sách giá sản phẩm theo thứ tự */}
            <select onChange={(e)=>setSortType(e.target.value)} className='border-2 border-gray-300 text-sm px-2'>
              <option value="relavent">Sort by: Relavent</option>
              <option value="low-high">Sort by: Low to High</option>
              <option value="high-low">Sort by: High to Low</option>
            </select>
          </div>
            {/* Đổ dữ liệu sản phẩm */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
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