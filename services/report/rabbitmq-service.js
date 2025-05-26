const amqlib = require('amqplib')

class RabbitMQ {
    constructor() {
        this.url = process.env.RABBITMQ_URL || 'amqp://guest:guest@q-rabbitmq:5672/'
        this.connection = null
        this.channel = null
    }

    async connect() {
        if (!this.connection) this.connection = await amqlib.connect(this.url)
        if (!this.channel) this.channel = await this.connection.createChannel()

        this.channel.prefetch(1)
    }

    async send(queue, message) {
        try {
            if (this.channel) {
                this.channel.assertQueue(queue, { durable: true, queueMode: 'lazy' })
                this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message), 'utf-8'), { persistent: true })
            }
        }
        catch (error) {
            console.log(error.message)
        }
    }

    async consume(queue, callback) {
        try {
            if (this.channel) {
                this.channel.assertQueue(queue, { durable: true, queueMode: 'lazy' })
                this.channel.consume(queue, callback, { noAck: true })
            }
        }
        catch (error) {
            console.log(error.message)
        }
    }
}

class RabbitMQService {

    static async getInstance() {
        if (!RabbitMQService.instance) {
            let instance = new RabbitMQ()
            await instance.connect()
            RabbitMQService.instance = instance
        }
        return RabbitMQService.instance
    }

}

module.exports = RabbitMQService