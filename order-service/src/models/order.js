const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    productId: String,
    quantity: Number,
    status: {type: String, default: 'PENDING'}
});

const Order = new mongoose.model('Order',orderSchema);
module.exports = Order;