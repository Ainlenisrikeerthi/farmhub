from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class User(models.Model):
    ROLE_CHOICES = (
        ('USER', 'USER'),
        ('ADMIN', 'ADMIN'),
    )

    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='USER')
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def __str__(self):
        return f"{self.name} ({self.email})"


class EmailVerificationToken(models.Model):
    email = models.EmailField()
    token = models.CharField(max_length=255, unique=True)
    expiry_date = models.DateTimeField()

    class Meta:
        db_table = 'email_verification_tokens'

    def __str__(self):
        return f"Verify Token for {self.email}"


class PasswordResetToken(models.Model):
    email = models.EmailField()
    token = models.CharField(max_length=255, unique=True)
    expiry_date = models.DateTimeField()

    class Meta:
        db_table = 'password_reset_tokens'

    def __str__(self):
        return f"Reset Token for {self.email}"


class Category(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'categories'

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    price = models.FloatField()
    unit = models.CharField(max_length=50, blank=True, default='')
    stock = models.IntegerField(default=0)
    image_url = models.TextField(blank=True, default='')
    delivery_type = models.CharField(max_length=50, default='FARM_DELIVERY')
    tracking_type = models.CharField(max_length=50, blank=True, default='')
    delivery_radius_km = models.IntegerField(default=10)
    harvest_date = models.DateField(null=True, blank=True)
    freshness_label = models.CharField(max_length=100, blank=True, default='')
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products',
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'products'

    def __str__(self):
        return self.name


class Order(models.Model):
    PAYMENT_METHOD_CHOICES = (
        ('COD', 'COD'),
        ('ONLINE', 'ONLINE'),
    )

    STATUS_CHOICES = (
        ('ORDER_PLACED', 'ORDER_PLACED'),
        ('PREPARING', 'PREPARING'),
        ('PACKED', 'PACKED'),
        ('SHIPPED', 'SHIPPED'),
        ('OUT_FOR_DELIVERY', 'OUT_FOR_DELIVERY'),
        ('DELIVERED', 'DELIVERED'),
        ('CANCELLED', 'CANCELLED'),
        ('RETURN_REQUESTED', 'RETURN_REQUESTED'),
        ('RETURN_APPROVED', 'RETURN_APPROVED'),
        ('RETURN_REJECTED', 'RETURN_REJECTED'),
        ('RETURNED', 'RETURNED'),
    )

    customer_name = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=20)
    flat_no = models.CharField(max_length=255, blank=True, default='')
    street_address = models.CharField(max_length=500, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    pincode = models.CharField(max_length=20, blank=True, default='')

    selected_lat = models.FloatField(null=True, blank=True)
    selected_lng = models.FloatField(null=True, blank=True)
    delivery_distance_km = models.FloatField(null=True, blank=True)

    subtotal = models.FloatField(default=0.0)
    discount_amount = models.FloatField(default=0.0)
    total_amount = models.FloatField(default=0.0)

    coupon_code = models.CharField(max_length=50, null=True, blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='ORDER_PLACED')

    delivery_type = models.CharField(max_length=50, default='COURIER')
    estimated_delivery = models.CharField(max_length=255, blank=True, default='')
    user_email = models.EmailField()

    created_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    return_requested_at = models.DateTimeField(null=True, blank=True)
    return_reason = models.TextField(null=True, blank=True)
    help_requested_at = models.DateTimeField(null=True, blank=True)
    help_message = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.customer_name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_id = models.BigIntegerField()
    product_name = models.CharField(max_length=255)
    price = models.FloatField()
    quantity = models.IntegerField()
    unit = models.CharField(max_length=50, blank=True, default='')

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"


class Review(models.Model):
    product_id = models.BigIntegerField(db_index=True)
    user_email = models.EmailField()
    user_name = models.CharField(max_length=255)
    rating = models.IntegerField()
    comment = models.TextField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']

    def __str__(self):
        return f"Review for #{self.product_id} by {self.user_name} ({self.rating}/5)"
