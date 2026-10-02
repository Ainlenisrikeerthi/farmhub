import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'farmhub.settings')
django.setup()

from rest_framework.test import APIClient
from api.models import User, Product, Category

client = APIClient()

# 1. Test Categories
res = client.get('/api/categories')
print("Categories status:", res.status_code, "Count:", len(res.data))
assert res.status_code == 200

# 2. Test Products
res = client.get('/api/products')
print("Products status:", res.status_code, "Count:", len(res.data))
assert res.status_code == 200

# 3. Test Products Pagination
res = client.get('/api/products/page?page=0&size=4')
print("Products page status:", res.status_code, "Total elements:", res.data['totalElements'], "Content count:", len(res.data['content']))
assert res.status_code == 200
assert 'content' in res.data
assert 'totalPages' in res.data

# 4. Test Login
res = client.post('/api/auth/login', {'email': 'admin@farmhub.com', 'password': 'admin123'}, format='json')
print("Admin Login status:", res.status_code, "Token received:", bool(res.data.get('token')))
assert res.status_code == 200
admin_token = res.data['token']

# 5. Test Admin Dashboard with token
client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
res = client.get('/api/admin/dashboard')
print("Admin Dashboard status:", res.status_code, "Response:", res.data)
assert res.status_code == 200

# 6. Test Demo User Login
client.credentials()  # reset
res = client.post('/api/auth/login', {'email': 'user@farmhub.com', 'password': 'user123'}, format='json')
print("User Login status:", res.status_code, "Role:", res.data.get('role'))
assert res.status_code == 200
user_token = res.data['token']

# 7. Test Order Placement
client.credentials(HTTP_AUTHORIZATION=f'Bearer {user_token}')
prod = Product.objects.first()
order_payload = {
    'customerName': 'Ramesh Kumar',
    'customerPhone': '9123456780',
    'flatNo': 'Flat 101',
    'streetAddress': 'MG Road',
    'city': 'Hyderabad',
    'pincode': '500001',
    'selectedLat': 18.93,
    'selectedLng': 78.83,
    'deliveryDistanceKm': 1.2,
    'subtotal': prod.price,
    'discountAmount': 0.0,
    'totalAmount': prod.price,
    'paymentMethod': 'COD',
    'items': [{
        'productId': prod.id,
        'productName': prod.name,
        'price': prod.price,
        'quantity': 1,
        'unit': prod.unit,
        'deliveryType': prod.delivery_type
    }]
}
res = client.post('/api/orders', order_payload, format='json')
print("Create Order status:", res.status_code, "Order ID:", res.data.get('id'), "Delivery Type:", res.data.get('deliveryType'))
assert res.status_code == 200
order_id = res.data['id']

# 8. Test My Orders
res = client.get('/api/orders/my')
print("My Orders status:", res.status_code, "Count:", len(res.data))
assert res.status_code == 200

# 9. Test Product Reviews
res = client.get(f'/api/reviews/product/{prod.id}')
print("Reviews status:", res.status_code, "Count:", len(res.data))
assert res.status_code == 200

res = client.get(f'/api/reviews/product/{prod.id}/summary')
print("Rating Summary status:", res.status_code, "Data:", res.data)
assert res.status_code == 200

print("\nALL BACKEND API TESTS PASSED PERFECTLY!")
