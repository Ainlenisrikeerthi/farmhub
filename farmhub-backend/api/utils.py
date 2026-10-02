import math
import uuid
import datetime
from datetime import timedelta
import jwt
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from .models import EmailVerificationToken, PasswordResetToken

FARM_LAT = 18.9252275
FARM_LNG = 78.8248532


def calculate_distance_in_km(lat1, lon1, lat2, lon2):
    R = 6371.0  # Earth's radius in km

    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = (math.sin(dlat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return round(R * c, 2)


def calculate_distance_from_farm(lat, lng):
    return calculate_distance_in_km(FARM_LAT, FARM_LNG, lat, lng)


def calculate_estimated_delivery(delivery_type):
    now = timezone.now().date()
    date_format = "%d %b %Y"

    if delivery_type and delivery_type.upper() == "FARM_DELIVERY":
        next_day = (now + timedelta(days=1)).strftime(date_format)
        return f"Today / Next Day (by {next_day})"

    if delivery_type and delivery_type.upper() == "MIXED":
        return "Fresh items: Today / Next Day; Courier items: 3-5 Business Days"

    delivery_date = (now + timedelta(days=5)).strftime(date_format)
    return f"3-5 Business Days (by {delivery_date})"


def generate_jwt_token(user):
    now = timezone.now()
    expiry = now + timedelta(days=7)
    payload = {
        'sub': user.email,
        'email': user.email,
        'name': user.name,
        'role': user.role,
        'iat': int(now.timestamp()),
        'exp': int(expiry.timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')


def send_verification_email(user):
    token = str(uuid.uuid4())
    expiry = timezone.now() + timedelta(hours=24)

    EmailVerificationToken.objects.filter(email=user.email).delete()
    EmailVerificationToken.objects.create(
        email=user.email,
        token=token,
        expiry_date=expiry
    )

    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    link = f"{frontend_url}/verify-email?token={token}"

    print("====================================")
    print(f"Sending verification email to: {user.email}")
    print(f"Verification link: {link}")
    print("====================================")

    if getattr(settings, 'EMAIL_HOST_USER', None):
        try:
            send_mail(
                subject="Verify your Farm Hub account",
                message=f"Hi {user.name},\n\nClick below to verify your account:\n\n{link}\n\nValid for 24 hours.\n\nFarm Hub",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True
            )
            print("EMAIL SENT SUCCESSFULLY ✅")
        except Exception as e:
            print(f"EMAIL FAILED ❌: {e}")


def send_reset_password_email(user):
    token = str(uuid.uuid4())
    expiry = timezone.now() + timedelta(minutes=30)

    PasswordResetToken.objects.filter(email=user.email).delete()
    PasswordResetToken.objects.create(
        email=user.email,
        token=token,
        expiry_date=expiry
    )

    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    reset_link = f"{frontend_url}/reset-password?token={token}"

    print("====================================")
    print(f"Sending password reset email to: {user.email}")
    print(f"Reset link: {reset_link}")
    print("====================================")

    if getattr(settings, 'EMAIL_HOST_USER', None):
        try:
            send_mail(
                subject="Reset Password",
                message=f"Reset link:\n{reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True
            )
        except Exception as e:
            print(f"EMAIL FAILED ❌: {e}")


def send_order_confirmation_email(order):
    if not getattr(settings, 'EMAIL_HOST_USER', None):
        return

    items_text = "\n".join([f"- {item.product_name} x {item.quantity}" for item in order.items.all()])
    body = (
        f"Hi {order.customer_name},\n\n"
        f"Your Farm Hub order #{order.id} has been placed successfully.\n"
        f"Status: {order.status}\n"
        f"Estimated delivery: {order.estimated_delivery}\n"
        f"Total: ₹ {order.total_amount}\n\n"
        f"Items:\n{items_text}\n\n"
        f"Thank you for ordering from Farm Hub.\nFresh From Our Farm"
    )

    try:
        send_mail(
            subject=f"Farm Hub Order Confirmation #{order.id}",
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.user_email],
            fail_silently=True
        )
    except Exception as e:
        print(f"Order email notification failed: {e}")


def validate_status_transition(order, new_status):
    allowed_anytime = [
        'CANCELLED', 'RETURN_REQUESTED', 'RETURN_APPROVED',
        'RETURN_REJECTED', 'RETURNED'
    ]
    if new_status in allowed_anytime:
        return

    delivery_type = (order.delivery_type or '').upper()

    if delivery_type == "FARM_DELIVERY":
        allowed = ['ORDER_PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED']
        if new_status not in allowed:
            raise ValueError("Invalid status for farm delivery order")
    elif delivery_type == "COURIER":
        allowed = ['ORDER_PLACED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']
        if new_status not in allowed:
            raise ValueError("Invalid status for courier order")
    elif delivery_type == "MIXED":
        allowed = ['ORDER_PLACED', 'PREPARING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']
        if new_status not in allowed:
            raise ValueError("Invalid status for mixed delivery order")
