const jwt = require('../service/jwtService')
const customer = require('../models/customer')
const admins = require('../models/admins')
const { checkAdmins } = require('../service/authenticationService')


const getAll = async (req, res) => {
    try {
        const customers = await customer.find()
        res.json(customers)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server Error' })
    }
}
const signUp = async (req, res) => {
    try {
        const { address, bank, birthday, cart, email, gender, name, order, password, phone } = req.body

        const existingEmail = await customer.readByEmail(email)
        const existingPhone = await customer.readByPhone(phone)

        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' })
        } else if (existingPhone) {
            return res.status(400).json({ message: 'Phone numbers already exists' })
        } else {
            const newCustommers = await customer.create(req.body)
            res.status(201).json(newCustommers)
        }
    }
    catch (error) {
        console.error('Error creating user:', error)
        res.status(500).json({ message: 'Server Error' })
    }
}
const logIn = async (req, res) => {
    try {
        const { username, email, phone, password } = req.body

        let existingCustomer, existingAdmin, isAdmin

        if (email) {
            existingCustomer = await customer.readByEmail(email)
        } else if (phone) {
            existingCustomer = await customer.readByPhone(phone)
        } else {
            existingAdmin = await admins.readByUsername(username)
        }
        if (!existingCustomer && !existingAdmin) {
            return res.status(400).json({ message: 'Username or password is incorrect' })
        } else {
            if (existingCustomer) {
                if (existingCustomer.password !== password) {
                    return res.status(400).json({ message: 'Password is incorrect' })
                } else {
                    isAdmin = await checkAdmins(existingCustomer._id)
                    const accessToken = await jwt.gennerateAccessToken({ id: existingCustomer._id, isAdmin })
                    const refreshToken = await jwt.gennerateRefreshToken({ id: existingCustomer._id, isAdmin })

                    res.cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'strict',
                        path: '/',
                    })
                    res.json({ message: 'Login successful',existingCustomer, customerId: existingCustomer._id, accessToken, refreshToken })
                }
            } else if (existingAdmin) {
                if (existingAdmin.password !== password) {
                    return res.status(400).json({ message: 'Password is incorrect' })
                } else {
                    isAdmin = await checkAdmins(existingAdmin._id)
                    const accessToken = await jwt.gennerateAccessToken({ id: existingAdmin._id, isAdmin })
                    const refreshToken = await jwt.gennerateRefreshToken({ id: existingAdmin._id, isAdmin })

                    res.cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'strict',
                        path: '/',
                    })
                    res.json({ message: 'Login successful',existingAdmin, customerId: existingAdmin._id, accessToken, refreshToken })
                }
            }
        }
    } catch (error) {
        console.error('Error logging in:', error)
        res.status(500).json({ message: 'Server Error' })
    }
}
const logOut = async (req, res) => {
    try {
        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Log out successfully' })
    } catch (error) {
        console.error('Error logging out:', error)
        res.status(500).json({ message: 'Server Error' })
    }
}
const updateCustomer = async (req, res) => {
    const customerID = req.params.id
    const updateField = req.body
    try {
        const existingCustomer = await customer.readById(customerID)
        if (!existingCustomer) {
            return res.status(400).json({ message: 'Customer not found' })
        }
        else {
            const checkPhone = await customer.readByPhone(updateField.phone)
            const checkEmail = await customer.readByEmail(updateField.email)
            if (checkPhone || checkEmail) {
                return res.status(200).json({ message: 'Phone numbers or email already exists ' })
            } else {
                await customer.findByIdAndUpdate(customerID, updateField)
                const updatedCustomer = await customer.readById(customerID)
                res.json({ message: 'updated successfully', customerid: customerID, updatedCustomer })
            }
        }
    } catch (error) {
        console.error('Error updating customer:', error)
        res.status(500).json({ message: 'Server Error' })
    }
}
const deleteCustomer = async (req, res) => {
    try {
        const customerId = req.params.id
        const existingCustomer = customer.readById(customerId)
        if (!existingCustomer) {
            res.status(404).json({ message: 'Customer not found' })
        } else {
            await customer.delete(customerId)
            res.status(200).json({ message: 'Delete customer successfully' })
        }
    } catch (error) {
        console.error('Error deleting customer:', error)
        res.status(500).json({ message: 'Server Error' })
    }
}
const getCustomerDetails = async (req, res) => {
    try {
        const customerId = req.params.id
        const details = await customer.readById(customerId)
        res.status(200).json(details)
    } catch (error) {
        console.error('Error getting details:', error)
        res.status(500).json({ message: 'Server Error' })
    }
}
const getCustomerCart = async (req, res) => {
    try {
        const customerId = req.params.id
        const customerCart = await customer.readById(customerId)
        res.json(customerCart.cart)
    } catch (error) {
        console.error('Error getting cart:', error)
        res.status(500).json({ message: 'Server Error' })
    }
}
const getCustomerOrder = async (req, res) => {
    try {
        const customerId = req.params.id
        const customerOrder = await customer.readById(customerId)
        res.json(customerOrder.order)
    } catch (error) {
        console.error('Error getting cart:', error)
        res.status(500).json({ message: 'Server Error' })
    }
}
const refreshToken = async (req, res) => {
    try {
        let token = req.headers.token.split(' ')[0]
        if (!token) {
            res.status(200).json({ message: 'The token is required' })
        } else {
            const refreshing = await refreshToken(token)
            res.status(200).json(refreshing)
        }
    } catch (error) {
        console.error('Error refreshing token:', error)
        res.status(500).json({ message: 'Server Error' })
    }
}
module.exports = {
    getAll,
    signUp,
    logIn,
    logOut,
    updateCustomer,
    deleteCustomer,
    getCustomerDetails,
    getCustomerCart,
    getCustomerOrder,
    refreshToken
}