from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('turnos', '0002_configuracionlocal_alter_turno_options_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='turnoservicio',
            name='duracion_servicio',
            field=models.PositiveIntegerField(
                default=30,
                help_text="Duración en minutos del servicio en este turno"
            ),
        ),
    ]
