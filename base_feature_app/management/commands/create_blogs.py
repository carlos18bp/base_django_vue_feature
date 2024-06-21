import os
import random
from faker import Faker
from django.core.files import File
from django.core.management.base import BaseCommand
from base_feature_app.models import Blog

class Command(BaseCommand):
    help = 'Create Blog records in the database'

    def add_arguments(self, parser):
        parser.add_argument('number_of_blogs', type=int, nargs='?', default=10)

    def handle(self, *args, **options):
        number_of_blogs = options['number_of_blogs']
        fake = Faker()  

        image_paths = [
            os.path.join(os.getcwd(), 'media/temp/blog/image_temp1.webp'),
            os.path.join(os.getcwd(), 'media/temp/blog/image_temp2.webp'),
            os.path.join(os.getcwd(), 'media/temp/blog/image_temp3.webp'),
            os.path.join(os.getcwd(), 'media/temp/blog/image_temp4.webp')
        ]

        for _ in range(number_of_blogs):
            title = fake.word()
            description  = fake.text(max_nb_chars=1500)
            categoria = fake.word()

            new_blog = Blog.objects.create(
                title = title + '(EN)',
                description  = description + '(EN)',
                category = categoria + '(EN)',
            )

            # Select a random image
            image_path = random.choice(image_paths)
            name_file = os.path.basename(image_path)
            with open(image_path, 'rb') as file:
                new_blog.image.save(name_file, File(file), save=True)

            self.stdout.write(self.style.SUCCESS(f'Blog "{new_blog}" created'))
        
        self.stdout.write(self.style.SUCCESS(f'{number_of_blogs} Blog records created'))