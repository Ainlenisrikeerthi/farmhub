from rest_framework import serializers
from .models import Category, Product, Order, OrderItem, Review, User


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


class ProductSerializer(serializers.ModelSerializer):
    imageUrl = serializers.CharField(source='image_url', required=False, allow_blank=True)
    deliveryType = serializers.CharField(source='delivery_type', required=False, default='FARM_DELIVERY')
    trackingType = serializers.CharField(source='tracking_type', required=False, allow_blank=True, default='')
    deliveryRadiusKm = serializers.IntegerField(source='delivery_radius_km', required=False, default=10)
    harvestDate = serializers.DateField(source='harvest_date', required=False, allow_null=True)
    freshnessLabel = serializers.CharField(source='freshness_label', required=False, allow_blank=True, default='')
    category = CategorySerializer(read_only=True)
    categoryId = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'unit', 'stock',
            'imageUrl', 'deliveryType', 'trackingType', 'deliveryRadiusKm',
            'harvestDate', 'freshnessLabel', 'category', 'categoryId'
        ]

    def to_internal_value(self, data):
        # Support payload with category: { id: X }
        data = data.copy()
        if 'category' in data and isinstance(data['category'], dict) and 'id' in data['category']:
            data['categoryId'] = data['category']['id']
        elif 'category_id' in data:
            data['categoryId'] = data['category_id']
        return super().to_internal_value(data)

    def create(self, validated_data):
        category_id = validated_data.pop('categoryId', None)
        category = None
        if category_id:
            category = Category.objects.filter(id=category_id).first()
        return Product.objects.create(category=category, **validated_data)

    def update(self, instance, validated_data):
        category_id = validated_data.pop('categoryId', None)
        if category_id is not None:
            instance.category = Category.objects.filter(id=category_id).first()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class OrderItemSerializer(serializers.ModelSerializer):
    productId = serializers.IntegerField(source='product_id')
    productName = serializers.CharField(source='product_name')

    class Meta:
        model = OrderItem
        fields = ['id', 'productId', 'productName', 'price', 'quantity', 'unit']


class OrderSerializer(serializers.ModelSerializer):
    customerName = serializers.CharField(source='customer_name')
    customerPhone = serializers.CharField(source='customer_phone')
    flatNo = serializers.CharField(source='flat_no', allow_blank=True, required=False)
    streetAddress = serializers.CharField(source='street_address', allow_blank=True, required=False)
    selectedLat = serializers.FloatField(source='selected_lat', allow_null=True, required=False)
    selectedLng = serializers.FloatField(source='selected_lng', allow_null=True, required=False)
    deliveryDistanceKm = serializers.FloatField(source='delivery_distance_km', allow_null=True, required=False)
    subtotal = serializers.FloatField()
    discountAmount = serializers.FloatField(source='discount_amount')
    totalAmount = serializers.FloatField(source='total_amount')
    couponCode = serializers.CharField(source='coupon_code', allow_null=True, required=False)
    paymentMethod = serializers.CharField(source='payment_method')
    deliveryType = serializers.CharField(source='delivery_type', required=False)
    estimatedDelivery = serializers.CharField(source='estimated_delivery', required=False)
    userEmail = serializers.EmailField(source='user_email')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    deliveredAt = serializers.DateTimeField(source='delivered_at', read_only=True)
    cancelledAt = serializers.DateTimeField(source='cancelled_at', read_only=True)
    returnRequestedAt = serializers.DateTimeField(source='return_requested_at', read_only=True)
    returnReason = serializers.CharField(source='return_reason', read_only=True)
    helpRequestedAt = serializers.DateTimeField(source='help_requested_at', read_only=True)
    helpMessage = serializers.CharField(source='help_message', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customerName', 'customerPhone', 'flatNo', 'streetAddress',
            'city', 'pincode', 'selectedLat', 'selectedLng', 'deliveryDistanceKm',
            'subtotal', 'discountAmount', 'totalAmount', 'couponCode',
            'paymentMethod', 'status', 'deliveryType', 'estimatedDelivery',
            'userEmail', 'createdAt', 'deliveredAt', 'cancelledAt',
            'returnRequestedAt', 'returnReason', 'helpRequestedAt', 'helpMessage',
            'items'
        ]


class ReviewSerializer(serializers.ModelSerializer):
    productId = serializers.IntegerField(source='product_id')
    userEmail = serializers.EmailField(source='user_email', read_only=True)
    userName = serializers.CharField(source='user_name', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'productId', 'userEmail', 'userName', 'rating', 'comment', 'createdAt']
