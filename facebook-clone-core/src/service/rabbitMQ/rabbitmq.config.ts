import { ConfigService } from '@nestjs/config';
import { RmqOptions } from '@nestjs/microservices/interfaces';
import { Transport } from '@nestjs/microservices';

export const rabbitMqConfig = (configService: ConfigService): RmqOptions => {
    const url = configService.get<string>('rabbitmq.url');
    const queue = configService.get<string>('rabbitmq.queue');

    if (!url || !queue) {
        console.warn('RabbitMQ configuration is missing — dùng giá trị mặc định Docker');
    }

    return {
        transport: Transport.RMQ,
        options: {
            urls: [url || 'amqp://rabbituser:rabbitpassword@rabbitmq:5672'],
            queue: queue || 'myqueue',
            noAck: true,
            queueOptions: {
                durable: false,
            }
        },
    };
};  