from rest_framework import viewsets
from ..models import Country, State
from ..serializers import CountrySerializer, StateSerializer


class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    pagination_class = None


class StateViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StateSerializer
    pagination_class = None

    def get_queryset(self):
        qs = State.objects.all()
        country_id = self.request.query_params.get('country_id')
        if country_id:
            qs = qs.filter(country_id=country_id)
        return qs
