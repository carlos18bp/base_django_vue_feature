from django.db import models
from django_attachments.models import Library
from django_attachments.fields import SingleImageField

class Blog(models.Model):
    """
    Blog model.

    :ivar title: title blog.
    :vartype title: str
    :ivar description: description blog.
    :vartype description: str
    :ivar category: category blog.
    :vartype category: str
    :ivar image: image by blog.
    :vartype image: Image
    :ivar created_at: created at timestamp.
    :vartype created_at: datetime
    :ivar updated_at: updated at timestamp.
    :vartype updated_at: datetime
    """

    title = models.CharField(max_length=40)
    description = models.TextField()
    category = models.CharField(max_length=40)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = SingleImageField(related_name='blog_image', on_delete=models.CASCADE)

    def __str__(self):
        return self.title
    
    def delete(self, *args, **kwargs):
        try:
            if self.image:
                self.image.delete()
        except Library.DoesNotExist:
            pass
        super(Blog, self).delete(*args, **kwargs)