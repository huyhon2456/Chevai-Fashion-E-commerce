import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';

const Order = () => {
  const { backendUrl, token, formatCurrency } = useContext(ShopContext);
  const [orderData, setorderData] = useState([]);

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }
      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } });
      if (response.data.success) {
        let allOrdersItem = [];
        response.data.order.map((order) => {
          order.items.map((item) => {
            item['status'] = order.status;
            item['payment'] = order.payment;
            item['paymentMethod'] = order.paymentMethod;
            item['date'] = order.date;
            allOrdersItem.push(item);
          });
        });
        setorderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.error(error);
      alert('Failed to fetch orders.');
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <Title text2={'ĐƠN HÀNG CỦA TÔI'} />
      </div>
      <div>
        {orderData.map((item, index) => (
          <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div className='flex items-start gap-6 text-sm'>
              <img className='w-16 sm:w-20' src={item.image[0]} alt="" />
              <div>
                <p className='sm:text-base font-medium'>{item.name}</p>
                <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                  <p className='text-lg'>{formatCurrency(item.price)}</p>
                  <p>Số Lượng: {item.quantity}</p>
                  <p>Kích Cỡ: {item.size}</p>
                </div>
                <p className='mt-1'>Ngày: <span className='text-gray-400'>{new Date(item.date).toLocaleDateString()}</span></p>
                <p className='mt-1'>Phương Thức Thanh Toán: <span className='text-gray-400'>{item.paymentMethod}</span></p>
                <p className='mt-1'>Trạng Thái Thanh Toán: <span className='text-gray-400'>{item.payment ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}</span></p>
              </div>
            </div>
            <div className='md:w-1/2 flex justify-between'>
              <div className='flex items-center gap-2'>
                <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                <p className='text-sm md:text-base'>{item.status}</p>
              </div>
              <button onClick={loadOrderData} className='border px-4 py-2 text-sm font-medium rounded-sm'>Theo Dõi Đơn Hàng</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Order;