from django.db import models

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
    """

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=40)
    image = models.ImageField(upload_to='blog_images/', null=False, blank=False)

    def __str__(self):
        return self.title