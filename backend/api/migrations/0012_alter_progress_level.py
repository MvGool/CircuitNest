# Generated by Django 4.2.7 on 2024-05-11 13:32

from django.db import migrations
import django.db.models.deletion
import smart_selects.db_fields


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_rename_colorpalette_avatar_color_palette'),
    ]

    operations = [
        migrations.AlterField(
            model_name='progress',
            name='level',
            field=smart_selects.db_fields.ChainedForeignKey(chained_field='scenario', chained_model_field='scenario', on_delete=django.db.models.deletion.CASCADE, to='api.level', verbose_name='Level'),
        ),
    ]
