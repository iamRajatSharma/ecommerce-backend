const express = require("express")
const app = express();
const dotenv = require("dotenv")
dotenv.config()
const morgan = require("morgan")

const PORT = process.env.PORT || 8080

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');


app.use(express.json());
app.use(morgan('tiny'))

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
// app.use('/api/users', userRoutes);



app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`)
})