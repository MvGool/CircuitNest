# Generated by Django 4.2.7 on 2024-05-08 13:10

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_rename_score_progress_stars_exerciselevel_time_goal_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='progress',
            name='star_details',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.BooleanField(), default=[False, False, False], size=None),
            preserve_default=False,
        ),
    ]
