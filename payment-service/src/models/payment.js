const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: String,
    status : {type: String, default: 'PENDING'}
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;