import { Test, TestingModule } from '@nestjs/testing';
import { getLoggerToken, PinoLogger } from 'nestjs-pino';
import { NotificationChannel } from '@app/contracts';
import { IDEMPOTENCY_STORE, IdempotencyStore } from './idempotency.store';
import { NotifierClient } from './notifier-client.service';
import { NotificationsProcessor } from './notifications.processor';

describe('NotificationsProcessor', () => {
  let processor: NotificationsProcessor;
  let idempotencyStore: jest.Mocked<IdempotencyStore>;
  let notifierClient: jest.Mocked<NotifierClient>;

  const validEvent = {
    eventId: '123e4567-e89b-42d3-a456-426614174000',
    channel: NotificationChannel.TELEGRAM,
    payload: { chatId: '12345', message: 'Hello' },
    occurredAt: '2026-05-05T12:00:00.000Z',
    version: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsProcessor,
        {
          provide: IDEMPOTENCY_STORE,
          useValue: { markIfNotSeen: jest.fn() },
        },
        {
          provide: NotifierClient,
          useValue: { send: jest.fn() },
        },
        {
          provide: getLoggerToken(NotificationsProcessor.name),
          useValue: {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
          } as Partial<PinoLogger>,
        },
      ],
    }).compile();

    processor = module.get(NotificationsProcessor);
    idempotencyStore = module.get(IDEMPOTENCY_STORE);
    notifierClient = module.get(NotifierClient);
  });

  it('processes new event and calls notifier', async () => {
    idempotencyStore.markIfNotSeen.mockResolvedValue(true);
    notifierClient.send.mockResolvedValue(undefined);

    await processor.process(validEvent);

    expect(idempotencyStore.markIfNotSeen).toHaveBeenCalledWith(
      validEvent.eventId,
    );
    expect(notifierClient.send).toHaveBeenCalledWith({
      chatId: validEvent.payload.chatId,
      message: validEvent.payload.message,
    });
  });

  it('skips already processed events (idempotency)', async () => {
    idempotencyStore.markIfNotSeen.mockResolvedValue(false);

    await processor.process(validEvent);

    expect(notifierClient.send).not.toHaveBeenCalled();
  });

  it('rejects malformed events', async () => {
    const invalid = { foo: 'bar' };

    await expect(processor.process(invalid)).rejects.toBeDefined();
    expect(idempotencyStore.markIfNotSeen).not.toHaveBeenCalled();
  });

  it('retries on notifier failure', async () => {
    idempotencyStore.markIfNotSeen.mockResolvedValue(true);
    notifierClient.send
      .mockRejectedValueOnce(new Error('notifier down'))
      .mockResolvedValue(undefined);

    await processor.process(validEvent);

    expect(notifierClient.send).toHaveBeenCalledTimes(2);
  });
});
