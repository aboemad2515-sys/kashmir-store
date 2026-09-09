const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let sampleProducts = [
  { id: 1, title: 'شال كشمير فاخر', price: 250, currency: 'SAR', category: 'شالات', description: 'شال كشمير ناعم وفاخر، مصنوع من أجود الخامات.', images: ['/logo.svg'], stock: 10 },
  { id: 2, title: 'ساعه رجالية أنيقة', price: 450, currency: 'SAR', category: 'ساعات', description: 'ساعة أنيقة بمينا كلاسيكي.', images: ['/logo.svg'], stock: 5 },
  { id: 3, title: 'جاكيت صوف', price: 350, currency: 'SAR', category: 'ملابس', description: 'جاكيت صوف دافئ ومريح.', images: ['/logo.svg'], stock: 8 }
];

// Admin credentials (change in production / store securely)
const ADMIN_USER = 'kashmir@kashmir-store.com';
const ADMIN_PASS = '775059592';
const ADMIN_TOKEN = 'admin-token-123';

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/products', (req, res) => res.json(sampleProducts));
app.get('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const p = sampleProducts.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ token: ADMIN_TOKEN });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

function checkAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  if (auth === `Bearer ${ADMIN_TOKEN}`) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// Admin product CRUD
app.get('/api/admin/products', checkAuth, (req, res) => res.json(sampleProducts));
app.post('/api/admin/products', checkAuth, (req, res) => {
  const data = req.body;
  const id = sampleProducts.length ? Math.max(...sampleProducts.map(p => p.id)) + 1 : 1;
  const newP = { id, ...data };
  sampleProducts.push(newP);
  res.status(201).json(newP);
});
app.put('/api/admin/products/:id', checkAuth, (req, res) => {
  const id = Number(req.params.id);
  const idx = sampleProducts.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  sampleProducts[idx] = { ...sampleProducts[idx], ...req.body };
  res.json(sampleProducts[idx]);
});
app.delete('/api/admin/products/:id', checkAuth, (req, res) => {
  const id = Number(req.params.id);
  const idx = sampleProducts.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = sampleProducts.splice(idx, 1);
  res.json({ removed: removed[0] });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
