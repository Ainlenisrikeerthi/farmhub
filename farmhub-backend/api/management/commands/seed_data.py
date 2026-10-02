from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import User, Category, Product, Review


class Command(BaseCommand):
    help = "Seed database with initial categories, products, admin, and demo user"

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding data...")

        # 1. Admin User
        admin_user = User.objects.filter(email='admin@farmhub.com').first()
        if not admin_user:
            admin_user = User(
                name="FarmHub Admin",
                email="admin@farmhub.com",
                phone="9876543210",
                role="ADMIN",
                email_verified=True
            )
            admin_user.set_password("admin123")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created Admin: admin@farmhub.com / admin123"))
        else:
            admin_user.email_verified = True
            admin_user.role = "ADMIN"
            admin_user.set_password("admin123")
            admin_user.save()

        # 2. Demo User
        demo_user = User.objects.filter(email='user@farmhub.com').first()
        if not demo_user:
            demo_user = User(
                name="Ramesh Kumar",
                email="user@farmhub.com",
                phone="9123456780",
                role="USER",
                email_verified=True
            )
            demo_user.set_password("user123")
            demo_user.save()
            self.stdout.write(self.style.SUCCESS("Created Demo User: user@farmhub.com / user123"))
        else:
            demo_user.email_verified = True
            demo_user.save()

        # 3. Categories
        categories_data = [
            {"name": "Vegetables", "description": "Crisp and fresh locally harvested organic vegetables"},
            {"name": "Fruits", "description": "Farm-fresh naturally ripened seasonal fruits"},
            {"name": "Dairy", "description": "Pure farm milk, butter, and artisan dairy products"},
            {"name": "Grains & Pulses", "description": "Organic whole grains and unpolished pulses"},
        ]

        category_objs = {}
        for cdata in categories_data:
            cat, _ = Category.objects.get_or_create(
                name=cdata["name"],
                defaults={"description": cdata["description"]}
            )
            category_objs[cdata["name"]] = cat

        # 4. Products
        products_data = [
            {
                "name": "Farm Fresh Tomatoes",
                "description": "Plump, vine-ripened organic tomatoes harvested this morning from our local fields.",
                "price": 40.0,
                "unit": "kg",
                "stock": 150,
                "image_url": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
                "delivery_type": "FARM_DELIVERY",
                "tracking_type": "LIVE_GPS",
                "delivery_radius_km": 10,
                "harvest_date": timezone.now().date(),
                "freshness_label": "Harvested Today",
                "category": category_objs["Vegetables"],
            },
            {
                "name": "Fresh Organic Spinach (Palak)",
                "description": "Tender, green, chemical-free spinach leaves packed with iron and nutrients.",
                "price": 25.0,
                "unit": "bunch",
                "stock": 80,
                "image_url": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80",
                "delivery_type": "FARM_DELIVERY",
                "tracking_type": "LIVE_GPS",
                "delivery_radius_km": 10,
                "harvest_date": timezone.now().date(),
                "freshness_label": "Morning Harvest",
                "category": category_objs["Vegetables"],
            },
            {
                "name": "Alphonso Mangoes (Ratnagiri)",
                "description": "Sweet, aromatic, naturally carbide-free Alphonso mangoes delivered straight from orchards.",
                "price": 650.0,
                "unit": "dozen",
                "stock": 45,
                "image_url": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80",
                "delivery_type": "FARM_DELIVERY",
                "tracking_type": "LIVE_GPS",
                "delivery_radius_km": 10,
                "harvest_date": timezone.now().date(),
                "freshness_label": "Tree Ripened",
                "category": category_objs["Fruits"],
            },
            {
                "name": "Shimla Royal Delicious Apples",
                "description": "Crisp, sweet, mountain-grown red apples with natural wax and uncompromised flavor.",
                "price": 180.0,
                "unit": "kg",
                "stock": 90,
                "image_url": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80",
                "delivery_type": "COURIER",
                "tracking_type": "COURIER_WAYBILL",
                "delivery_radius_km": 50,
                "harvest_date": timezone.now().date(),
                "freshness_label": "Orchard Fresh",
                "category": category_objs["Fruits"],
            },
            {
                "name": "Raw A2 Desi Cow Milk",
                "description": "Whole, unpasteurized, non-homogenized A2 Gir cow milk bottled within 2 hours of milking.",
                "price": 85.0,
                "unit": "liter",
                "stock": 60,
                "image_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",
                "delivery_type": "FARM_DELIVERY",
                "tracking_type": "LIVE_GPS",
                "delivery_radius_km": 10,
                "harvest_date": timezone.now().date(),
                "freshness_label": "Freshly Milked",
                "category": category_objs["Dairy"],
            },
            {
                "name": "Traditional Bilona Cow Ghee",
                "description": "Aromatic golden ghee made using ancient Vedic bilona churning method from cultured curd.",
                "price": 1150.0,
                "unit": "500ml",
                "stock": 35,
                "image_url": "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=600&auto=format&fit=crop&q=80",
                "delivery_type": "COURIER",
                "tracking_type": "COURIER_WAYBILL",
                "delivery_radius_km": 100,
                "harvest_date": timezone.now().date(),
                "freshness_label": "Artisanal Batch",
                "category": category_objs["Dairy"],
            },
            {
                "name": "Organic Traditional Basmati Rice",
                "description": "Long-grain, naturally aged aromatic Basmati rice free from chemical pesticides.",
                "price": 140.0,
                "unit": "kg",
                "stock": 200,
                "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
                "delivery_type": "COURIER",
                "tracking_type": "COURIER_WAYBILL",
                "delivery_radius_km": 100,
                "harvest_date": timezone.now().date(),
                "freshness_label": "Aged 2 Years",
                "category": category_objs["Grains & Pulses"],
            },
            {
                "name": "Unpolished Toor Dal (Pigeon Peas)",
                "description": "Naturally grown, high-protein native toor dal without synthetic water polishing or color.",
                "price": 160.0,
                "unit": "kg",
                "stock": 120,
                "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
                "delivery_type": "COURIER",
                "tracking_type": "COURIER_WAYBILL",
                "delivery_radius_km": 100,
                "harvest_date": timezone.now().date(),
                "freshness_label": "Unpolished",
                "category": category_objs["Grains & Pulses"],
            },
        ]

        for pdata in products_data:
            prod, created = Product.objects.get_or_create(
                name=pdata["name"],
                defaults=pdata
            )
            if created:
                # Add sample review
                Review.objects.create(
                    product_id=prod.id,
                    user_email="user@farmhub.com",
                    user_name="Ramesh Kumar",
                    rating=5,
                    comment="Extremely fresh and great quality! Delivered right to my doorstep."
                )

        self.stdout.write(self.style.SUCCESS("Data seeding completed successfully!"))
