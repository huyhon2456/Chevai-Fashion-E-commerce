import React from 'react'

const NewsSales = () => {

    const SubmitHandler = (event) =>{
        event.preventDefault();
    }

  return (
    <div className='text-center items-center'>
        <p className='text-2xl font-medium text-gray-800 '>THEO DÕI CHÚNG MÌNH</p>
        <p className='text-gray-400 mt-3'>
       Đăng kí để nhận các ưu đãi đặc biệt và các thông tin khác.
        </p>
        <form onSubmit={SubmitHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3'>
            <input className='w-full sm:flex-1 outline-none' type='email' placeholder='Email' required/>
            <button type='submit' className='bg-black text-white text-xs px-10 py-4'>ĐĂNG KÍ</button>
        </form>
    </div>
  )
}
export default NewsSales
