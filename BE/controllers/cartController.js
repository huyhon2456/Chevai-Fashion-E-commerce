import userModel from "../models/userModel.js"


//add sp vào giỏ hàng người dùng
const addToCart = async (req, res) => {
    try {
        const { userId, itemId, size } = req.body;
        const userData = await userModel.findById(userId);

        if (!userData) return res.json({ success: false, message: "User not found" });
        let cartData = userData.cartData || {};

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Add to cart success" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


//update giỏ hàng người dùng
const updateCart = async (req, res) => {
    try {
        const { userId, itemId, size, quantity } = req.body
        const userData = await userModel.findById(userId)
        let cartData = userData.cartData;
        cartData[itemId][size] = quantity
        await userModel.findByIdAndUpdate(userId, { cartData })
        res.json({ success: true, message: "Update success" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}
//lấy dữ liệu giỏ hàng ng dùng
const getUserCart = async (req, res) => {
    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId)
        let cartData = userData.cartData;

        res.json({ success: true, cartData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { addToCart, updateCart, getUserCart }