const express = require('express');
const mongoose = require('mongoose');
const { producer, initKafka, consumer } = require('./kafka');
const Order = require('./models/order');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/orders', { useNewUrlParser: true, useUnifiedTopology: true});

app.post('/orders', async (req,res) => {
    const { productId, quantity } = req.body;
    const order = new Order({ productId, quantity});
    await order.save();
    await producer.send({
        topic: 'order-created',
        messages: [{value: JSON.stringify(order)}]
    });
    res.status(201).send(order);
});

consumer.subscribe({topic: 'payment-failed'});
consumer.run({
    eachMessage: async ({message}) => {
        const { orderId } = JSON.parse(message.value.toString());
        await Order.findByIdAndDelete(orderId);
        console.log('Order ${orderId} rolled back due to payment failure');
    }
});

const start = async () => {
    await initKafka();
    app.listen(3000, ()=> console.log('Order service listening on port 3000'));
};

start();