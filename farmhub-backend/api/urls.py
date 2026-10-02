from django.urls import re_path
from . import views

urlpatterns = [
    # Auth
    re_path(r'^auth/register/?$', views.register_view, name='register'),
    re_path(r'^auth/login/?$', views.login_view, name='login'),
    re_path(r'^auth/verify-email/?$', views.verify_email_view, name='verify_email'),
    re_path(r'^auth/resend-verification/?$', views.resend_verification_view, name='resend_verification'),
    re_path(r'^auth/forgot-password/?$', views.forgot_password_view, name='forgot_password'),
    re_path(r'^auth/reset-password/?$', views.reset_password_view, name='reset_password'),

    # Categories
    re_path(r'^categories/?$', views.category_list_create_view, name='category_list_create'),
    re_path(r'^categories/(?P<category_id>\d+)/?$', views.category_delete_view, name='category_delete'),

    # Products
    re_path(r'^products/?$', views.product_list_create_view, name='product_list_create'),
    re_path(r'^products/page/?$', views.product_page_view, name='product_page'),
    re_path(r'^products/search/?$', views.product_search_view, name='product_search'),
    re_path(r'^products/(?P<product_id>\d+)/?$', views.product_detail_view, name='product_detail'),

    # Reviews
    re_path(r'^reviews/product/(?P<product_id>\d+)/summary/?$', views.product_rating_summary_view, name='product_rating_summary'),
    re_path(r'^reviews/product/(?P<product_id>\d+)/?$', views.product_reviews_view, name='product_reviews'),
    re_path(r'^reviews/?$', views.add_review_view, name='add_review'),

    # Orders
    re_path(r'^orders/?$', views.create_order_view, name='create_order'),
    re_path(r'^orders/my/?$', views.my_orders_view, name='my_orders'),
    re_path(r'^orders/admin/all/?$', views.admin_all_orders_view, name='admin_all_orders'),
    re_path(r'^orders/admin/(?P<order_id>\d+)/status/?$', views.admin_update_order_status_view, name='admin_update_order_status'),
    re_path(r'^orders/(?P<order_id>\d+)/cancel/?$', views.cancel_order_view, name='cancel_order'),
    re_path(r'^orders/(?P<order_id>\d+)/return/?$', views.request_return_view, name='request_return'),
    re_path(r'^orders/(?P<order_id>\d+)/help/?$', views.request_help_view, name='request_help'),

    # Payments
    re_path(r'^payments/create-order/?$', views.create_payment_order_view, name='create_payment_order'),
    re_path(r'^payments/verify/?$', views.verify_payment_view, name='verify_payment'),

    # Admin
    re_path(r'^admin/dashboard/?$', views.admin_dashboard_view, name='admin_dashboard'),
]
