from faker import Faker
from django.core.management.base import BaseCommand
from django.core.files import File
from base_feature_app.models import Product
from base_feature_app.models.product import get_category_choices
from django_attachments.models import Library, Attachment
import random
import os

class Command(BaseCommand):
    help = 'Create Product records in the database'

    def add_arguments(self, parser):
        parser.add_argument('number_of_products', type=int, nargs='?', default=10)

    def handle(self, *args, **options):
        number_of_products = options['number_of_products']
        fake = Faker()

        category_choices = [choice[0] for choice in get_category_choices()]

        # List of test images
        test_images = [
            '/media/temp/product_temp1.jpg',
            '/media/temp/product_temp2.jpg',
            '/media/temp/product_temp3.jpg',
            '/media/temp/product_temp4.jpg',
        ]

        for _ in range(number_of_products):
            # Create a new gallery (library)
            gallery = Library.objects.create(title=fake.word())

            # Add test images to the gallery
            for image_path in test_images:
                image_path = os.getcwd() + image_path
                with open(image_path, 'rb') as image_file:
                    Attachment.objects.create(
                        library=gallery,
                        file=File(image_file, name=os.path.basename(image_path)),
                        original_name=os.path.basename(image_path),
                        rank=0  # You can set rank as needed
                    )

            # Now create the product with the gallery
            new_product = Product.objects.create(
                ref='REF' + str(random.randint(1000, 9999)),
                name=fake.word(),
                description=fake.text(max_nb_chars=300),
                price=fake.random_int(min=100, max=190),
                category=random.choice(category_choices),
                gallery=gallery  # Associate the gallery with the product
            )

            self.stdout.write(self.style.SUCCESS(f'Product "{new_product}" created with gallery "{gallery}"'))

        self.stdout.write(self.style.SUCCESS(f'"{Product.objects.count()}" Product records created'))
