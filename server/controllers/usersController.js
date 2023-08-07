const User = require('../models/User')
const bcrypt = require('bcryptjs')


const getAllUsers = async (req, res) => {
    const users = await User.find().select('-password').lean();
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }
    res.json(users);
}

const createNewUser = async (req, res) => {
    const { username, password, roles } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec();
    if (duplicate) {
        return res.status(409).json({ message: "Duplicate username" })
    }

    const hashedPwd = await bcrypt.hash(password, 10)

    const userObject = (!Array.isArray(roles) || !roles.length)
        ? { username, "password": hashedPwd }
        : { username, "password": hashedPwd, roles }

    const user = await User.create(userObject)

    if (user) {
        res.status(201).json({ message: `New User ${username} created` })
    } else {
        res.status(400).json({ message: 'Invalid user data received.' })
    }
}   


const updateUser = async (req, res) => {
    const { id, username, roles, password } = req.body

    if (!id || !username || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate && duplicate?._id.toString() !== id) {
        res.status(409).json({ message: 'Duplicate username' })
    }

    user.username = username
    user.roles = roles
    
    if (password) {
        user.password = await bcrypt.hash(password, 10)

    }
    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated` })
}


const deleteUser = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'User ID required' })
    }

    const user = await User.findById(id).exec()
    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    const result = await user.deleteOne()
    const reply = `Username ${result.username} with Id ${result._id} deleted`
    res.json(reply);

}

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}