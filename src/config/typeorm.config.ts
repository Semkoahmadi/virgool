import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function TypeOrmConfig(): TypeOrmModuleOptions {
  const {DB_PORT,DB_NAME,DB_USERNAME,DB_PASSWORD,DB_HOST,} = process.env;
  return {
    type: 'postgres',
    host: DB_HOST,
    port:+DB_PORT,
    username:DB_USERNAME,
    password:DB_PASSWORD,
    database:DB_NAME,
    autoLoadEntities:false,
    synchronize:true,
    entities:[
        "dist/**/**/**/*.entity{.ts,.js}",
        "dist/**/**/*.entity{.ts,.js}"
    ]
  };
}
