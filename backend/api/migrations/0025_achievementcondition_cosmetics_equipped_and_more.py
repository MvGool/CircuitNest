# Generated by Django 4.2.7 on 2024-05-17 13:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0024_alter_achievementcondition_condition_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='achievementcondition',
            name='cosmetics_equipped',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='achievementcondition',
            name='leaderboard_position',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='achievementcondition',
            name='perfection_required',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='achievementcondition',
            name='condition_type',
            field=models.PositiveSmallIntegerField(choices=[(1, 'Level Completion'), (2, 'Level Retry'), (3, 'Scenario Completion'), (4, 'Star Collection'), (5, 'Leaderboard Position'), (6, 'All Achievements'), (7, 'Tutorial Completion'), (8, 'Cosmetics Equipped')]),
        ),
    ]
