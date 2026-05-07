import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { RmqService } from '@app/rmq';
import { AppModule } from './../src/app.module';

describe('Producer (e2e)', () => {
  let app: INestApplication<App>;
  let rmqService: jest.Mocked<RmqService>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RmqService)
      .useValue({ publish: jest.fn().mockResolvedValue(undefined) })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    rmqService = app.get(RmqService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /notifications - accepts valid request', async () => {
    const response = await request(app.getHttpServer())
      .post('/notifications')
      .send({
        channel: 'telegram',
        payload: { chatId: '12345', message: 'Test' },
      })
      .expect(202);

    expect(response.body.eventId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(rmqService.publish).toHaveBeenCalled();
  });

  it('POST /notifications - rejects invalid channel', () => {
    return request(app.getHttpServer())
      .post('/notifications')
      .send({
        channel: 'invalid',
        payload: { chatId: '12345', message: 'Test' },
      })
      .expect(400);
  });

  it('POST /notifications - rejects extra fields', () => {
    return request(app.getHttpServer())
      .post('/notifications')
      .send({
        channel: 'telegram',
        payload: { chatId: '12345', message: 'Test' },
        hackerField: 'evil',
      })
      .expect(400);
  });

  it('POST /notifications - rejects missing payload', () => {
    return request(app.getHttpServer())
      .post('/notifications')
      .send({ channel: 'telegram' })
      .expect(400);
  });
});
