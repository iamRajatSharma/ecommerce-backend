const Prisma = require("../config/database")

// Create a new product (Admin only)
exports.createProduct = async (req, res) => {
    const { name, description, price, stock, categoryId, imageUrl } = req.body;

    try {
        const product = await Prisma.product.create({
            data: {
                name,
                description,
                price,
                stock,
                category: categoryId,
                imageUrl
            },
        });
        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product', details: error.message });
    }
};

// Get all products with optional filters (public)
exports.getAllProducts = async (req, res) => {

    try {
        const products = await Prisma.product.findMany({});

        res.json({
            products,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products', details: error.message });
    }
};

// Get a specific product by ID (public)
exports.getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product', details: error.message });
    }
};

// Update a product (Admin only)
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, categoryId } = req.body;

    try {
        const product = await Prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                price,
                stock,
                categoryId,
            },
        });

        res.json({ message: 'Product updated successfully', product });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(500).json({ error: 'Failed to update product', details: error.message });
    }
};

// Delete a product (Admin only)
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        await Prisma.product.delete({
            where: { id: parseInt(id) },
        });

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(500).json({ error: 'Failed to delete product', details: error.message });
    }
};
