from django.db import models
from empleado.models import Empleado
# Create your models here.
class Caja(models.Model):#SOLO EL ADMINISTRADOR MANEJA CAJA
    empleado=models.ForeignKey(Empleado,on_delete=models.CASCADE)
    caja_estado=models.BooleanField(default=True)
    caja_monto_inicial=models.DecimalField(max_digits=10, decimal_places=2, default=0)
    caja_saldo_final=models.DecimalField(max_digits=10, decimal_places=2, default=0,null=True,blank=True)
    caja_fecha_hora_apertura=models.DateTimeField(auto_now_add=True)
    caja_fecha_hora_cierre=models.DateTimeField(null=True,blank=True)
    caja_observacion=models.CharField(max_length=400,blank=True,null=True)
    
    class Meta:
        verbose_name_plural="Cajas"
        verbose_name="Caja"
    def __str__(self):
        return f"Caja N°{self.id} - Apertura: {self.caja_fecha_hora_apertura.strftime('%Y-%m-%d %H:%M')}"
    
    
