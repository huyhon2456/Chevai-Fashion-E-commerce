import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const TotalCart = () => {
    const { formatCurrency, delivery_fee, CartAmount } = useContext(ShopContext);

    const totalProductPrice = CartAmount();
    const discount = totalProductPrice >= 10000000 ?  parseFloat((totalProductPrice * 0.2).toFixed(2)) : 0;
    const finalProductPrice = totalProductPrice - discount;
    const finalDeliveryFee = totalProductPrice >= 18000000 || totalProductPrice === 0 ? 0 : delivery_fee;
    const totalToPay = finalProductPrice + finalDeliveryFee;

    return (
        <div className='w-full'>
            <div className='text-2xl'>
                <Title text1={'CART'} text2={'TOTALs'} />
            </div>
            <div className='flex flex-col gap-2 mt-2 text-sm'>
                <div className='flex justify-between'>
                    <p>Products Price</p>
                    <p>{formatCurrency(totalProductPrice)}</p>
                </div>
                <hr />
                {discount > 0 && (
                    <>
                        <div className='flex justify-between text-gray-800'>
                            <p>Discount (20%)</p>
                            <p>- {formatCurrency(discount)}</p>
                        </div>
                        <hr />
                    </>
                )}
                {totalProductPrice > 0 && (
                    <>
                        <div className='flex justify-between'>
                            <p>Shipping Fee</p>
                            <p>{finalDeliveryFee === 0 ? 'Free' : formatCurrency(finalDeliveryFee)}</p>
                        </div>
                        <hr />
                    </>
                )}
                <div className='flex justify-between text-2xl'>
                    <b>Total</b>
                    <b>{formatCurrency(totalToPay)}</b>
                </div>
            </div>
        </div>
    );
}

export default TotalCart;
