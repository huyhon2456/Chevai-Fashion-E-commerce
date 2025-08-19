import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
const Login = () => {

  const [currentState, setCurrentState] = useState('Đăng nhập');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [comfirm_password, setComfirmPassord] = useState('')
  const onSubmitHandler = async (Event) => {
    Event.preventDefault();
    try {
      if (currentState === 'Đăng kí') {
        const response = await axios.post(backendUrl + '/api/user/register', { name, email, password, comfirm_password })
        if (response.data.success) {
          /*setToken(response.data.token)
          localStorage.setItem('token', response.data.token)*/
          toast.success(response.data.message)
          setCurrentState('Đăng nhập');
        } else {
          toast.error(response.data.message)
        }
      } else {
        const response = await axios.post(backendUrl + '/api/user/login', { email, password })
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
          toast.success(response.data)
        } else {
          toast.error(response.data.message)
        }
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token])
  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>{currentState}</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>
      {currentState === 'Đăng nhập' ? '' : <input onChange={(e) => setName(e.target.value)} value={name} type="text" className='w-full px-3 py-2 border border-gray-900' placeholder='Tên' required />}
      <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" className='w-full px-3 py-2 border border-gray-900' placeholder='Email' required />
      <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" className='w-full px-3 py-2 border border-gray-900' placeholder='Mật khẩu' required />
      {currentState === 'Đăng nhập' ? '' : <input onChange={(e) => setComfirmPassord(e.target.value)} value={comfirm_password} type="password" className='w-full px-3 py-2 border border-gray-900' placeholder='Nhập lại mật khẩu' required />}
      <div className='w-full flex justify-between text-sm mt-[-8px]'>
        <p className='cursor-pointer'>Quên mật khẩu</p>
        {
          currentState === 'Đăng nhập'
            ? <p onClick={() => setCurrentState('Đăng kí')} className='cursor-pointer'>Đăng kí ngay</p>
            : <p onClick={() => setCurrentState('Đăng nhập')} className='cursor-pointer'>Đăng nhập</p>
        }
      </div>
      <button className=' border border-black hover:bg-black hover:text-white transition-all duration-500 font-light px-8 py-2 mt-4'>{currentState === 'Đăng nhập' ? 'Đăng nhập' : 'Đăng kí'}</button>
    </form>
  )
}
export default Login