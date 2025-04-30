import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { CalendarClientModule } from './calendar-client';

@Module({
  imports: [CalendarClientModule],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
