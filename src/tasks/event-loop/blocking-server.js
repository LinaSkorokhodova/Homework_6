const fastify = require('fastify')({ logger: false });

// get /fast - мгновенный ответ
fastify.get('/fast', async () => {
  return { message: 'I am fast' };
});

// get /slow (чанкование)
fastify.get('/slow', async () => {
  const limit = 5_000_000_000;
  const chunkSize = 100_000_000;
  let sum = 0;
  let i = 1;

while (i <= limit) {
    // Считаем один чанк
    const end = Math.min(i + chunkSize, limit + 1);
    for (; i < end; i++) {
      sum += i;
    }
    // Отдаем управление Event Loop, чтобы обработать другие запросы
    await new Promise(resolve => setImmediate(resolve));
  }

  return { result: sum };
});

// Запуск сервера
fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('Server running on http://localhost:3000');
});