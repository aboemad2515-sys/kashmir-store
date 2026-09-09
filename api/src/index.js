const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const sampleProducts = [
  { id: 1, title: 'شال كشمير فاخر', price: 250, currency: 'SAR', category: 'شالات' },
  { id: 2, title: 'ساعه رجالية أنيقة', price: 450, currency: 'SAR', category: 'ساعات' },
  { id: 3, title: 'جاكيت صوف', price: 350, currency: 'SAR', category: 'ملابس' }
];

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/products', (req, res) => res.json(sampleProducts));
app.get('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const p = sampleProducts.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
