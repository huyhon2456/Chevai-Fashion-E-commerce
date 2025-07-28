import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
    const { token } = req.headers;

    if (!token) {
        return res.json({ success: false, message: 'Login again' })
    }

    try {
        const decode = jwt.verify(token, process.env.jwt_key)
        req.body.userId = decode.id
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
export default authUser