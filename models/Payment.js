// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['Credit Card', 'PayPal', 'Bank Transfer'],
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
