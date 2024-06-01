import re
from django.db import models
from django.core.exceptions import ValidationError
from django_attachments.fields import GalleryField

# List of product categories
CATEGORY_LIST = [
    'Bracelets',
    'Necklaces',
    'Earrings',
    'Rings',
    'Watches',
    'Brooches',
    'Anklets',
    'Hair Jewelry',
    'Cufflinks',
    'Pendants',
    'Charms',
    'Body Jewelry',
]

def get_category_choices():
    """
    Returns a list of tuples containing categories for the Product model.
    
    :return: List of tuples (category, category)
    """
    return [(category, category) for category in CATEGORY_LIST]

def validate_ref(value):
    if not re.match(r'^[A-Z0-9]+$', value):
        raise ValidationError('Reference must contain only uppercase letters and numbers, and no spaces.')

class Product(models.Model):
    """
    Model representing a product.
    
    Attributes:
        title (str): The title of the product.
        description (str): A detailed description of the product.
        price (int): The price of the product.
        category (str): The category of the product, chosen from a predefined list.
        images (ManyToManyField): A many-to-many relationship to the ProductResource model.
    """
    ref = models.CharField(max_length=20, validators=[validate_ref])
    name = models.CharField(max_length=40)
    description = models.TextField()
    price = models.IntegerField()
    category = models.CharField(max_length=20, choices=get_category_choices())

    gallery = GalleryField(related_name='products_with_attachment', on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    
    def delete(self, *args, **kwargs):
        if self.gallery:
            self.gallery.delete()
        super(Product, self).delete(*args, **kwargs)