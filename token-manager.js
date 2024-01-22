require('dotenv').config()
const jwt = require('jsonwebtoken')

function generateAccessToken(userId){
    return jwt.sign(userId, process.env.TOKEN_SECRET, {})
}

function authenicateToken(req, res, next){
    const token = req.get('Authorization')

    if(token === null) {
        return res.status(401)

    }
    jwt.verify(token, process.env.TOKEN_SECRET, (error, user) => {
        if(error){
            return res.sendStatus(405)
        }
        req.user = user
        next()
    })

}

module.exports = {
    generateAccessToken,
    authenicateToken
}

