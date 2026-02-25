from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from base_feature_app.models import Sale
from base_feature_app.permissions import IsAdminUser
from base_feature_app.serializers.sale_detail import SaleDetailSerializer
from base_feature_app.serializers.sale_list import SaleListSerializer


@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_sales(request):
    """
    Return a list of all sales. Staff only.
    """
    queryset = Sale.objects.all().order_by('-id')
    serializer = SaleListSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def retrieve_sale(request, sale_id: int):
    """
    Return the detail of a single sale. Staff only.
    """
    try:
        sale = Sale.objects.get(id=sale_id)
    except Sale.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = SaleDetailSerializer(sale, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)
