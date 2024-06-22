from django.core.management.base import BaseCommand
from base_feature_app.models import Product, Blog

class Command(BaseCommand):
    help = 'Create rake records in the database'

    """
    To delete fake data via console, run:
    python3 manage.py delete_fake_data
    """
    def handle(self, *args, **options):
        for blog in Blog.objects.all():
            blog.delete()
        for product in Product.objects.all():
            product.delete()