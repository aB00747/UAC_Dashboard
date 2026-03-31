from rest_framework import serializers


class InsightRequestSerializer(serializers.Serializer):
    insight_type = serializers.ChoiceField(
        choices=['sales_trend', 'inventory_health', 'customer_analysis', 'revenue_summary', 'anomaly_detection'],
    )
    period_days = serializers.IntegerField(default=30, min_value=1, max_value=365)
