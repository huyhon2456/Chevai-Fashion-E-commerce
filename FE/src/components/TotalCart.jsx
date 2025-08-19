import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const TotalCart = () => {
    const { formatCurrency, getDeliveryFee, CartAmount } = useContext(ShopContext);

    const totalProductPrice = CartAmount();
    const discount = totalProductPrice >= 1000000 ?  parseFloat((totalProductPrice * 0.2).toFixed(2)) : 0;
    const finalProductPrice = totalProductPrice - discount;
    const finalDeliveryFee = getDeliveryFee(totalProductPrice);
    const totalToPay = finalProductPrice + finalDeliveryFee;

    return (
        <div className='w-full'>
            <div className='text-2xl'>
                <Title text2={'TỔNG ĐƠN HÀNG'} />
            </div>
            <div className='flex flex-col gap-2 mt-2 text-sm'>
                <div className='flex justify-between'>
                    <p>Giá sản phẩm</p>
                    <p>{formatCurrency(totalProductPrice)}</p>
                </div>
                <hr />
                {discount > 0 && (
                    <>
                        <div className='flex justify-between text-gray-800'>
                            <p>Giá giảm (20%)</p>
                            <p>- {formatCurrency(discount)}</p>
                        </div>
                        <hr />
                    </>
                )}
                {totalProductPrice > 0 && (
                    <>
                        <div className='flex justify-between'>
                            <p>Phí vận chuyển</p>
                            <p>{finalDeliveryFee === 0 ? 'Miễn phí' : formatCurrency(finalDeliveryFee)}</p>
                        </div>
                        <hr />
                    </>
                )}
                <div className='flex justify-between text-2xl'>
                    <b>Tổng cộng</b>
                    <b>{formatCurrency(totalToPay)}</b>
                </div>
            </div>
        </div>
    );
}

export default TotalCart;
