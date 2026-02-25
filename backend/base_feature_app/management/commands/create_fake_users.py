from faker import Faker
from django.core.management.base import BaseCommand
from base_feature_app.models import User

class Command(BaseCommand):
    help = 'Create User records in the database'

    def add_arguments(self, parser):
        parser.add_argument('number_of_users', type=int, nargs='?', default=10)

    def handle(self, *args, **options):
        number_of_users = options['number_of_users']
        fake = Faker()

        for _ in range(number_of_users):
            email = fake.unique.email()
            first_name = fake.first_name()
            last_name = fake.last_name()
            phone = fake.phone_number()
            
            # Create user with Customer role by default
            new_user = User.objects.create_user(
                email=email,
                password='password123',  # Default password for fake users
                first_name=first_name,
                last_name=last_name,
                phone=phone,
                role=User.Role.CUSTOMER,
                is_active=True,
            )

            self.stdout.write(self.style.SUCCESS(f'User "{new_user.email}" created'))

        self.stdout.write(self.style.SUCCESS(f'{number_of_users} User records created'))
