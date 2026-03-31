from rest_framework import serializers
from ..models import Document


class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True, default='')
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['uploaded_by']

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return ''
