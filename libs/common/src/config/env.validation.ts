import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // RabbitMQ
  RABBITMQ_URL: Joi.string()
    .uri({ scheme: ['amqp', 'amqps'] })
    .optional(),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),
  REDIS_DB: Joi.number().integer().min(0).max(15).default(0),

  // Service ports — каждый сервис использует свою
  PRODUCER_PORT: Joi.number().port().default(3000),
  CONSUMER_PORT: Joi.number().port().default(3001),
  NOTIFIER_PORT: Joi.number().port().default(3002),

  // Telegram (понадобится в Notifier)
  TELEGRAM_BOT_TOKEN: Joi.string().optional(),
  TELEGRAM_CHAT_ID: Joi.string().optional(),

  // Notifier URL для Consumer
  NOTIFIER_URL: Joi.string().uri().default('http://localhost:3002'),
});
