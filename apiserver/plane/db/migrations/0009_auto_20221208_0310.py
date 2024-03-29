# Generated by Django 3.2.14 on 2022-12-13 17:58

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("db", "0008_label_colour"),
    ]

    operations = [
        migrations.AddField(
            model_name="projectmember",
            name="view_props",
            field=models.JSONField(null=True),
        ),
        migrations.AddField(
            model_name="state",
            name="group",
            field=models.CharField(
                choices=[
                    ("backlog", "Backlog"),
                    ("unstarted", "Unstarted"),
                    ("started", "Started"),
                    ("completed", "Completed"),
                    ("cancelled", "Cancelled"),
                ],
                default="backlog",
                max_length=20,
            ),
        ),
    ]
