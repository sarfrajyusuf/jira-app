# Generated by Django 3.2.19 on 2023-07-04 16:55

from django.db import migrations, models


def update_company_organization_size(apps, schema_editor):
    Model = apps.get_model("db", "Workspace")
    updated_size = []
    for obj in Model.objects.all():
        obj.organization_size = str(obj.company_size)
        updated_size.append(obj)

    Model.objects.bulk_update(
        updated_size, ["organization_size"], batch_size=100
    )


class Migration(migrations.Migration):
    dependencies = [
        ("db", "0034_auto_20230628_1046"),
    ]

    operations = [
        migrations.AddField(
            model_name="workspace",
            name="organization_size",
            field=models.CharField(default="2-10", max_length=20),
        ),
        migrations.RunPython(update_company_organization_size),
        migrations.AlterField(
            model_name="workspace",
            name="name",
            field=models.CharField(
                max_length=80, verbose_name="Workspace Name"
            ),
        ),
        migrations.AlterField(
            model_name="workspace",
            name="slug",
            field=models.SlugField(max_length=48, unique=True),
        ),
        migrations.RemoveField(
            model_name="workspace",
            name="company_size",
        ),
    ]
