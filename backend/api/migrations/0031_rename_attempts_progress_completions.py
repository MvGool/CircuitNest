# Generated by Django 4.2.7 on 2024-05-24 17:46

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0030_progress_submissions'),
    ]

    operations = [
        migrations.RenameField(
            model_name='progress',
            old_name='attempts',
            new_name='completions',
        ),
    ]