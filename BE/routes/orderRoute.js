import express from 'express'
import { placeOrder, placeOrderMomo, placeOrderVnpay, allOrders, userOrders, updateStatus, verifyVNPayPayment } from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

//route của admin
orderRouter.post('/list',adminAuth,allOrders)
orderRouter.post('/status',adminAuth,updateStatus)

//phương thức thanh toán
orderRouter.post('/place',authUser,placeOrder)
orderRouter.post('/momo',authUser,placeOrderMomo)
orderRouter.post('/vnpay',authUser,placeOrderVnpay)

//xác minh thanh toán VNPay
orderRouter.get('/vnpay-return', verifyVNPayPayment)

//route user
orderRouter.post('/userorders',authUser,userOrders)

export default orderRouter