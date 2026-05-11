const Fastify = require('fastify');
const server = Fastify({ logger: false });

// Данные в памяти
let categories = [];
let products = [];
let users = [];
let nextId = { categories: 1, products: 1, users: 1 };

// Категории

// Схемы валидации
const categorySchema = {
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 50 },
      description: { type: 'string', maxLength: 300 }
    }
  }
};

// GET /api/categories - все категории
server.get('/api/categories', async () => categories);

// GET /api/categories/:id - одна категория
server.get('/api/categories/:id', async (req, reply) => {  // reply в параметры
  const cat = categories.find(c => c.id === +req.params.id);
  if (!cat) { reply.code(404).send({ error: 'Category not found' }); return; } 
  return cat;
});

// POST /api/categories - создать
server.post('/api/categories', { schema: categorySchema }, async (req) => {
  const { name, description } = req.body;
  const newCat = { id: nextId.categories++, name, description: description || '' };
  categories.push(newCat);
  return newCat;
});

// PUT /api/categories/:id - обновить
server.put('/api/categories/:id', { schema: categorySchema }, async (req, reply) => {  
  const cat = categories.find(c => c.id === +req.params.id);
  if (!cat) { reply.code(404).send({ error: 'Category not found' }); return; }  
  const { name, description } = req.body;
  if (name) cat.name = name;
  if (description !== undefined) cat.description = description;
  return cat;
});

// DELETE /api/categories/:id - удалить (с проверкой на товары)
server.delete('/api/categories/:id', async (req, reply) => {  
  const id = +req.params.id;
  const hasProducts = products.some(p => p.categoryId === id);
  if (hasProducts) { reply.code(400).send({ error: 'Category has products' }); return; }  
  
  const idx = categories.findIndex(c => c.id === id);
  if (idx === -1) { reply.code(404).send({ error: 'Category not found' }); return; } 
  
  categories.splice(idx, 1);
  return { message: 'Category deleted' };
});

// Товары

const productSchema = {
  body: {
    type: 'object',
    required: ['name', 'price', 'categoryId'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 200 },
      price: { type: 'number', minimum: 0.01 },
      categoryId: { type: 'integer', minimum: 1 },
      inStock: { type: 'boolean' }
    }
  }
};

// GET /api/products - все товары с фильтрацией
server.get('/api/products', async (req) => {
  let result = [...products];
  if (req.query.categoryId) {
    result = result.filter(p => p.categoryId === +req.query.categoryId);
  }
  if (req.query.inStock !== undefined) {
    const inStock = req.query.inStock === 'true';
    result = result.filter(p => p.inStock === inStock);
  }
  return result;
});

// GET /api/products/:id - один товар
server.get('/api/products/:id', async (req, reply) => {  
  const prod = products.find(p => p.id === +req.params.id);
  if (!prod) { reply.code(404).send({ error: 'Product not found' }); return; }  
  return prod;
});

// POST /api/products - создать
server.post('/api/products', { schema: productSchema }, async (req, reply) => {
  const { name, price, categoryId, inStock = true } = req.body;
  
  const catExists = categories.some(c => c.id === categoryId);
  if (!catExists) {
    reply.code(400).send({ error: 'Category not found' });
    return;
  }
  
  const newProd = {
    id: nextId.products++,
    name,
    price,
    categoryId,
    inStock,
    createdAt: new Date().toISOString()
  };
  products.push(newProd);
  return newProd;
});

// PUT /api/products/:id - обновить
server.put('/api/products/:id', { schema: productSchema }, async (req, reply) => {  
  const prod = products.find(p => p.id === +req.params.id);
  if (!prod) { reply.code(404).send({ error: 'Product not found' }); return; }
  
  const { name, price, categoryId, inStock } = req.body;
  
  if (categoryId !== undefined) {
    const catExists = categories.some(c => c.id === categoryId);
    if (!catExists) { reply.code(400).send({ error: 'Category not found' }); return; }
    prod.categoryId = categoryId;
  }
  if (name) prod.name = name;
  if (price !== undefined) prod.price = price;
  if (inStock !== undefined) prod.inStock = inStock;
  return prod;
});

server.delete('/api/products/:id', async (req, reply) => {
  const id = +req.params.id;
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) { reply.code(404).send({ error: 'Product not found' }); return; }
  
  products.splice(idx, 1);
  return { message: 'Product deleted' };
});

// Пользователи

const userSchema = {
  body: {
    type: 'object',
    required: ['name', 'email'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      email: { type: 'string', format: 'email' },
      role: { type: 'string', enum: ['customer', 'admin'] }
    }
  }
};

// GET /api/users - все пользователи с фильтрацией
server.get('/api/users', async (req) => {
  let result = [...users];
  if (req.query.role) {
    result = result.filter(u => u.role === req.query.role);
  }
  return result;
});

// GET /api/users/:id - один пользователь
server.get('/api/users/:id', async (req, reply) => {
  const user = users.find(u => u.id === +req.params.id);
  if (!user) { reply.code(404).send({ error: 'User not found' }); return; }
  return user;
});

// POST /api/users - создать
server.post('/api/users', { schema: userSchema }, async (req, reply) => {
  const { name, email, role = 'customer' } = req.body;
  
  const emailExists = users.some(u => u.email === email);
  if (emailExists) {
    reply.code(409).send({ error: 'Email already exists' });
    return;
  }
  
  const newUser = {
    id: nextId.users++,
    name,
    email,
    role,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  return newUser;
});

// PUT /api/users/:id - обновить
server.put('/api/users/:id', { schema: userSchema }, async (req, reply) => {
  const user = users.find(u => u.id === +req.params.id);
  if (!user) { reply.code(404).send({ error: 'User not found' }); return; }
  
  const { name, email, role } = req.body;
  
  if (email && email !== user.email) {
      const emailExists = users.some(u => u.email === email);
      // Проверка и возврат ошибки
      if (emailExists) { reply.code(409).send({ error: 'Email already exists' }); return; }
      user.email = email;
  }
  if (name) user.name = name;
  if (role) user.role = role;
  return user;
});

// DELETE /api/users/:id - удалить
server.delete('/api/users/:id', async (req, reply) => {
  const id = +req.params.id;
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) { reply.code(404).send({ error: 'User not found' }); return; }
  
  users.splice(idx, 1);
  return { message: 'User deleted' };
});

// Запуск
const start = async () => {
  try {
    await server.listen({ port: 3000 });
    console.log('CRUD API running at http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`\n${signal} received. Closing server...`);
  await server.close();
  console.log('Server closed.');
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();