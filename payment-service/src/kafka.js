const {Kafka} = require('kafkajs');

const kafka = new Kafka({
    clientId: 'payment-service',
    brokers: ['localhost:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({groupId: 'payment-group'});

const initKafka = async () => {
    await producer.connect();
    await consumer.connect();
};

module.exports = { producer, consumer, initKafka };