from django.core.management import call_command
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Create rake records in the database'

    def add_arguments(self, parser):
        parser.add_argument('number_of_records', type=int, nargs='?', default=10)

    """
    To generate fake data via console, run:
    python3 manage.py create_fake_data [numbers_of_records] (optional)
    """
    def handle(self, *args, **options):
        number_of_records = options['number_of_records']
        call_command('create_blogs', number_of_blogs=number_of_records)
        call_command('create_products', number_of_products=number_of_records)
