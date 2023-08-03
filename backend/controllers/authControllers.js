const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const login = async (req, res) => {
    
}

const signup = async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const foundUser = await User.findOne({ username }).exec()

    if (foundUser) {
        return res.status(401).json({ message: "Duplicate Username!" })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const newUser = new User({
        username, 
        password: passwordHash,
    })
    const savedUser = await newUser.save()
    res.status(201).json(savedUser)
}


const logout = async (req, res) => {

}

module.exports = {
    login, 
    signup,
    logout
}