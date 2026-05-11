const Fastify = require('fastify');
const server = Fastify({ logger: false });

// GET / - проверка работы сервера
server.get('/', async () => {
    return { message: 'Server is running' };
});

// GET /health - статус и время работы (в секундах)
server.get('/health', async () => {
    return { status: 'ok', uptime: Math.floor(process.uptime()) };
});

// GET /time - текущее время в ISO и Unix timestamp
server.get('/time', async () => {
    const now = new Date();
    return { iso: now.toISOString(), unix: now.getTime() };
});

// Запуск сервера
const start = async () => {
    try {
        await server.listen({ port: 3000 });
        console.log('Server listening at http://localhost:3000');
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

// Graceful shutdown: обработка SIGINT (Ctrl+C) и SIGTERM
const shutdown = async (signal) => {
    console.log(`\n${signal} received. Closing server...`);
    await server.close();
    console.log('Server closed.');
    process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();