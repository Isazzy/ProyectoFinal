// ========================================
// src/pages/Inventario/InsumoForm.jsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Save, Upload, Link as LinkIcon, RefreshCw, Plus, Check, X } from 'lucide-react'; 
import { Button, Input } from '../../components/ui'; 
import styles from '../../styles/Inventario.module.css';
import { uploadToCloudinary } from '../../utils/cloudinary'; 

export const InsumoForm = ({ insumoToEdit, onClose, useInventarioHook, mode = 'crear' }) => {
  const { 
      categorias, marcas, fetchDependencias, 
      crearInsumo, actualizarInsumo, 
      crearCategoriaRapida, crearMarcaRapida,
      loading 
  } = useInventarioHook;
  
  const isReadOnly = mode === 'ver';

  // Estados
  const [uploadingImage, setUploadingImage] = useState(false);
  const [file, setFile] = useState(null); 
  const [preview, setPreview] = useState(null);
  const [imageMode, setImageMode] = useState('archivo');

  // Estados Creación Rápida
  const [addingCat, setAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [addingMarca, setAddingMarca] = useState(false);
  const [newMarcaName, setNewMarcaName] = useState("");

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

  // Carga inicial
  useEffect(() => {
    if (!isReadOnly) fetchDependencias();
    
    if (insumoToEdit) {
        let catValue = insumoToEdit.categoria_insumo;
        if (typeof catValue === 'object' && catValue) catValue = catValue.id;
        
        let marcaValue = insumoToEdit.marca;
        if (typeof marcaValue === 'object' && marcaValue) marcaValue = marcaValue.id;

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

  const handleModeChange = (mode) => {
      setImageMode(mode);
      if (mode === 'archivo') {
         // Mantener lógica
      } else {
          setFile(null);
          if (!form.insumo_imagen_url) setPreview(null);
          else setPreview(form.insumo_imagen_url);
      }
  };

  // Handlers Creación Rápida
  const handleCreateCat = async () => {
      if(!newCatName.trim()) return;
      const success = await crearCategoriaRapida(newCatName);
      if(success) { setAddingCat(false); setNewCatName(""); }
  };

  const handleCreateMarca = async () => {
      if(!newMarcaName.trim()) return;
      const success = await crearMarcaRapida(newMarcaName);
      if(success) { setAddingMarca(false); setNewMarcaName(""); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!form.insumo_nombre || !form.insumo_unidad || !form.categoria_insumo || form.insumo_stock === '') {
        alert("Complete los campos obligatorios.");
        return;
    }

    try {
        let finalUrl = "";
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
        } else {
            finalUrl = form.insumo_imagen_url;
        }

        const payload = {
            ...form,
            insumo_stock: parseFloat(form.insumo_stock),
            insumo_stock_minimo: parseFloat(form.insumo_stock_minimo || 0),
            marca: form.marca ? form.marca : null, 
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

  // --- RENDERIZADO: SOLO EL CONTENIDO DEL FORMULARIO ---
  // Ya no renderizamos .modalOverlay ni .modalHeader aquí porque el padre (Modal) lo hace
  return (
        <form onSubmit={handleSubmit} className={styles.formGrid}>
            {isReadOnly && preview && (
                <div style={{gridColumn:'1/-1', textAlign:'center', marginBottom:10}}>
                    <img src={preview} alt="" style={{height:150, borderRadius:8, border:'1px solid #eee', objectFit: 'contain'}} />
                </div>
            )}

            <Input label="Nombre *" name="insumo_nombre" value={form.insumo_nombre} onChange={handleChange} disabled={isReadOnly} required />
          
            <div className={styles.inputGroup}>
                <label>Categoría *</label>
                {isReadOnly ? (
                    <div className={styles.readOnlyField}>
                        {categorias.find(c => c.id == form.categoria_insumo)?.categoria_insumo_nombre || '-'}
                    </div>
                ) : (
                    addingCat ? (
                        <div style={{display:'flex', gap:5}}>
                            <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Nombre nueva categoría" autoFocus />
                            <Button size="sm" onClick={handleCreateCat} icon={Check} type="button"/>
                            <Button size="sm" variant="ghost" onClick={() => setAddingCat(false)} icon={X} type="button"/>
                        </div>
                    ) : (
                        <div style={{display:'flex', gap:5}}>
                            <select name="categoria_insumo" value={form.categoria_insumo} onChange={handleChange} className={styles.selectInput} required style={{flex:1}}>
                                <option value="">-- Seleccionar --</option>
                                {Array.isArray(categorias) && categorias.map(c => (
                                    <option key={c.id} value={c.id}>{c.categoria_insumo_nombre}</option>
                                ))}
                            </select>
                            <Button size="sm" variant="outline" onClick={() => setAddingCat(true)} icon={Plus} type="button" title="Crear categoría"/>
                        </div>
                    )
                )}
            </div>

            <div className={styles.rowTwo}>
                <Input label="Unidad *" name="insumo_unidad" value={form.insumo_unidad} onChange={handleChange} disabled={isReadOnly} required placeholder="Ej: ml, g, un" />
                
                <div className={styles.inputGroup}>
                    <label>Marca</label>
                    {isReadOnly ? (
                        <div className={styles.readOnlyField}>
                            {marcas.find(m => m.id == form.marca)?.nombre || '-'}
                        </div>
                    ) : (
                        addingMarca ? (
                            <div style={{display:'flex', gap:5}}>
                                <Input value={newMarcaName} onChange={e => setNewMarcaName(e.target.value)} placeholder="Nombre marca" autoFocus />
                                <Button size="sm" onClick={handleCreateMarca} icon={Check} type="button"/>
                                <Button size="sm" variant="ghost" onClick={() => setAddingMarca(false)} icon={X} type="button"/>
                            </div>
                        ) : (
                            <div style={{display:'flex', gap:5}}>
                                <select name="marca" value={form.marca} onChange={handleChange} className={styles.selectInput} style={{flex:1}}>
                                    <option value="">-- Ninguna --</option>
                                    {Array.isArray(marcas) && marcas.map(m => (
                                        <option key={m.id} value={m.id}>{m.nombre}</option>
                                    ))}
                                </select>
                                <Button size="sm" variant="outline" onClick={() => setAddingMarca(true)} icon={Plus} type="button" title="Crear marca"/>
                            </div>
                        )
                    )}
                </div>
            </div>

            <div className={styles.rowTwo}>
                <Input type="number" label="Stock Inicial *" name="insumo_stock" value={form.insumo_stock} onChange={handleChange} disabled={isReadOnly} required />
                <Input type="number" label="Stock Mínimo" name="insumo_stock_minimo" value={form.insumo_stock_minimo} onChange={handleChange} disabled={isReadOnly} />
            </div>
            
            {!isReadOnly && (
                <div className={styles.imageSection} style={{gridColumn: '1 / -1', marginTop: 10, borderTop: '1px solid #eee', paddingTop: 10}}>
                    <label style={{display:'block', marginBottom: 5, fontWeight: 500}}>Imagen</label>
                    <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                        <Button type="button" variant={imageMode === 'archivo' ? 'primary' : 'outline'} onClick={() => handleModeChange('archivo')} size="sm"> <Upload size={14}/> Archivo </Button>
                        <Button type="button" variant={imageMode === 'url' ? 'primary' : 'outline'} onClick={() => handleModeChange('url')} size="sm"> <LinkIcon size={14}/> URL </Button>
                    </div>
                    
                    {imageMode === 'archivo' ? (
                        <div className={styles.imageUploadSection}>
                            <label className={styles.uploadBtn} style={{cursor:'pointer', display:'flex', alignItems:'center', gap:5, padding:10, border:'1px dashed #ccc', borderRadius:5}}>
                                <Upload size={18} /> <span>{file ? file.name : "Seleccionar archivo..."}</span>
                                <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                            </label>
                        </div>
                    ) : (
                        <Input placeholder="https://ejemplo.com/imagen.jpg" name="insumo_imagen_url" value={form.insumo_imagen_url} onChange={handleChange} />
                    )}

                    {!isReadOnly && preview && imageMode === 'archivo' && (
                         <div style={{marginTop: 10, textAlign:'center'}}>
                            <img src={preview} alt="Preview" style={{height: 100, borderRadius: 5, border: '1px solid #eee', objectFit: 'contain'}}/>
                         </div>
                    )}
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
  );
};