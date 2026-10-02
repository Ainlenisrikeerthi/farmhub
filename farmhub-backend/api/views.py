import re
import uuid
import hmac
import hashlib
from datetime import timedelta
from django.conf import settings
from django.db.models import Avg
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import (
    User, EmailVerificationToken, PasswordResetToken,
    Category, Product, Order, OrderItem, Review
)
from .serializers import (
    CategorySerializer, ProductSerializer, OrderSerializer, ReviewSerializer
)
from .permissions import IsAdminRole, IsAuthenticatedCustom
from .utils import (
    calculate_distance_from_farm, calculate_estimated_delivery,
    generate_jwt_token, send_verification_email,
    send_reset_password_email, send_order_confirmation_email,
    validate_status_transition
)


# =====================================================================
# AUTH VIEWS
# =====================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    name = (request.data.get('name') or '').strip()
    email = (request.data.get('email') or '').strip().lower()
    phone = (request.data.get('phone') or '').strip()
    password = request.data.get('password') or ''

    if len(name) < 3:
        return Response("Name must be at least 3 characters", status=status.HTTP_400_BAD_REQUEST)

    email_regex = r'^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    if not re.match(email_regex, email):
        return Response("Enter a valid email address", status=status.HTTP_400_BAD_REQUEST)

    phone_regex = r'^[6-9][0-9]{9}$'
    if not re.match(phone_regex, phone):
        return Response("Enter a valid 10-digit Indian mobile number", status=status.HTTP_400_BAD_REQUEST)

    if len(password) < 6:
        return Response("Password must be at least 6 characters", status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response("Email already exists", status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(phone=phone).exists():
        return Response("Phone already exists", status=status.HTTP_400_BAD_REQUEST)

    user = User(
        name=name,
        email=email,
        phone=phone,
        role='USER',
        email_verified=False
    )
    user.set_password(password)
    user.save()

    send_verification_email(user)

    return Response({
        "message": "Signup successful. Please verify your email before login."
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = (request.data.get('email') or '').strip().lower()
    password = request.data.get('password') or ''

    user = User.objects.filter(email=email).first()
    if not user or not user.check_password(password):
        return Response("Invalid email or password", status=status.HTTP_401_UNAUTHORIZED)

    if not user.email_verified:
        return Response("Please verify your email before login", status=status.HTTP_403_FORBIDDEN)

    token = generate_jwt_token(user)

    return Response({
        "token": token,
        "name": user.name,
        "email": user.email,
        "role": user.role
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email_view(request):
    token = request.query_params.get('token')
    if not token:
        return Response({"message": "Invalid verification link"}, status=status.HTTP_400_BAD_REQUEST)

    verification_token = EmailVerificationToken.objects.filter(token=token).first()
    if not verification_token:
        return Response({"message": "Invalid verification link"}, status=status.HTTP_400_BAD_REQUEST)

    if verification_token.expiry_date < timezone.now():
        return Response({"message": "Verification link expired"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(email=verification_token.email).first()
    if not user:
        return Response({"message": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

    user.email_verified = True
    user.save()

    verification_token.delete()

    return Response({"message": "Email verified successfully. You can login now."})


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification_view(request):
    email = (request.data.get('email') or '').strip().lower()
    user = User.objects.filter(email=email).first()

    if not user:
        return Response({"message": "If this email exists, verification link has been sent"})

    if user.email_verified:
        return Response({"message": "Email is already verified"}, status=status.HTTP_400_BAD_REQUEST)

    send_verification_email(user)
    return Response({"message": "Verification link resent to your email"})


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_view(request):
    email = (request.data.get('email') or '').strip().lower()
    user = User.objects.filter(email=email).first()

    if not user:
        return Response({"message": "If this email exists, reset link has been sent"})

    send_reset_password_email(user)
    return Response({"message": "Password reset link sent"})


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_view(request):
    token = request.data.get('token')
    new_password = request.data.get('newPassword')

    if not token:
        return Response({"message": "Invalid reset link"}, status=status.HTTP_400_BAD_REQUEST)

    if not new_password or len(new_password) < 6:
        return Response({"message": "Password must be at least 6 characters"}, status=status.HTTP_400_BAD_REQUEST)

    reset_token = PasswordResetToken.objects.filter(token=token).first()
    if not reset_token or reset_token.expiry_date < timezone.now():
        return Response({"message": "Invalid or expired reset link"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(email=reset_token.email).first()
    if not user:
        return Response({"message": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    reset_token.delete()
    return Response({"message": "Password reset successfully"})


# =====================================================================
# CATEGORY VIEWS
# =====================================================================

@api_view(['GET', 'POST'])
def category_list_create_view(request):
    if request.method == 'GET':
        categories = Category.objects.all().order_by('id')
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    # POST (Admin only)
    if not (request.user and request.user.is_authenticated and request.user.role == 'ADMIN'):
        return Response({"message": "Admin authorization required"}, status=status.HTTP_403_FORBIDDEN)

    serializer = CategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def category_delete_view(request, category_id):
    if not (request.user and request.user.is_authenticated and request.user.role == 'ADMIN'):
        return Response({"message": "Admin authorization required"}, status=status.HTTP_403_FORBIDDEN)

    category = Category.objects.filter(id=category_id).first()
    if not category:
        return Response({"message": "Category not found"}, status=status.HTTP_404_NOT_FOUND)

    linked_products = Product.objects.filter(category_id=category_id).count()
    if linked_products > 0:
        return Response(
            {"message": f"Cannot delete category. {linked_products} product(s) are still linked to it."},
            status=status.HTTP_400_BAD_REQUEST
        )

    category.delete()
    return Response("Category deleted successfully")


# =====================================================================
# PRODUCT VIEWS
# =====================================================================

@api_view(['GET', 'POST'])
def product_list_create_view(request):
    if request.method == 'GET':
        products = Product.objects.all().order_by('id')
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    # POST (Admin only)
    if not (request.user and request.user.is_authenticated and request.user.role == 'ADMIN'):
        return Response({"message": "Admin authorization required"}, status=status.HTTP_403_FORBIDDEN)

    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        product = serializer.save()
        return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def product_page_view(request):
    try:
        page = int(request.query_params.get('page', 0))
        size = int(request.query_params.get('size', 8))
    except ValueError:
        page = 0
        size = 8

    keyword = request.query_params.get('keyword', '').strip()
    category_id = request.query_params.get('categoryId', '').strip()

    qs = Product.objects.all()

    if category_id:
        try:
            qs = qs.filter(category_id=int(category_id))
        except ValueError:
            pass

    if keyword:
        qs = qs.filter(name__icontains=keyword)

    total_elements = qs.count()
    total_pages = max(1, (total_elements + size - 1) // size) if total_elements > 0 else 0

    start = page * size
    end = start + size
    page_items = qs.order_by('id')[start:end]

    serializer = ProductSerializer(page_items, many=True)

    return Response({
        "content": serializer.data,
        "totalPages": total_pages,
        "totalElements": total_elements,
        "number": page,
        "size": size,
        "first": page == 0,
        "last": (page + 1) >= total_pages,
        "empty": len(serializer.data) == 0
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def product_search_view(request):
    keyword = request.query_params.get('keyword', '').strip()
    if keyword:
        products = Product.objects.filter(name__icontains=keyword).order_by('id')
    else:
        products = Product.objects.all().order_by('id')
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def product_detail_view(request, product_id):
    product = Product.objects.filter(id=product_id).first()
    if not product:
        return Response({"message": f"Product not found with id {product_id}"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(ProductSerializer(product).data)

    # Admin only operations
    if not (request.user and request.user.is_authenticated and request.user.role == 'ADMIN'):
        return Response({"message": "Admin authorization required"}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'DELETE':
        product.delete()
        return Response("Product deleted successfully")

    partial = (request.method == 'PATCH')
    serializer = ProductSerializer(product, data=request.data, partial=partial)
    if serializer.is_valid():
        updated = serializer.save()
        return Response(ProductSerializer(updated).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =====================================================================
# REVIEW VIEWS
# =====================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def product_reviews_view(request, product_id):
    reviews = Review.objects.filter(product_id=product_id).order_by('-created_at')
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def product_rating_summary_view(request, product_id):
    reviews = Review.objects.filter(product_id=product_id)
    count = reviews.count()
    avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0.0
    return Response({
        "averageRating": round(float(avg_rating), 1),
        "reviewCount": count
    })


@api_view(['POST'])
@permission_classes([IsAuthenticatedCustom])
def add_review_view(request):
    product_id = request.data.get('productId')
    rating = request.data.get('rating')
    comment = (request.data.get('comment') or '').strip()

    if not product_id or rating is None or not (1 <= int(rating) <= 5):
        return Response({"message": "Valid product and rating are required"}, status=status.HTTP_400_BAD_REQUEST)

    if not comment:
        return Response({"message": "Review comment is required"}, status=status.HTTP_400_BAD_REQUEST)

    review = Review.objects.create(
        product_id=int(product_id),
        user_email=request.user.email,
        user_name=request.user.name or request.user.email,
        rating=int(rating),
        comment=comment
    )
    return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)


# =====================================================================
# ORDER VIEWS
# =====================================================================

def _process_order_creation(order_data, user_email):
    items = order_data.get('items') or []
    if not items:
        raise ValueError("Order must contain at least one item")

    has_farm_delivery = any(
        (item.get('deliveryType') or '').upper() == 'FARM_DELIVERY'
        for item in items
    )
    has_courier = any(
        (item.get('deliveryType') or '').upper() == 'COURIER'
        for item in items
    )

    selected_lat = order_data.get('selectedLat')
    selected_lng = order_data.get('selectedLng')

    if has_farm_delivery:
        if selected_lat is None or selected_lng is None:
            raise ValueError("Location is required for fresh delivery items")

        actual_distance = calculate_distance_from_farm(float(selected_lat), float(selected_lng))
        if actual_distance > 10.0:
            raise ValueError("Fresh delivery not available beyond 10 km")

        delivery_distance = actual_distance
        delivery_type = "MIXED" if has_courier else "FARM_DELIVERY"
    else:
        delivery_distance = order_data.get('deliveryDistanceKm')
        delivery_type = "COURIER"

    estimated_delivery = calculate_estimated_delivery(delivery_type)

    order = Order.objects.create(
        customer_name=order_data.get('customerName') or '',
        customer_phone=order_data.get('customerPhone') or '',
        flat_no=order_data.get('flatNo') or '',
        street_address=order_data.get('streetAddress') or '',
        city=order_data.get('city') or '',
        pincode=order_data.get('pincode') or '',
        selected_lat=selected_lat,
        selected_lng=selected_lng,
        delivery_distance_km=delivery_distance,
        subtotal=float(order_data.get('subtotal', 0.0)),
        discount_amount=float(order_data.get('discountAmount', 0.0)),
        total_amount=float(order_data.get('totalAmount', 0.0)),
        coupon_code=order_data.get('couponCode'),
        payment_method=order_data.get('paymentMethod', 'COD'),
        status='ORDER_PLACED',
        delivery_type=delivery_type,
        estimated_delivery=estimated_delivery,
        user_email=user_email
    )

    for item in items:
        OrderItem.objects.create(
            order=order,
            product_id=int(item.get('productId')),
            product_name=item.get('productName') or '',
            price=float(item.get('price', 0.0)),
            quantity=int(item.get('quantity', 1)),
            unit=item.get('unit') or ''
        )

    send_order_confirmation_email(order)
    return order


@api_view(['POST'])
@permission_classes([IsAuthenticatedCustom])
def create_order_view(request):
    try:
        order = _process_order_creation(request.data, request.user.email)
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
    except ValueError as ex:
        return Response({"message": str(ex)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as ex:
        return Response({"message": str(ex)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticatedCustom])
def my_orders_view(request):
    orders = Order.objects.filter(user_email=request.user.email).order_by('-created_at')
    return Response(OrderSerializer(orders, many=True).data)


@api_view(['GET'])
@permission_classes([IsAdminRole])
def admin_all_orders_view(request):
    orders = Order.objects.all().order_by('-created_at')
    return Response(OrderSerializer(orders, many=True).data)


@api_view(['PUT'])
@permission_classes([IsAdminRole])
def admin_update_order_status_view(request, order_id):
    order = Order.objects.filter(id=order_id).first()
    if not order:
        return Response({"message": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if not new_status:
        return Response({"message": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_status_transition(order, new_status)
    except ValueError as ex:
        return Response({"message": str(ex)}, status=status.HTTP_400_BAD_REQUEST)

    order.status = new_status
    if new_status == 'DELIVERED' and not order.delivered_at:
        order.delivered_at = timezone.now()

    order.save()
    return Response(OrderSerializer(order).data)


@api_view(['PUT'])
@permission_classes([IsAuthenticatedCustom])
def cancel_order_view(request, order_id):
    order = Order.objects.filter(id=order_id).first()
    if not order:
        return Response({"message": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    if order.user_email != request.user.email:
        return Response({"message": "You cannot cancel this order"}, status=status.HTTP_403_FORBIDDEN)

    disallowed = ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED']
    if order.status in disallowed:
        return Response(
            {"message": "Order cannot be cancelled after shipping/out for delivery"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if order.status == 'CANCELLED':
        return Response({"message": "Order is already cancelled"}, status=status.HTTP_400_BAD_REQUEST)

    order.status = 'CANCELLED'
    order.cancelled_at = timezone.now()
    order.save()

    return Response(OrderSerializer(order).data)


@api_view(['POST'])
@permission_classes([IsAuthenticatedCustom])
def request_return_view(request, order_id):
    order = Order.objects.filter(id=order_id).first()
    if not order:
        return Response({"message": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    if order.user_email != request.user.email:
        return Response({"message": "You cannot return this order"}, status=status.HTTP_403_FORBIDDEN)

    if order.status != 'DELIVERED':
        return Response({"message": "Return is available only after delivery"}, status=status.HTTP_400_BAD_REQUEST)

    if not order.delivered_at:
        return Response({"message": "Delivery date not found"}, status=status.HTTP_400_BAD_REQUEST)

    now = timezone.now()
    if (order.delivery_type or '').upper() == 'FARM_DELIVERY':
        allowed = (order.delivered_at.date() == now.date())
    else:
        allowed = not (now > order.delivered_at + timedelta(days=3))

    if not allowed:
        return Response({"message": "Return window expired"}, status=status.HTTP_400_BAD_REQUEST)

    order.status = 'RETURN_REQUESTED'
    order.return_requested_at = now
    order.return_reason = request.data.get('reason', 'No reason provided')
    order.save()

    return Response(OrderSerializer(order).data)


@api_view(['POST'])
@permission_classes([IsAuthenticatedCustom])
def request_help_view(request, order_id):
    order = Order.objects.filter(id=order_id).first()
    if not order:
        return Response({"message": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    if order.user_email != request.user.email:
        return Response({"message": "You cannot request help for this order"}, status=status.HTTP_403_FORBIDDEN)

    message_text = request.data.get('message', 'Need help with this order')
    order.help_requested_at = timezone.now()
    order.help_message = message_text
    order.save()

    return Response(OrderSerializer(order).data)


# =====================================================================
# PAYMENT VIEWS
# =====================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def create_payment_order_view(request):
    amount = request.data.get('amount')
    if amount is None:
        return Response({"message": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)

    amount_float = float(amount)
    key_id = getattr(settings, 'RAZORPAY_KEY_ID', '')
    key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')

    if key_id and not key_id.startswith('PASTE_') and key_secret and not key_secret.startswith('PASTE_'):
        try:
            import razorpay
            client = razorpay.Client(auth=(key_id, key_secret))
            data = {
                "amount": int(round(amount_float * 100)),
                "currency": "INR",
                "receipt": f"receipt_{int(timezone.now().timestamp())}"
            }
            rzp_order = client.order.create(data=data)
            return Response({
                "id": rzp_order['id'],
                "amount": rzp_order['amount'],
                "currency": rzp_order['currency'],
                "key": key_id
            })
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    else:
        # Mock Razorpay order for development/testing when keys not provided
        mock_id = f"order_mock_{uuid.uuid4().hex[:12]}"
        return Response({
            "id": mock_id,
            "amount": int(round(amount_float * 100)),
            "currency": "INR",
            "key": key_id or "rzp_test_mockkey"
        })


@api_view(['POST'])
@permission_classes([IsAuthenticatedCustom])
def verify_payment_view(request):
    rzp_order_id = request.data.get('razorpayOrderId')
    rzp_payment_id = request.data.get('razorpayPaymentId')
    rzp_signature = request.data.get('razorpaySignature')
    order_data = request.data.get('orderData')

    key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')
    is_real_secret = key_secret and not key_secret.startswith('PASTE_')

    if is_real_secret:
        payload = f"{rzp_order_id}|{rzp_payment_id}".encode('utf-8')
        generated = hmac.new(key_secret.encode('utf-8'), payload, hashlib.sha256).hexdigest()
        if generated != rzp_signature:
            return Response({"message": "Payment verification failed"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        saved_order = _process_order_creation(order_data, request.user.email)
        return Response(OrderSerializer(saved_order).data)
    except Exception as ex:
        return Response({"message": str(ex)}, status=status.HTTP_400_BAD_REQUEST)


# =====================================================================
# ADMIN DASHBOARD
# =====================================================================

@api_view(['GET'])
@permission_classes([IsAdminRole])
def admin_dashboard_view(request):
    return Response("Welcome Admin")
