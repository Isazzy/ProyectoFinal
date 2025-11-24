import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Link as LinkIcon, RefreshCw } from 'lucide-react'; 
import { Button, Input } from '../ui'; 
import styles from '../../styles/Inventario.module.css';
import { uploadToCloudinary } from '../../utils/cloudinary'; 

export const InsumoForm = ({ insumoToEdit, onClose, useInventarioHook, mode = 'crear' }) => {
  const { categorias, marcas, fetchDependencias, crearInsumo, actualizarInsumo, loading } = useInventarioHook;
  const isReadOnly = mode === 'ver';

  const [uploadingImage, setUploadingImage] = useState(false);
  const [file, setFile] = useState(null); 
  const [preview, setPreview] = useState(null);
  const [imageMode, setImageMode] = useState('archivo');

  const [form, setForm] = useState({
    insumo_nombre: '',
    insumo_unidad: '',
    insumo_stock: '',
    insumo_stock_minimo: '',
    categoria_insumo: '',
    marca: '',
    insumo_imagen_url: '',
    activo: true
  });

  useEffect(() => {
    if (!isReadOnly) fetchDependencias();
    
    if (insumoToEdit) {
        let catValue = insumoToEdit.categoria_insumo;
        if (typeof insumoToEdit.categoria_insumo === 'object') catValue = insumoToEdit.categoria_insumo.id;
        
        let marcaValue = insumoToEdit.marca;
        if (typeof insumoToEdit.marca === 'object') marcaValue = insumoToEdit.marca.id;

        setForm({
            insumo_nombre: insumoToEdit.insumo_nombre || "",
            insumo_unidad: insumoToEdit.insumo_unidad || "",
            insumo_stock: insumoToEdit.insumo_stock,
            insumo_stock_minimo: insumoToEdit.insumo_stock_minimo,
            categoria_insumo: catValue || "",
            marca: marcaValue || "",
            insumo_imagen_url: insumoToEdit.insumo_imagen_url || "",
            activo: insumoToEdit.activo ?? true
        });

        if (insumoToEdit.insumo_imagen_url) {
            setPreview(insumoToEdit.insumo_imagen_url);
            setImageMode('url'); 
        }
    }
  }, [insumoToEdit, fetchDependencias, isReadOnly]);

  const handleChange = (e) => {
    if (isReadOnly) return;
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'insumo_imagen_url' && imageMode === 'url') setPreview(value);
  };

  const handleFileChange = (e) => {
    if (isReadOnly) return;
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setForm(prev => ({ ...prev, insumo_imagen_url: '' })); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    try {
        let finalUrl = form.insumo_imagen_url;
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
            insumo_imagen_url: finalUrl || "", 
            insumo_imagen: null 
        };
        
        if (!payload.marca) delete payload.marca;

        let success = false;
        if (mode === 'editar') {
            success = await actualizarInsumo(insumoToEdit.id, payload);
        } else {
            success = await crearInsumo(payload);
        }

        if (success) onClose();

    } catch (error) {
        setUploadingImage(false);
        console.error("Error en submit", error);
    }
  };

  const getTitle = () => {
      if (mode === 'ver') return 'Detalle Insumo';
      if (mode === 'editar') return 'Editar Insumo';
      return 'Nuevo Insumo';
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{getTitle()}</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formGrid}>
            {isReadOnly && preview && (
                <div style={{gridColumn:'1/-1', textAlign:'center', marginBottom:10}}>
                    <img src={preview} alt="" style={{height:150, borderRadius:8, border:'1px solid #eee'}} />
                </div>
            )}

            <Input label="Nombre" name="insumo_nombre" value={form.insumo_nombre} onChange={handleChange} disabled={isReadOnly} />
          
            <div className={styles.inputGroup}>
                <label>Categoría</label>
                {isReadOnly ? (
                    <div className={styles.readOnlyField}>
                        {/* Buscar nombre en array categorias si tienes acceso, o mostrar ID */}
                        {categorias.find(c => c.id == form.categoria_insumo)?.categoria_insumo_nombre || '-'}
                    </div>
                ) : (
                    <select name="categoria_insumo" value={form.categoria_insumo} onChange={handleChange} className={styles.selectInput}>
                        <option value="">-- Seleccionar --</option>
                        {Array.isArray(categorias) && categorias.map(c => (
                            <option key={c.id} value={c.id}>{c.categoria_insumo_nombre}</option>
                        ))}
                    </select>
                )}
            </div>

            <div className={styles.rowTwo}>
                <Input label="Unidad" name="insumo_unidad" value={form.insumo_unidad} onChange={handleChange} disabled={isReadOnly} />
                <div className={styles.inputGroup}>
                    <label>Marca</label>
                    {isReadOnly ? (
                        <div className={styles.readOnlyField}>
                            {marcas.find(m => m.id == form.marca)?.nombre || '-'}
                        </div>
                    ) : (
                        <select name="marca" value={form.marca} onChange={handleChange} className={styles.selectInput}>
                            <option value="">-- Ninguna --</option>
                            {Array.isArray(marcas) && marcas.map(m => (
                                <option key={m.id} value={m.id}>{m.nombre}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <div className={styles.rowTwo}>
                <Input type="number" label="Stock Inicial" name="insumo_stock" value={form.insumo_stock} onChange={handleChange} disabled={isReadOnly} />
                <Input type="number" label="Stock Mínimo" name="insumo_stock_minimo" value={form.insumo_stock_minimo} onChange={handleChange} disabled={isReadOnly} />
            </div>
            
            {!isReadOnly && (
                <div className={styles.imageSection} style={{gridColumn: '1 / -1', marginTop: 10, borderTop: '1px solid #eee', paddingTop: 10}}>
                    <label style={{display:'block', marginBottom: 5, fontWeight: 500}}>Imagen</label>
                    <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                        <Button type="button" variant={imageMode === 'archivo' ? 'primary' : 'secondary'} onClick={() => setImageMode('archivo')} size="sm"> <Upload size={14}/> Archivo </Button>
                        <Button type="button" variant={imageMode === 'url' ? 'primary' : 'secondary'} onClick={() => setImageMode('url')} size="sm"> <LinkIcon size={14}/> URL </Button>
                    </div>
                    {imageMode === 'archivo' ? (
                        <div className={styles.imageUploadSection}>
                            <label className={styles.uploadBtn} style={{cursor:'pointer', display:'flex', alignItems:'center', gap:5, padding:10, border:'1px dashed #ccc', borderRadius:5}}>
                                <Upload size={18} /> <span>{file ? file.name : "Seleccionar"}</span>
                                <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                            </label>
                        </div>
                    ) : (
                        <Input placeholder="https://..." name="insumo_imagen_url" value={form.insumo_imagen_url} onChange={handleChange} />
                    )}
                </div>
            )}

            <div className={styles.formActions}>
                <Button type="button" variant="secondary" onClick={onClose}>
                    {isReadOnly ? 'Cerrar' : 'Cancelar'}
                </Button>
                {!isReadOnly && (
                    <Button type="submit" icon={uploadingImage ? RefreshCw : Save} loading={loading || uploadingImage} disabled={loading || uploadingImage}>
                        {uploadingImage ? 'Subiendo...' : 'Guardar'}
                    </Button>
                )}
            </div>
        </form>
      </div>
    </div>
  );
};