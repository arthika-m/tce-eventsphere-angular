const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');


// ======================================================
// CREATE JWT
// ======================================================

const generateToken = (user) => {

    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    );
};


// ======================================================
// STUDENT REGISTRATION
// ======================================================

const registerStudent = async (req, res) => {

    try {

        const {
            name,
            email,
            department,
            phone,
            password,
            confirmPassword
        } = req.body;


        // ----------------------------------------------
        // Required fields
        // ----------------------------------------------

        if (
            !name ||
            !email ||
            !department ||
            !phone ||
            !password ||
            !confirmPassword
        ) {

            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            });

        }


        // ----------------------------------------------
        // Email validation
        // ----------------------------------------------

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {

            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address.'
            });

        }


        // ----------------------------------------------
        // Password length
        // ----------------------------------------------

        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message:
                    'Password must contain at least 6 characters.'
            });

        }


        // ----------------------------------------------
        // Confirm password
        // ----------------------------------------------

        if (password !== confirmPassword) {

            return res.status(400).json({
                success: false,
                message: 'Passwords do not match.'
            });

        }


        // ----------------------------------------------
        // Phone validation
        // ----------------------------------------------

        const phoneRegex = /^[0-9]{10}$/;

        if (!phoneRegex.test(phone)) {

            return res.status(400).json({
                success: false,
                message:
                    'Phone number must contain exactly 10 digits.'
            });

        }


        // ----------------------------------------------
        // Check existing user
        // ----------------------------------------------

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {

            return res.status(409).json({
                success: false,
                message:
                    'An account with this email already exists.'
            });

        }


        // ----------------------------------------------
        // Hash password
        // ----------------------------------------------

        const passwordHash =
            await bcrypt.hash(password, 10);


        // ----------------------------------------------
        // Create student
        // ----------------------------------------------

        const user = await User.create({

            name: name.trim(),

            email: email.toLowerCase().trim(),

            department: department.trim(),

            phone: phone.trim(),

            role: 'student',

            passwordHash

        });


        // ----------------------------------------------
        // Generate token
        // ----------------------------------------------

        const token = generateToken(user);


        return res.status(201).json({

            success: true,

            message:
                'Student account created successfully.',

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                department: user.department,
                phone: user.phone,
                role: user.role,
                createdAt: user.createdAt
            }

        });

    } catch (error) {

        console.error(
            'Register Error:',
            error
        );

        return res.status(500).json({

            success: false,

            message:
                'Server error while creating account.'

        });

    }
};


// ======================================================
// LOGIN
// ======================================================

const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // ----------------------------------------------
        // Validate input
        // ----------------------------------------------

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    'Email and password are required.'

            });

        }


        // ----------------------------------------------
        // Find user
        // ----------------------------------------------

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    'Invalid email or password.'

            });

        }


        // ----------------------------------------------
        // Compare password
        // ----------------------------------------------

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.passwordHash
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    'Invalid email or password.'

            });

        }


        // ----------------------------------------------
        // Generate JWT
        // ----------------------------------------------

        const token =
            generateToken(user);


        // ----------------------------------------------
        // Response
        // ----------------------------------------------

        return res.status(200).json({

            success: true,

            message:
                'Login successful.',

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                department: user.department,
                phone: user.phone,
                role: user.role,
                createdAt: user.createdAt
            }

        });

    } catch (error) {

        console.error(
            'Login Error:',
            error
        );

        return res.status(500).json({

            success: false,

            message:
                'Server error during login.'

        });

    }
};


// ======================================================
// GET CURRENT USER
// ======================================================

const getMe = async (req, res) => {

    try {

        const user = await User.findById(
            req.user.id
        ).select('-passwordHash');


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    'User not found.'

            });

        }


        return res.status(200).json({

            success: true,

            user

        });

    } catch (error) {

        console.error(
            'Get Me Error:',
            error
        );

        return res.status(500).json({

            success: false,

            message:
                'Server error while fetching user.'

        });

    }
};


module.exports = {
    registerStudent,
    login,
    getMe
};