from django.core.management import call_command
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    """
    To generate fake data via console, run:
    python3 manage.py create_fake_data [numbers_of_records] (optional)
    
    Examples:
    - python3 manage.py create_fake_data 20
    - python3 manage.py create_fake_data --blogs 15 --products 25 --sales 10 --users 30
    """

    help = 'Create fake data in the database'

    def add_arguments(self, parser):
        parser.add_argument('number_of_records', type=int, nargs='?', default=None)
        parser.add_argument('--blogs', type=int, default=10)
        parser.add_argument('--products', type=int, default=10)
        parser.add_argument('--sales', type=int, default=10)
        parser.add_argument('--users', type=int, default=10)

    def handle(self, *args, **options):
        number_of_records = options['number_of_records']
        if number_of_records is not None:
            blogs = number_of_records
            products = number_of_records
            sales = number_of_records
            users = number_of_records
        else:
            blogs = options['blogs']
            products = options['products']
            sales = options['sales']
            users = options['users']

        # Create data in order (users and products first, then sales that depend on products)
        self.stdout.write(self.style.WARNING('Creating Users...'))
        call_command('create_fake_users', number_of_users=users)
        
        self.stdout.write(self.style.WARNING('Creating Blogs...'))
        call_command('create_fake_blogs', number_of_blogs=blogs)
        
        self.stdout.write(self.style.WARNING('Creating Products...'))
        call_command('create_fake_products', number_of_products=products)
        
        self.stdout.write(self.style.WARNING('Creating Sales...'))
        call_command('create_fake_sales', number_of_sales=sales)
        
        self.stdout.write(self.style.SUCCESS('All fake data created successfully!'))