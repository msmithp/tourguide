# Generated by Django 5.1.1 on 2024-10-03 18:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tourguide', '0002_alter_location_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='location',
            name='address',
            field=models.CharField(default='none', max_length=250),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='location',
            name='name',
            field=models.CharField(max_length=100),
        ),
    ]