import { v2 as cloudinary } from 'cloudinary'
import productModel from "../models/productModel.js"


//thêm sản phẩm
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const image = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            image.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' }).catch((err) => console.log('Cloudinary error:', err));
                return result.secure_url
            })
        )

        console.log(name, description, price, category, subCategory, sizes, bestseller)
        console.log(imagesUrl)

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            sizes: JSON.parse(sizes),
            bestseller: bestseller === "true" ? true : false,
            image: imagesUrl,
            date: Date.now()
        }
        console.log(productData);
        const product = new productModel(productData);
        await product.save();

        res.json({ success: true, message: " Add sucessful" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Try again plz" })

    }
}
//xóa sản phẩm
const removeProduct = async (req, res) => {

    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Removed sucessful" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Removed fail try again!!" })
    }

}
//danh sách sản phẩm
const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.json({ success: true, products })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//thông tin 1 sản phẩm
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({ success: true, product })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}
export { addProduct, listProducts, removeProduct, singleProduct }