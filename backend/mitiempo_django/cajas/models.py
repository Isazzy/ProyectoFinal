from django.db import models
from django.conf import settings  
from mitiempo_enloderomi.models import CustomUser

class Cajas(models.Model):
    id_caja = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,  
        on_delete=models.DO_NOTHING,
        db_column='id_usuario',
        null=True,
        blank=True
    )

    fech_hrs_ape = models.DateTimeField()
    fech_hrs_cie = models.DateTimeField(blank=True, null=True)
    monto_ini = models.DecimalField(max_digits=10, decimal_places=2)
    total_ingreso = models.DecimalField(max_digits=10, decimal_places=2)
    total_egreso = models.DecimalField(max_digits=10, decimal_places=2)
    total_caja = models.DecimalField(max_digits=10, decimal_places=2)
    estado_caja = models.IntegerField()

    class Meta:
        managed = True
        db_table = 'cajas'

    def __str__(self):
        return f"Caja #{self.id_caja}"

