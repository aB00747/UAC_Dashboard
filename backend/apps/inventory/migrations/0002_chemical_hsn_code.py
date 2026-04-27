from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='chemical',
            name='hsn_code',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
    ]
