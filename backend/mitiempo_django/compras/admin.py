from django.contrib import admin
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> a51b6139 (creacion de app compras/proveedores back y front)
from .models import Proveedores, Compra, DetalleCompra, productos_x_proveedores

@admin.register(Proveedores)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ['id_prov', 'nombre_prov', 'tipo_prov', 'telefono', 'activo']
    search_fields = ['nombre_prov', 'correo']
    list_filter = ['tipo_prov', 'activo']

@admin.register(Compra)
class CompraAdmin(admin.ModelAdmin):
    list_display = ['id_compra', 'proveedor', 'fecha_hs_comp', 'total_compra', 'estado']
    list_filter = ['estado', 'fecha_hs_comp']
    search_fields = ['id_compra']

@admin.register(DetalleCompra)
class DetalleCompraAdmin(admin.ModelAdmin):
    list_display = ['id_det_comp', 'id_compra', 'producto', 'cantidad', 'precio_um', 'total']

@admin.register(productos_x_proveedores)
class ProductoXProveedorAdmin(admin.ModelAdmin):
    list_display = ['id_prod', 'id_prov', 'd_compra', 'precio_ultima_compra']
<<<<<<< HEAD
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
>>>>>>> a51b6139 (creacion de app compras/proveedores back y front)
=======
from .models import Proveedor, Compra, Detalle_Compra
from django.db.models import F
from decimal import Decimal
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be

# --- INLINE PARA DETALLES DE COMPRA ---
class DetalleCompraInline(admin.TabularInline):
    model = Detalle_Compra
    extra = 1
    fields = (
        'insumo', 
        'detalle_compra_cantidad', 
        'detalle_compra_precio_unitario'
    )
    autocomplete_fields = ('insumo',)

# --- PROVEEDOR (CRUD) ---
@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ('proveedor_nombre', 'proveedor_dni', 'proveedor_telefono', 'proveedor_email')
    list_display_links = ('proveedor_nombre',)
    search_fields = ('proveedor_nombre', 'proveedor_dni', 'proveedor_telefono')
    list_per_page = 20


# --- COMPRA (Registro y Detalle) ---
@admin.register(Compra)
class CompraAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'proveedor',
        'empleado',
        'compra_fecha',         # <-- Nuevo campo
        'compra_hora',          # <-- Nuevo campo
        'compra_total',
        'compra_metodo_pago'
    )
    
    autocomplete_fields = ('proveedor', 'empleado', 'caja')
    
    # 🌟 ACTUALIZADO: quitamos compra_fecha_hora
    readonly_fields = ('compra_fecha', 'compra_hora', 'compra_total') 
    
    list_filter = ('compra_metodo_pago', 'empleado', 'proveedor', 'compra_fecha')
    search_fields = ('proveedor__proveedor_nombre', 'empleado__user__username')
    
    # 🌟 ACTUALIZADO: Usamos fecha y hora separadas
    date_hierarchy = 'compra_fecha'
    ordering = ('-compra_fecha', '-compra_hora')
    
    inlines = [DetalleCompraInline]
    
    fieldsets = (
        ('Información de la Transacción', {
            'fields': (
                ('proveedor', 'compra_metodo_pago'),
                'compra_total',
            )
        }),
        ('Auditoría y Referencias', {
            # 🌟 ACTUALIZADO: Mostramos la fecha y hora separadas
            'fields': ('empleado', 'caja', 'compra_fecha', 'compra_hora'), 
            'classes': ('collapse',),
        }),
    )
    # -----------------------------------------------------------------
    # 1. OVERRIDE para solucionar el error NOT NULL
    # -----------------------------------------------------------------
    def save_model(self, request, obj, form, change):
        """
        Asigna el empleado actual y un valor inicial para compra_total 
        antes del primer guardado.
        """
        # 1. Asignar empleado (obligatorio en el modelo)
        if not change and not obj.empleado:
            if hasattr(request.user, 'empleado'):
                obj.empleado = request.user.empleado
            # Nota: Si el usuario no es empleado, esto fallará en el Admin.

        # 2. Asignar Placeholder (para pasar la validación NOT NULL)
        if not obj.pk:
            obj.compra_total = Decimal('0.00') 
        
        # Guarda la instancia principal (Compra)
        super().save_model(request, obj, form, change)

    # -----------------------------------------------------------------
    # 2. OVERRIDE para calcular el total después de guardar los detalles
    # -----------------------------------------------------------------
    def save_related(self, request, form, formsets, change):
        """
        Se ejecuta después de que los inlines han sido guardados.
        """
        super().save_related(request, form, formsets, change)
        
        compra = form.instance
        
        if change:
            # 1. Recalcular el total sumando todos los detalles
            total_calculado = sum(
                detalle.detalle_compra_cantidad * detalle.detalle_compra_precio_unitario
                for detalle in Detalle_Compra.objects.filter(compra=compra)
            )
            
            # 2. Actualizar el objeto Compra con el valor final
            compra.compra_total = total_calculado
            compra.save()