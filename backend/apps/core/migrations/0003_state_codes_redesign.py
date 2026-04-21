from django.db import migrations, models


GST_MAP = {
    'JK': ('01', 'IN-JK'),
    'HP': ('02', 'IN-HP'),
    'PB': ('03', 'IN-PB'),
    'CH': ('04', 'IN-CH'),
    'UK': ('05', 'IN-UK'),
    'HR': ('06', 'IN-HR'),
    'DL': ('07', 'IN-DL'),
    'RJ': ('08', 'IN-RJ'),
    'UP': ('09', 'IN-UP'),
    'BR': ('10', 'IN-BR'),
    'SK': ('11', 'IN-SK'),
    'AR': ('12', 'IN-AR'),
    'NL': ('13', 'IN-NL'),
    'MN': ('14', 'IN-MN'),
    'MZ': ('15', 'IN-MZ'),
    'TR': ('16', 'IN-TR'),
    'ML': ('17', 'IN-ML'),
    'AS': ('18', 'IN-AS'),
    'WB': ('19', 'IN-WB'),
    'JH': ('20', 'IN-JH'),
    'OD': ('21', 'IN-OD'),
    'CG': ('22', 'IN-CG'),
    'MP': ('23', 'IN-MP'),
    'GJ': ('24', 'IN-GJ'),
    'DN': ('26', 'IN-DN'),
    'MH': ('27', 'IN-MH'),
    'AP': ('28', 'IN-AP'),
    'KA': ('29', 'IN-KA'),
    'GA': ('30', 'IN-GA'),
    'LD': ('31', 'IN-LD'),
    'KL': ('32', 'IN-KL'),
    'TN': ('33', 'IN-TN'),
    'PY': ('34', 'IN-PY'),
    'AN': ('35', 'IN-AN'),
    'TS': ('36', 'IN-TS'),
    'LA': ('38', 'IN-LA'),
}


def populate_new_codes(apps, schema_editor):
    State = apps.get_model('core', 'State')
    for state in State.objects.all():
        gst_code, iso_code = GST_MAP.get(state.alpha_code, ('', ''))
        state.state_code = gst_code
        state.iso_code = iso_code
        state.save(update_fields=['state_code', 'iso_code'])


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_brandingsetting'),
    ]

    operations = [
        migrations.RenameField(
            model_name='state',
            old_name='state_code',
            new_name='alpha_code',
        ),
        migrations.AddField(
            model_name='state',
            name='iso_code',
            field=models.CharField(blank=True, default='', max_length=10),
        ),
        migrations.AddField(
            model_name='state',
            name='state_code',
            field=models.CharField(blank=True, default='', max_length=5),
        ),
        migrations.RunPython(populate_new_codes, migrations.RunPython.noop),
    ]
