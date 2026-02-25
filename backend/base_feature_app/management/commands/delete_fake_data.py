from django.core.management.base import BaseCommand, CommandError
from base_feature_app.models import Product, Blog, Sale, User

class Command(BaseCommand):
    help = 'Delete fake records from the database'

    """
    To delete fake data via console, run:
    python3 manage.py delete_fake_data --confirm
    
    NOTE: This command will NOT delete superuser or staff accounts to protect administrators.
    """

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm deletion of all fake data.',
        )

    def handle(self, *args, **options):
        if not options.get('confirm'):
            raise CommandError('Deletion not confirmed. Re-run with --confirm.')
        
        # Delete Sales (this will cascade to SoldProducts)
        sales_count = Sale.objects.count()
        for sale in Sale.objects.all():
            sale.delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {sales_count} Sale records'))
        
        # Delete Blogs
        blogs_count = Blog.objects.count()
        for blog in Blog.objects.all():
            blog.delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {blogs_count} Blog records'))
        
        # Delete Products
        products_count = Product.objects.count()
        for product in Product.objects.all():
            product.delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {products_count} Product records'))
        
        # Delete Users (EXCEPT superusers and staff)
        users_to_delete = User.objects.filter(is_superuser=False, is_staff=False)
        users_count = users_to_delete.count()
        protected_count = User.objects.filter(is_superuser=True) | User.objects.filter(is_staff=True)
        protected_count = protected_count.distinct().count()
        
        for user in users_to_delete:
            user.delete()
        
        self.stdout.write(self.style.SUCCESS(f'Deleted {users_count} User records'))
        self.stdout.write(self.style.WARNING(f'Protected {protected_count} administrator/staff accounts'))
        
        self.stdout.write(self.style.SUCCESS('All fake data deleted successfully!'))