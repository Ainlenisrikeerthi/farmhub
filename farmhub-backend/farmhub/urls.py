from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def root_health_view(request):
    return JsonResponse({
        "status": "healthy",
        "service": "FarmHub Django Backend API",
        "documentation": "/api/"
    })


urlpatterns = [
    path('', root_health_view, name='health'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
