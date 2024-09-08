import os
import random
from faker import Faker
from django.core.files import File
from django.core.management.base import BaseCommand
from base_feature_app.models import Blog
from django_attachments.models import Attachment, Library

class Command(BaseCommand):
    help = 'Create Blog records in the database'

    def add_arguments(self, parser):
        parser.add_argument('number_of_blogs', type=int, nargs='?', default=10)

    def handle(self, *args, **options):
        number_of_blogs = options['number_of_blogs']
        fake = Faker()

        # List of test images
        test_images = [
            'media/temp/blog/image_temp1.webp',
            'media/temp/blog/image_temp2.webp',
            'media/temp/blog/image_temp3.webp',
            'media/temp/blog/image_temp4.webp',
        ]

        # Ensure the test images exist
        for image_path in test_images:
            if not os.path.isfile(os.getcwd() + '/' + image_path):
                self.stdout.write(self.style.ERROR(f'Image file {image_path} not found'))
                return

        categories = [
            'Technology',
            'Health',
            'Travel',
            'Education',
            'Food',
            'Fashion'
        ]

        for _ in range(number_of_blogs):
            category = random.choice(categories)
            title = fake.sentence(nb_words=6).rstrip('.')
            description = fake.text(max_nb_chars=1500)

            # Create a new library for the image
            image = Library.objects.create(title=title)

            # Select a random image
            image_path = random.choice(test_images)
            full_image_path = os.getcwd() + '/' + image_path
            with open(full_image_path, 'rb') as image_file:
                attachment = Attachment.objects.create(
                    library=image,
                    file=File(image_file, name=os.path.basename(full_image_path)),
                    original_name=os.path.basename(full_image_path),
                    rank=0
                )

            new_blog = Blog.objects.create(
                title=title + ' (EN)',
                description=description + ' (EN)',
                category=category + ' (EN)',
                image=image,
            )

            self.stdout.write(self.style.SUCCESS(f'Blog "{new_blog}" created'))

        self.stdout.write(self.style.SUCCESS(f'{number_of_blogs} Blog records created'))
