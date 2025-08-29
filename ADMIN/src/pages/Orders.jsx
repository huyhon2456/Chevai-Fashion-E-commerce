import React, { useEffect, useState } from 'react';
import axios from 'axios'
import { backend_Url, formatCurrency } from '../App'
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';



const Orders = ({token}) => {

  const [orders, setOrders] = useState([])
  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }
    try {
      const response = await axios.post(backend_Url + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }
  const statusHandler = async (event,orderId) =>{
    try {
      const response = await axios.post(backend_Url + '/api/order/status', {orderId,status:event.target.value},{headers:{token}})
      if (response.data.success) {
        await fetchAllOrders()
      }
    } catch (error) {
      console.log(error)
      toast.error(response.data.message)
    }
  }
  useEffect(() => {
    fetchAllOrders()
  }, [token])

  return (
    <div>
      <p className='mb-2 text-2xl font-bold'>ĐƠN HÀNG</p>
      <div>
        {
          orders.map((order, index) => (
            <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-300 p-5 md:p-8 my-3 md:my_4 text-xs sm:text-sm text-gray-700' key={index}>
              <img className='w-15' src={assets.parcel_icon} alt="" />
              <div>
                <div>
                  <p className='mt-3 mb-2 font-bold'>Đơn hàng của: {order.address.firstName + " " + order.address.lastName}</p>
                  {order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return <p className='py-0.5' key={index}>{item.name} x {item.quantity} <span>{item.size}</span></p>
                    } else {
                      return <p className='py-0.5' key={index}>{item.name} x {item.quantity} <span>{item.size}</span>,</p>
                    }
                  })}
                </div>
                <div>
                  <p>Địa chỉ: {order.address.homeNumber + ", " + order.address.stress + ", " + order.address.ward + ", " + order.address.district + ", " + order.address.city}</p>
                </div>
                <p>Điện thoại: {order.address.phoneNumber}</p>
              </div>
              <div>
                <p className='text-sm sm:text-[15px]'>Số lượng: {order.items.length}</p>
                <p className='mt-3'>Phương thức: {order.paymentMethod}</p>
                {/* {<p>Thanh toán: {order.payment ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>} */}
                <p>Trạng thái: {order.payment ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
                <p>Ngày: {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <p className='text-sm sm:text-[15px]'>{formatCurrency(order.amount)}</p>
              <select onChange={(event)=>statusHandler(event,order._id)} value={order.status} className='p-2 font-semibold' >
                <option value="Đơn đã đặt">Đơn đã đặt</option>
                <option value="Đang đóng gói">Đang đóng gói</option>
                <option value="Đang vận chuyển">Đang vận chuyển</option>
                <option value="Đang giao hàng">Đang giao hàng</option>
                <option value="Đã giao">Đã giao</option>
              </select>
            </div>
          ))
        }
      </div>
    </div>
  )
}
export default Orders