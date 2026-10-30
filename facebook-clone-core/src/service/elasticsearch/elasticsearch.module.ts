import { Module } from '@nestjs/common';
import { ElasticsearchModule, ElasticsearchModuleOptions } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule, // Đảm bảo module config được import
        ElasticsearchModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService): ElasticsearchModuleOptions => {
                const node = configService.get<string>('elasticsearch.node');
                if (!node) {
                    console.warn(
                        'elasticsearch.node chưa cấu hình — dùng http://elasticsearch:9200',
                    );
                }
                console.log(`🔧 Connecting to Elasticsearch node: ${node}`, 'ElasticsearchModule');

                return {
                    node: node || 'http://elasticsearch:9200',
                    requestTimeout: 5000,  // ✅ 5s timeout
                    pingTimeout: 5000,      // ✅ 5s ping
                    maxRetries: 2,          // ✅ ít retry hơn
                    sniffOnStart: false,    // ✅ không sniff để tránh chậm
                };
            },
        }),
    ],
    exports: [ElasticsearchModule],
})
export class CustomElasticsearchModule {}