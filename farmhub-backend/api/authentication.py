import jwt
from django.conf import settings
from rest_framework import authentication, exceptions
from .models import User


class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        token = parts[1]
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except (jwt.InvalidTokenError, Exception) as e:
            raise exceptions.AuthenticationFailed(f'Invalid token: {str(e)}')

        email = payload.get('sub') or payload.get('email')
        if not email:
            raise exceptions.AuthenticationFailed('User identifier not found in token')

        user = User.objects.filter(email=email).first()
        if not user:
            raise exceptions.AuthenticationFailed('User not found')

        return (user, token)
