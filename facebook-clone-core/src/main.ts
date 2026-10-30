import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TimeoutInterceptor } from './interceptors/timeout/timeout.interceptor';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger';

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startRabbitMicroservice(
    app: INestApplication,
    url: string,
    queue: string,
) {
    const enabled = process.env.ENABLE_RABBITMQ !== 'false';
    if (!enabled) {
        console.warn('ENABLE_RABBITMQ=false — chạy API không kết nối RabbitMQ microservice');
        return;
    }

    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [url],
            queue,
            queueOptions: {
                durable: false,
            },
        },
    });

    const maxAttempts = 10;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await app.startAllMicroservices();
            console.log('RabbitMQ microservice connected');
            return;
        } catch (error) {
            console.warn(
                `RabbitMQ chưa sẵn sàng (${attempt}/${maxAttempts}):`,
                error instanceof Error ? error.message : error,
            );
            if (attempt === maxAttempts) {
                console.warn('Bỏ qua RabbitMQ — HTTP API vẫn chạy');
                return;
            }
            await sleep(5000);
        }
    }
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new TimeoutInterceptor());

    const configService = app.get(ConfigService);
    app.enableCors({
        origin: configService.get<string[]>('cors'),
        methods: 'GET,HEAD,PATCH,PUT,POST,DELETE',
        credentials: true,
    });

    const url = configService.get<string>('rabbitmq.url');
    const queue = configService.get<string>('rabbitmq.queue');

    if (url && queue) {
        await startRabbitMicroservice(app, url, queue);
    } else {
        console.warn('Thiếu RABBITMQ_URL / RABBITMQ_QUEUE — chỉ chạy HTTP API');
    }

    const config = new DocumentBuilder()
        .setTitle('API - Project Facebook Clone')
        .setDescription('API - Xây dựng ứng dụng Facebook Clone với NestJS')
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'JWT Authorization header using the Bearer scheme',
                in: 'header',
                name: 'Authorization',
            },
            'access_token',
        )
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    const port = configService.get<number>('port') ?? 3301;
    await app.listen(port, '0.0.0.0');
    console.log(`HTTP API listening on 0.0.0.0:${port}`);
}

bootstrap().catch((error) => {
    console.error('Bootstrap failed:', error);
    process.exit(1);
});
