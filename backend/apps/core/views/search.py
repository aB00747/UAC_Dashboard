from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from apps.customers.models import Customer
from apps.inventory.models import Chemical
from apps.orders.models import Order


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_view(request):
    q = request.query_params.get('q', '').strip()
    if len(q) < 2:
        return Response({'results': []})

    results = []
    customers = Customer.objects.filter(
        Q(first_name__icontains=q) | Q(last_name__icontains=q) |
        Q(company_name__icontains=q) | Q(email__icontains=q) | Q(phone__icontains=q)
    )[:5]
    for c in customers:
        results.append({'type': 'customer', 'id': c.id, 'title': c.full_name, 'subtitle': c.company_name})

    chemicals = Chemical.objects.filter(
        Q(chemical_name__icontains=q) | Q(chemical_code__icontains=q)
    )[:5]
    for ch in chemicals:
        results.append({'type': 'chemical', 'id': ch.id, 'title': ch.chemical_name, 'subtitle': ch.chemical_code})

    orders = Order.objects.filter(
        Q(order_number__icontains=q)
    )[:5]
    for o in orders:
        results.append({'type': 'order', 'id': o.id, 'title': o.order_number, 'subtitle': str(o.customer)})

    return Response({'results': results})
