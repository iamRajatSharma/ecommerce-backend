const Prisma = require("../config/database")

// Create a new order
exports.createOrder = async (req, res) => {
    const { products, totalPrice } = req.body;  // Assuming 'products' is an array of product IDs with quantities

    if (!products || products.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one product' });
    }

    try {
        const userId = req.user.userId;  // Get userId from authenticated user (JWT)

        // Validate if each product exists in the database
        const productIds = products.map(product => product.id);
        const existingProducts = await Prisma.product.findMany({
            where: { id: { in: productIds } }
        });

        // If the number of existing products is less than the number of requested products, throw an error
        if (existingProducts.length !== productIds.length) {
            return res.status(400).json({ error: 'One or more products do not exist' });
        }

        // Create the order
        const order = await Prisma.order.create({
            data: {
                userId,
                totalPrice,
                status: 'PENDING',  // Set the order status to PENDING initially
                orderItems: {
                    create: products.map(product => ({
                        productId: product.id,
                        quantity: product.quantity,
                        price: product.price
                    }))
                }
            }
        });

        res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Get all orders (for admin)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Prisma.order.findMany({
            include: {
                orderItems: {
                    include: {
                        product: true  // Include product details in the response
                    }
                },
                user: true  // Include user details in the response
            }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get a specific order by ID (for users to view their own orders)
exports.getOrderById = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                },
                user: true
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Ensure that a user can only access their own orders
        if (order.userId !== req.user.userId) {
            return res.status(403).json({ error: 'You do not have permission to view this order' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update the status of an order (for admin)
exports.updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const order = await Prisma.order.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete an order (for admin or order owner)
exports.deleteOrder = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Prisma.order.findUnique({
            where: { id: parseInt(id) }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Ensure only the user who created the order or an admin can delete it
        if (order.userId !== req.user.userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'You do not have permission to delete this order' });
        }

        await Prisma.order.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
