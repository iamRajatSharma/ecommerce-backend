const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Prisma = require("../config/database")

// Register a new user
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {

        // check if user exists or not
        const checkUserExists = await Prisma.user.findUnique({
            where: {
                email
            }
        })

        if (checkUserExists) {
            return res.status(400).json({ message: "User alread exists" })
        }

        // hashed password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        const user = await Prisma.user.create({
            data: {
                name, email, password: hashedPassword
            }
        })


        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,  // Your secret key, should be in .env file
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user.id, name: user.name, email: user.email },
            token
        });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Login a user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await Prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if password matches
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,  // Your secret key, should be in .env file
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            user: { id: user.id, name: user.name, email: user.email },
            token
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Middleware to authenticate the token
exports.authenticate = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to the request
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};
