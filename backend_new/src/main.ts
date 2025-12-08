import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { readFileSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);

  const httpsOptions = getHttpsOptions();
  
  const app = httpsOptions
    ? await NestFactory.create(AppModule, { httpsOptions })
    : await NestFactory.create(AppModule);

  // Security Headers
  app.use(helmet.default());

  // CORS Configuration
  app.enableCors();
  // app.enableCors({
  //   origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  //   credentials: true,
  // });

  // Force HTTPS in production (when behind a reverse proxy)
  if (process.env.NODE_ENV === 'production' && process.env.FORCE_HTTPS === 'true') {
    app.use((req, res, next) => {
      // Check if request is already HTTPS
      if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        next();
      } else {
        // Redirect to HTTPS
        res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
    });
  }
 
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('AgriFlock360 API')
    .setDescription(
      'Backend API for AgriFlock360 - Poultry Farm Management System',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`🌐 API Base URL: http://localhost:${port}/api/v1`);
  console.log(
    `📚 API Documentation available at: http://localhost:${port}/api-docs`,
  );
}

/**
 * Load HTTPS certificates if available
 */
function getHttpsOptions() {
  const useHttps = process.env.USE_HTTPS === 'true';
  
  if (!useHttps) {
    return null;
  }

  try {
    const keyPath = process.env.SSL_KEY_PATH || join(__dirname, '../certs/key.pem');
    const certPath = process.env.SSL_CERT_PATH || join(__dirname, '../certs/cert.pem');
    
    return {
      key: readFileSync(keyPath),
      cert: readFileSync(certPath),
    };
  } catch (error) {
    console.error('❌ Failed to load HTTPS certificates:', error.message);
    console.error('   Falling back to HTTP. Set USE_HTTPS=false to suppress this warning.');
    return null;
  }
}


bootstrap();
