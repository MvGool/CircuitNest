# Generated by Django 4.2.7 on 2024-05-09 16:33

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_alter_avatar_colorpalette'),
    ]

    operations = [
        migrations.RenameField(
            model_name='avatar',
            old_name='colorPalette',
            new_name='color_palette',
        ),
    ]
