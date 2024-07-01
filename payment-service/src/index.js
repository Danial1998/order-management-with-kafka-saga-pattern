const express = require('express');
const mongoose = require('mongoose');
const { producer, consumer, initKafka } = require('./kafka');
const Payment = require('./models/payment');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/payments', { useNewUrlParser: true, useUnifiedTopology: true });


//process payment
const processPayment = async (order) => {
    const payment = new Payment({ orderId: order._id });
    await payment.save();
    try {
        //failure simulation
        if(Math.random() > 0.5) throw new Error('Payment processing failed');
        payment.status = 'COMPLETED';
        await payment.save();
        await producer.send({
            topic: 'payment-completed',
            messages: [{ value: JSON.stringify(payment) }]
        });
    } catch (err) {
        payment.status = 'FAILED';
        await payment.save();
        await producer.send({
            topic: 'payment-failed',
            messages: [{value: JSON.stringify({orderId: order._id})}]
        });
    }

};

// consume message from order-service
consumer.subscribe({ topic: 'order-created', fromBeginning: true });
consumer.run({
    eachMessage: async ({ message }) => {
        const order = JSON.parse(message.value.toString());
        // console.log(order);
        await processPayment(order);
    }
});

const start = async () => {
    await initKafka();
    app.listen(3001, () => console.log('Payment service listening on port 30001'));
};

start();