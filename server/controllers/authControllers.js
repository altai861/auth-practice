const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const login = async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.ststus(400).json({ message: 'All fields are required' })
    }

    const foundUser = await User.findOne({ username }).exec()

    if (!foundUser) {
        return res.status(401).json({ message: 'Unauthorized' })
    }
    
    const match = await bcrypt.compare(password, foundUser.password)
    const hashedPwd = await bcrypt.hash(password, 10)
    //console.log(hashedPwd, foundUser.password)
    if (!match) return res.status(401).json({ message: "Unauthorized" })

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '10s' }
    )

    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
    )

    res.cookie('jwt', refreshToken, {
        httpOnly: true, // accessible only by the browser
        secure: true,
        sameSite: 'None', // Cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000 // cookie expiry set to match refreshToken
    })
    const roles = foundUser.roles

    res.json({ accessToken, roles })
}

const register = async (req, res) => {
    const { username, email , password } = req.body

    if (!username || !password || !email) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const foundUser = await User.findOne({ username }).exec()

    if (foundUser) {
        return res.status(409).json({ message: 'Duplicate Username!' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const newUser = new User({
        username, 
        email, 
        password: passwordHash,
    })
    const savedUser = await newUser.save()
    res.status(201).json(savedUser)
}


// Access Token has expired
const refresh = async (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })

            const foundUser = await User.findOne({ username: decoded.username }).exec()
            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })
            const roles = Object.values(foundUser.roles)
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '10s' }
            )

            res.json({ roles, accessToken })
        }
    )
}

const logout = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204)// No Content
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.json({ message: 'Cookie cleared' })
}


module.exports = {
    login,
    register, 
    refresh,
    logout
}