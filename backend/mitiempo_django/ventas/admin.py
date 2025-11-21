from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Estado_Venta, Venta,
    Detalle_Venta, Detalle_Venta_Servicio
)
from turnos.models import Turno, TurnoServicio


class DetalleVentaInline(admin.TabularInline):
    model = Detalle_Venta
    extra = 0
    autocomplete_fields = ("producto",)


class DetalleVentaServicioInline(admin.TabularInline):
    model = Detalle_Venta_Servicio
    extra = 0
    autocomplete_fields = ("servicio",)


@admin.register(Estado_Venta)
class EstadoVentaAdmin(admin.ModelAdmin):
    list_display = ("id", "estado_venta_nombre")
    search_fields = ("estado_venta_nombre",)


@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):

    list_display = (
        "cliente", "empleado",
        "venta_fecha_hora", "venta_total",
        "venta_medio_pago", "estado_venta",
        "turno",
    )

    readonly_fields = ("venta_total",)

    list_filter = ("venta_medio_pago", "estado_venta", "venta_fecha_hora")
    search_fields = ("cliente__cliente_nombre", "cliente__cliente_apellido")
    ordering = ("-venta_fecha_hora",)

    autocomplete_fields = ("cliente", "empleado", "turno")

    inlines = [DetalleVentaInline, DetalleVentaServicioInline]

    # ---------------------------------------------------------
    #   AUTOPRELOAD DEL TURNO CUANDO VIENE DESDE EL ADMIN
    # ---------------------------------------------------------
    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)

        turno_id = request.GET.get("turno_id")
        if turno_id:
            try:
                # EL CAMPO CORRECTO ES id_turno
                turno_obj = Turno.objects.get(id_turno=turno_id)

                initial["turno"] = turno_obj.id_turno
                initial["cliente"] = turno_obj.cliente.id if turno_obj.cliente else None

            except Turno.DoesNotExist:
                pass

        return initial

    # ---------------------------------------------------------
    #   AUTOCREAR DETALLES DE SERVICIOS DEL TURNO
    # ---------------------------------------------------------
    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)

        venta = form.instance

        if not venta.turno:
            return

        # Evitar duplicados
        if Detalle_Venta_Servicio.objects.filter(venta=venta).exists():
            return

        # Cargar servicios del turno
        ts_rel = TurnoServicio.objects.filter(turno=venta.turno)

        for ts in ts_rel:
            Detalle_Venta_Servicio.objects.create(
                venta=venta,
                servicio=ts.servicio,
                cantidad=1,
                precio=ts.servicio.precio_serv,
                descuento=0
            )

        # Recalcular total
        total = 0
        for d in Detalle_Venta_Servicio.objects.filter(venta=venta):
            total += (d.precio * d.cantidad) - d.descuento

        venta.venta_total = total
        venta.save()
