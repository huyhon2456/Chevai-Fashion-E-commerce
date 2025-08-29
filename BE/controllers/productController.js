import { v2 as cloudinary } from 'cloudinary'
import productModel from "../models/productModel.js"
import { Client, handle_file } from "@gradio/client"
import sharp from 'sharp'

//thêm sản phẩm
const addProduct = async (req, res) => {
    try {
        const { name, description, price, productType, sizes, bestseller } = req.body

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

        console.log(name, description, price, productType, sizes, bestseller)
        console.log(imagesUrl)

        const productData = {
            name,
            description,
            productType,
            price: Number(price),
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
//thử đồ
const tryOnClothes = async (req, res) => {
    try {
        const person = req.files.people && req.files.people[0];
        const cloth = req.files.clothes && req.files.clothes[0];

        if (!person || !cloth) {
            return res.json({
                success: false,
                message: "Cần cung cấp cả ảnh người và ảnh quần áo"
            });
        }

        // Chuyển ảnh sang định dạng JPEG RGB
        const personBuffer = await toJpegRGB(person.path, 512);
        const clothBuffer = await toJpegRGB(cloth.path, 512);

        // Kết nối HuggingFace Gradio API
        const client = await Client.connect("shahza1b/CatVTON", {
            hf_token: process.env.HF_TOKEN
        });

        const result = await client.predict("/submit_function", {
            person_image: {
                background: handle_file(personBuffer, "image/jpeg"),
                layers: [],
                composite: null
            },
            cloth_image: handle_file(clothBuffer, "image/jpeg"),
            cloth_type: "upper",
            num_inference_steps: 50,
            guidance_scale: 2.5,
            seed: 42,
            show_type: "result only",
        });

        // Trả về JSON chuẩn
        res.json({
            success: true,
            message: "Try-on thành công!",
            imageUrl: result.data[0].url   // gửi link ảnh về FE
        });

    } catch (error) {
        console.error("❌ Try-on error:", error);
        res.json({
            success: false,
            message: "Có lỗi xảy ra: " + error.message
        });
    }
};

async function toJpegRGB(
    buffer,
    target = 1024,
    bg = { r: 255, g: 255, b: 255 }
) {
    const img = sharp(buffer);
    const meta = await img.metadata();

    let pipe = img.rotate(); // tự xoay theo EXIF

    if (meta.hasAlpha) {
        // Nếu có alpha channel → bỏ alpha bằng cách flatten với nền bg
        pipe = pipe.flatten({ background: bg });
    } else if (meta.channels && meta.channels < 3) {
        // Nếu ảnh grayscale (1 channel) hoặc <3 → convert sang RGB
        pipe = pipe.ensureAlpha().removeAlpha(); // ép đủ 3 channel RGB
    }

    // Resize về kích thước chuẩn (thường 512 hoặc 768 cho Catvton)
    const out = await pipe
        .resize({ width: target, height: target, fit: "inside" })
        .jpeg({ quality: 92, mozjpeg: true })
        .toBuffer();

    return out;
}
export { addProduct, listProducts, removeProduct, singleProduct, tryOnClothes, toJpegRGB }