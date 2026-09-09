require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { parse } = require('csv-parse');
const prisma = require('./prisma');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Public product endpoints
app.get('/api/products', async (req, res) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// Admin auth
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, admin.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ sub: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

// Middleware
function checkAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Admin product CRUD
app.get('/api/admin/products', checkAuth, async (req, res) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(products);
});

app.post('/api/admin/products', checkAuth, async (req, res) => {
  const data = req.body;
  const newP = await prisma.product.create({ data: {
    title: data.title || 'Untitled',
    description: data.description || '',
    price: Number(data.price) || 0,
    currency: data.currency || 'SAR',
    category: data.category || '',
    images: data.images || [],
    stock: Number(data.stock) || 0,
    sku: data.sku || `SKU-${Date.now()}`
  }});
  res.status(201).json(newP);
});

app.put('/api/admin/products/:id', checkAuth, async (req, res) => {
  const id = Number(req.params.id);
  const data = req.body;
  try {
    const updated = await prisma.product.update({ where: { id }, data: {
      title: data.title,
      description: data.description,
      price: data.price !== undefined ? Number(data.price) : undefined,
      currency: data.currency,
      category: data.category,
      images: data.images,
      stock: data.stock !== undefined ? Number(data.stock) : undefined,
      sku: data.sku
    }});
    res.json(updated);
  } catch (e) {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/api/admin/products/:id', checkAuth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const removed = await prisma.product.delete({ where: { id } });
    res.json({ removed });
  } catch (e) {
    res.status(404).json({ error: 'Not found' });
  }
});

// CSV import endpoint (multipart/form-data, field 'file')
app.post('/api/admin/import-csv', checkAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const buffer = req.file.buffer;

  parse(buffer, { columns: true, trim: true, skip_empty_lines: true }, async (err, records) => {
    if (err) return res.status(400).json({ error: 'Invalid CSV' });
    let imported = 0;
    const errors = [];
    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      try {
        const title = r.title || r.name || `Product ${i+1}`;
        const sku = r.sku && r.sku.length ? r.sku : `SKU-${Date.now()}-${i}`;
        const images = r.images ? r.images.split('|').map(s => s.trim()).filter(Boolean) : [];
        const price = r.price ? parseFloat(r.price) : 0;
        const stock = r.stock ? parseInt(r.stock) : 0;

        // upsert by sku (sku is unique)
        await prisma.product.upsert({
          where: { sku },
          update: {
            title,
            description: r.description || '',
            price,
            currency: r.currency || 'SAR',
            category: r.category || '',
            images,
            stock
          },
          create: {
            title,
            description: r.description || '',
            price,
            currency: r.currency || 'SAR',
            category: r.category || '',
            images,
            stock,
            sku
          }
        });
        imported++;
      } catch (e) {
        errors.push({ row: i+1, error: e.message });
      }
    }
    res.json({ imported, errors });
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
