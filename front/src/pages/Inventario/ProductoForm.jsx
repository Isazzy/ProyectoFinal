// ========================================
// src/pages/Inventario/ProductoForm.jsx
// ========================================
import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Link as LinkIcon, RefreshCw, Calculator, Plus, Check } from 'lucide-react';
import { Button, Input } from '../../components/ui/';
import styles from '../../styles/Inventario.module.css';
import { uploadToCloudinary } from '../../utils/cloudinary';

export const ProductoForm = ({ productoToEdit, onClose, useProductosHook, mode = 'crear' }) => {
  const { 
      tipos, marcas, fetchDependencias, 
      crearProducto, actualizarProducto, 
      crearTipoRapido, crearMarcaRapida,
      loading 
  } = useProductosHook;
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageMode, setImageMode] = useState('archivo');
  const isReadOnly = mode === 'ver';

  // Estados para creación rápida
  const [addingTipo, setAddingTipo] = useState(false);
  const [newTipoName, setNewTipoName] = useState("");
  
  const [addingMarca, setAddingMarca] = useState(false);
  const [newMarcaName, setNewMarcaName] = useState("");

  // Estados para la Calculadora de Precio (Auxiliar)
  const [costoRef, setCostoRef] = useState('');
  const [margenRef, setMargenRef] = useState(50); 

  const [form, setForm] = useState({
    producto_nombre: '',
    producto_descripcion: '',
    producto_precio: '',
    stock: '',
    stock_minimo: '',
    activo: true,
    tipo_producto: '',
    marca: '',
    producto_imagen_url: ''
  });

  // Carga de datos
  useEffect(() => {
    if (!isReadOnly) fetchDependencias();
    
    if (productoToEdit) {
      // Mapear datos básicos con seguridad
      const tipoVal = productoToEdit.tipo_producto && typeof productoToEdit.tipo_producto === 'object' 
        ? productoToEdit.tipo_producto.id 
        : productoToEdit.tipo_producto;
        
      const marcaVal = productoToEdit.marca && typeof productoToEdit.marca === 'object' 
        ? productoToEdit.marca.id 
        : productoToEdit.marca;

      setForm({
        producto_nombre: productoToEdit.producto_nombre || '',
        producto_descripcion: productoToEdit.producto_descripcion || '',
        producto_precio: productoToEdit.producto_precio || '',
        stock: productoToEdit.stock || 0,
        stock_minimo: productoToEdit.stock_minimo || 0,
        activo: productoToEdit.activo ?? true,
        tipo_producto: tipoVal || '',
        marca: marcaVal || '',
        producto_imagen_url: productoToEdit.producto_imagen_url || ''
      });

      if (productoToEdit.producto_imagen_url) {
        setPreview(productoToEdit.producto_imagen_url);
        setImageMode('url');
      }
    }
  }, [productoToEdit, fetchDependencias, isReadOnly]);

  const handleChange = (e) => {
    if (isReadOnly) return;
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
    }));
    if (name === 'producto_imagen_url' && imageMode === 'url') setPreview(value);
  };

  const handleFileChange = (e) => {
    if (isReadOnly) return;
    const f = e.target.files[0];
    if (f) {
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setForm(prev => ({ ...prev, producto_imagen_url: '' }));
    }
  };

  // Handlers Creación Rápida
  const handleCreateTipo = async () => {
      if(!newTipoName.trim()) return;
      const success = await crearTipoRapido(newTipoName);
      if(success) { setAddingTipo(false); setNewTipoName(""); }
  };

  const handleCreateMarca = async () => {
      if(!newMarcaName.trim()) return;
      const success = await crearMarcaRapida(newMarcaName);
      if(success) { setAddingMarca(false); setNewMarcaName(""); }
  };

  // Lógica de la Calculadora Auxiliar
  const aplicarCalculo = () => {
    if (!costoRef) return;
    const costo = parseFloat(costoRef);
    const margen = parseFloat(margenRef) / 100;
    const precioVenta = costo * (1 + margen);
    setForm(prev => ({ ...prev, producto_precio: Math.ceil(precioVenta) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!form.producto_nombre || !form.producto_precio || !form.tipo_producto) {
        alert("Completa los campos obligatorios (*)");
        return;
    }

    try {
        let finalUrl = form.producto_imagen_url;

        if (imageMode === 'archivo' && file) {
            setUploadingImage(true);
            try {
                finalUrl = await uploadToCloudinary(file);
            } catch (err) {
                alert("Error subiendo imagen");
                setUploadingImage(false);
                return;
            }
            setUploadingImage(false);
        }

        const payload = {
            ...form,
            producto_precio: parseFloat(form.producto_precio),
            stock: parseFloat(form.stock || 0),
            stock_minimo: parseFloat(form.stock_minimo || 0),
            producto_imagen_url: finalUrl || "",
            producto_imagen: null,
        };
        
        if (!payload.marca) delete payload.marca;

        let success;
        if (mode === 'editar') {
            success = await actualizarProducto(productoToEdit.id, payload);
        } else {
            success = await crearProducto(payload);
        }

        if (success) onClose();

    } catch (error) {
        setUploadingImage(false);
        console.error("Error submit producto", error);
    }
  };

  const getTitle = () => {
      if (mode === 'ver') return 'Detalle del Producto';
      if (mode === 'editar') return 'Editar Producto';
      return 'Nuevo Producto';
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
        <div className={styles.modalHeader}>
          <h2>{getTitle()}</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formGrid} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            
            {isReadOnly && preview && (
                <div style={{ textAlign: 'center', marginBottom: 10 }}>
                    <img src={preview} alt="Producto" style={{ height: 150, borderRadius: 8, objectFit: 'contain', border: '1px solid #eee' }} />
                </div>
            )}

            {!isReadOnly && mode === 'crear' && (
                <div style={{background: '#f0f9ff', padding: 12, borderRadius: 8, border: '1px solid #bae6fd'}}>
                    <div style={{display:'flex', alignItems:'center', gap: 5, marginBottom: 8, color: '#0284c7', fontSize: '0.9rem', fontWeight: 600}}>
                        <Calculator size={16} /> Calculadora Rápida
                    </div>
                    <div style={{display:'flex', gap: 10, alignItems: 'flex-end'}}>
                        <div style={{flex: 1}}>
                            <label style={{fontSize: '0.75rem', display:'block', marginBottom:4, color:'#334155'}}>Costo (Factura)</label>
                            <Input 
                                type="number" 
                                value={costoRef} 
                                onChange={e => setCostoRef(e.target.value)} 
                                placeholder="$ Costo" 
                                style={{background:'white', height: 35}}
                            />
                        </div>
                        <div style={{width: 100}}>
                            <label style={{fontSize: '0.75rem', display:'block', marginBottom:4, color:'#334155'}}>Margen %</label>
                            <Input 
                                type="number" 
                                value={margenRef} 
                                onChange={e => setMargenRef(e.target.value)} 
                                style={{background:'white', height: 35}}
                            />
                        </div>
                        <Button type="button" size="sm" onClick={aplicarCalculo} disabled={!costoRef} style={{height: 35}}>
                            Aplicar
                        </Button>
                    </div>
                </div>
            )}

            {/* Fila 1: Nombre y Precio */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {isReadOnly ? (
                    <>
                        <div><label style={{fontSize:'0.8rem', color:'#666'}}>Nombre</label><p style={{fontWeight:500}}>{form.producto_nombre}</p></div>
                        <div><label style={{fontSize:'0.8rem', color:'#666'}}>Precio Venta</label><p style={{fontWeight:500}}>${form.producto_precio}</p></div>
                    </>
                ) : (
                    <>
                        <Input label="Nombre *" name="producto_nombre" value={form.producto_nombre} onChange={handleChange} required disabled={isReadOnly} />
                        <Input label="Precio Venta *" type="number" name="producto_precio" value={form.producto_precio} onChange={handleChange} required disabled={isReadOnly} />
                    </>
                )}
            </div>

            {/* Fila 2: Stocks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {isReadOnly ? (
                    <>
                        <div><label style={{fontSize:'0.8rem', color:'#666'}}>Stock Actual</label><p>{form.stock}</p></div>
                        <div><label style={{fontSize:'0.8rem', color:'#666'}}>Stock Mínimo</label><p>{form.stock_minimo}</p></div>
                    </>
                ) : (
                    <>
                        <Input label="Stock Actual" type="number" name="stock" value={form.stock} onChange={handleChange} disabled={isReadOnly} />
                        <Input label="Stock Mínimo" type="number" name="stock_minimo" value={form.stock_minimo} onChange={handleChange} disabled={isReadOnly} />
                    </>
                )}
            </div>

            {/* Fila 3: Selectores con ADDON */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {isReadOnly ? (
                    <>
                        <div><label style={{fontSize:'0.8rem', color:'#666'}}>Tipo</label><p>{productoToEdit?.tipo_producto_nombre || '-'}</p></div>
                        <div><label style={{fontSize:'0.8rem', color:'#666'}}>Marca</label><p>{productoToEdit?.marca_nombre || '-'}</p></div>
                    </>
                ) : (
                    <>
                        {/* SELECTOR TIPO */}
                        <div className={styles.inputGroup}>
                            <label>Tipo Producto *</label>
                            {addingTipo ? (
                                <div style={{display:'flex', gap:5}}>
                                    <Input value={newTipoName} onChange={e => setNewTipoName(e.target.value)} placeholder="Nuevo Tipo" autoFocus />
                                    <Button size="sm" onClick={handleCreateTipo} icon={Check} type="button"/>
                                    <Button size="sm" variant="ghost" onClick={() => setAddingTipo(false)} icon={X} type="button"/>
                                </div>
                            ) : (
                                <div style={{display:'flex', gap:5}}>
                                    <select name="tipo_producto" value={form.tipo_producto} onChange={handleChange} className={styles.selectInput} style={{flex:1}}>
                                        <option value="">Seleccionar</option>
                                        {Array.isArray(tipos) && tipos.map(t => (
                                            <option key={t.id} value={t.id}>{t.tipo_producto_nombre}</option>
                                        ))}
                                    </select>
                                    <Button size="sm" variant="outline" onClick={() => setAddingTipo(true)} icon={Plus} type="button" title="Crear Tipo"/>
                                </div>
                            )}
                        </div>

                        {/* SELECTOR MARCA */}
                        <div className={styles.inputGroup}>
                            <label>Marca</label>
                            {addingMarca ? (
                                <div style={{display:'flex', gap:5}}>
                                    <Input value={newMarcaName} onChange={e => setNewMarcaName(e.target.value)} placeholder="Nueva Marca" autoFocus />
                                    <Button size="sm" onClick={handleCreateMarca} icon={Check} type="button"/>
                                    <Button size="sm" variant="ghost" onClick={() => setAddingMarca(false)} icon={X} type="button"/>
                                </div>
                            ) : (
                                <div style={{display:'flex', gap:5}}>
                                    <select name="marca" value={form.marca} onChange={handleChange} className={styles.selectInput} style={{flex:1}}>
                                        <option value="">Ninguna</option>
                                        {Array.isArray(marcas) && marcas.map(m => (
                                            <option key={m.id} value={m.id}>{m.nombre}</option>
                                        ))}
                                    </select>
                                    <Button size="sm" variant="outline" onClick={() => setAddingMarca(true)} icon={Plus} type="button" title="Crear Marca"/>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Descripción */}
            <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Descripción</label>
                {isReadOnly ? (
                    <p style={{background: '#f9fafb', padding: 10, borderRadius: 5, minHeight: 60, marginTop: 5}}>
                        {form.producto_descripcion || 'Sin descripción'}
                    </p>
                ) : (
                    <textarea className={styles.input} name="producto_descripcion" value={form.producto_descripcion} onChange={handleChange} rows={2} style={{ width: '100%', resize: 'none' }} />
                )}
            </div>

            {/* Estado y Fechas */}
            {isReadOnly && (
                <div style={{ marginTop: 10, fontSize: '0.85rem', color: '#666', display:'flex', justifyContent:'space-between' }}>
                    <span>Estado: <strong>{form.activo ? 'Activo' : 'Inactivo'}</strong></span>
                    {productoToEdit?.producto_fecha_hora_creacion && (
                        <span>Creado: {new Date(productoToEdit.producto_fecha_hora_creacion).toLocaleDateString()}</span>
                    )}
                </div>
            )}

            {!isReadOnly && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} style={{ width: 18, height: 18 }} />
                    <label>
                        Producto Activo 
                        {form.producto_precio == 0 && <span style={{color:'#ef4444', fontSize:'0.8rem', marginLeft: 5}}>(Precio es $0)</span>}
                    </label>
                </div>
            )}

            {/* Sección Imagen */}
            {!isReadOnly && (
                <div className={styles.imageSection} style={{ borderTop: '1px solid #eee', paddingTop: 10 }}>
                    <label style={{ fontWeight: 600 }}>Imagen del Producto</label>
                    <div style={{ display: 'flex', gap: 10, margin: '5px 0' }}>
                        <Button type="button" size="sm" variant={imageMode === 'archivo' ? 'primary' : 'outline'} onClick={() => setImageMode('archivo')}> <Upload size={14} /> Archivo </Button>
                        <Button type="button" size="sm" variant={imageMode === 'url' ? 'primary' : 'outline'} onClick={() => setImageMode('url')}> <LinkIcon size={14} /> URL </Button>
                    </div>
                    {imageMode === 'archivo' ? (
                        <label className={styles.uploadBtn} style={{border:'1px dashed #ccc', padding: 10, display:'block', cursor:'pointer'}}>
                            {file ? file.name : "Seleccionar archivo..."}
                            <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                        </label>
                    ) : (
                        <Input name="producto_imagen_url" value={form.producto_imagen_url} onChange={handleChange} placeholder="https://..." />
                    )}
                    {preview && <div style={{ marginTop: 10, textAlign: 'center' }}><img src={preview} alt="Preview" style={{ height: 100 }} /></div>}
                </div>
            )}

            <div className={styles.formActions}>
                <Button type="button" variant="secondary" onClick={onClose}>
                    {isReadOnly ? 'Cerrar' : 'Cancelar'}
                </Button>
                {!isReadOnly && (
                    <Button type="submit" icon={uploadingImage ? RefreshCw : Save} loading={loading || uploadingImage} disabled={loading || uploadingImage}>
                        {uploadingImage ? 'Subiendo...' : (mode === 'editar' ? 'Guardar Cambios' : 'Crear')}
                    </Button>
                )}
            </div>
        </form>
      </div>
    </div>
  );
};