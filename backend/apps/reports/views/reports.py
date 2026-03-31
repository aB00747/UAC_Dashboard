from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from datetime import timedelta
from apps.customers.models import Customer
from apps.inventory.models import Chemical, Category
from apps.orders.models import Order, OrderItem
from apps.deliveries.models import Delivery

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    now = timezone.now()
    month_ago = now - timedelta(days=30)

    total_customers = Customer.objects.count()
    active_customers = Customer.objects.filter(is_active=True).count()
    total_orders = Order.objects.count()
    recent_orders = Order.objects.filter(created_at__gte=month_ago).count()
    total_revenue = Order.objects.filter(payment_status='paid').aggregate(total=Sum('total_amount'))['total'] or 0
    pending_orders = Order.objects.filter(status='pending').count()

    low_stock_chemicals = Chemical.objects.filter(quantity__lte=F('min_quantity')).count()
    total_chemicals = Chemical.objects.count()

    recent_orders_list = Order.objects.select_related('customer').order_by('-created_at')[:5]
    recent_orders_data = [{
        'id': o.id,
        'order_number': o.order_number,
        'customer_name': o.customer.full_name,
        'total_amount': float(o.total_amount),
        'status': o.status,
        'date': o.order_date.isoformat(),
    } for o in recent_orders_list]

    low_stock_items = Chemical.objects.filter(quantity__lte=F('min_quantity')).values('chemical_name', 'quantity', 'min_quantity', 'unit')[:10]

    monthly_orders = []
    for i in range(6, -1, -1):
        d = now - timedelta(days=i*30)
        month_start = d.replace(day=1)
        if i > 0:
            next_d = now - timedelta(days=(i-1)*30)
            month_end = next_d.replace(day=1)
        else:
            month_end = now
        count = Order.objects.filter(created_at__gte=month_start, created_at__lt=month_end).count()
        revenue = Order.objects.filter(created_at__gte=month_start, created_at__lt=month_end, payment_status='paid').aggregate(t=Sum('total_amount'))['t'] or 0
        monthly_orders.append({
            'month': month_start.strftime('%b'),
            'orders': count,
            'revenue': float(revenue),
        })

    return Response({
        'stats': {
            'total_customers': total_customers,
            'active_customers': active_customers,
            'total_orders': total_orders,
            'recent_orders': recent_orders,
            'total_revenue': float(total_revenue),
            'pending_orders': pending_orders,
            'low_stock_chemicals': low_stock_chemicals,
            'total_chemicals': total_chemicals,
        },
        'recent_orders': recent_orders_data,
        'low_stock_items': list(low_stock_items),
        'monthly_data': monthly_orders,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_report_view(request):
    orders = Order.objects.all()
    total_revenue = orders.filter(payment_status='paid').aggregate(t=Sum('total_amount'))['t'] or 0
    total_orders = orders.count()
    avg_order_value = float(total_revenue) / total_orders if total_orders else 0

    by_status = orders.values('status').annotate(count=Count('id'), total=Sum('total_amount'))
    by_payment = orders.values('payment_status').annotate(count=Count('id'), total=Sum('total_amount'))

    top_customers = (
        Order.objects.filter(payment_status='paid')
        .values('customer__first_name', 'customer__last_name', 'customer__company_name')
        .annotate(total=Sum('total_amount'), order_count=Count('id'))
        .order_by('-total')[:10]
    )

    top_products = (
        OrderItem.objects.values('chemical__chemical_name')
        .annotate(total_qty=Sum('quantity'), total_value=Sum('total_price'))
        .order_by('-total_value')[:10]
    )

    return Response({
        'total_revenue': float(total_revenue),
        'total_orders': total_orders,
        'avg_order_value': avg_order_value,
        'by_status': list(by_status),
        'by_payment': list(by_payment),
        'top_customers': list(top_customers),
        'top_products': list(top_products),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inventory_report_view(request):
    total_chemicals = Chemical.objects.count()
    total_categories = Category.objects.count()
    low_stock = Chemical.objects.filter(quantity__lte=F('min_quantity')).count()
    total_value = Chemical.objects.aggregate(
        total=Sum(F('quantity') * F('selling_price'))
    )['total'] or 0

    by_category = (
        Chemical.objects.values('category__name')
        .annotate(count=Count('id'), total_quantity=Sum('quantity'))
        .order_by('-count')
    )

    low_stock_items = (
        Chemical.objects.filter(quantity__lte=F('min_quantity'))
        .values('chemical_name', 'chemical_code', 'quantity', 'min_quantity', 'unit')
    )

    return Response({
        'total_chemicals': total_chemicals,
        'total_categories': total_categories,
        'low_stock_count': low_stock,
        'total_inventory_value': float(total_value),
        'by_category': list(by_category),
        'low_stock_items': list(low_stock_items),
    })
