# Importing products via CSV

You can import products to the API using the /api/admin/import-csv endpoint.

Requirements:
- Admin user with valid JWT (obtain via POST /api/admin/login)
- CSV file with headers: title,slug,description,price,currency,category,material,color,size,images,stock,sku
- images column should contain URLs separated by `|` if multiple

Example (curl):

1) Get token

curl -X POST http://localhost:4000/api/admin/login -H "Content-Type: application/json" -d '{"email":"kashmir@kashmir-store.com","password":"775059592"}'

2) Upload CSV

curl -X POST http://localhost:4000/api/admin/import-csv -H "Authorization: Bearer <TOKEN>" -F "file=@products.csv"

Response:
{ "imported": 20, "errors": [] }
