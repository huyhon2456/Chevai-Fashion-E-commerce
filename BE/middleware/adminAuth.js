import jwt from 'jsonwebtoken';

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers
        if (!token) {
            return res.json({ success: false, message: "Login again!!" })
        }
        const decoded = jwt.verify(token, process.env.jwt_key);
        if (decoded !== process.env.admin_email + process.env.admin_password) {
            return res.json({ success: false, message: "Login again!!" })
        }
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
export default adminAuth