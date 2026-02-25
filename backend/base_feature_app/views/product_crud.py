from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from base_feature_app.models import Product
from base_feature_app.permissions import IsAdminOrReadOnly
from base_feature_app.serializers.product_create_update import ProductCreateUpdateSerializer
from base_feature_app.serializers.product_detail import ProductDetailSerializer
from base_feature_app.serializers.product_list import ProductListSerializer


@api_view(['GET'])
@permission_classes([IsAdminOrReadOnly])
def list_products(request):
    """
    Return a paginated list of all products.
    """
    queryset = Product.objects.all().order_by('-id')
    serializer = ProductListSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdminOrReadOnly])
def create_product(request):
    """
    Create a new product. Staff only.
    """
    serializer = ProductCreateUpdateSerializer(data=request.data)
    if serializer.is_valid():
        product = serializer.save()
        detail = ProductDetailSerializer(product, context={'request': request})
        return Response(detail.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminOrReadOnly])
def retrieve_product(request, product_id: int):
    """
    Return the detail of a single product.
    """
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    serializer = ProductDetailSerializer(product, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminOrReadOnly])
def update_product(request, product_id: int):
    """
    Update an existing product (full or partial). Staff only.
    """
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    serializer = ProductCreateUpdateSerializer(
        product, data=request.data, partial=(request.method == 'PATCH')
    )
    if serializer.is_valid():
        product = serializer.save()
        detail = ProductDetailSerializer(product, context={'request': request})
        return Response(detail.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminOrReadOnly])
def delete_product(request, product_id: int):
    """
    Delete a product by ID. Staff only.
    """
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    product.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
