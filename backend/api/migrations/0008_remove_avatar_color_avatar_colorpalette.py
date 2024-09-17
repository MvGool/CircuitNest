# Generated by Django 4.2.7 on 2024-05-09 13:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_progress_star_details'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='avatar',
            name='color',
        ),
        migrations.AddField(
            model_name='avatar',
            name='colorPalette',
            field=models.JSONField(default={}),
            preserve_default=False,
        ),
    ]