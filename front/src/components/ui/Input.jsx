import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Estilos en JS para garantizar que funcione sin configurar CSS Modules extra
const baseStyles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: '100%',
        position: 'relative'
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#334155', // Slate-700
        marginBottom: '2px'
    },
    required: {
        color: '#ef4444',
        marginLeft: '4px'
    },
    wrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%'
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        fontSize: '0.95rem',
        lineHeight: '1.5',
        color: '#1e293b',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem', // 8px
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        outline: 'none',
        height: '42px' // Altura consistente
    },
    iconStart: {
        position: 'absolute',
        left: '12px',
        color: '#94a3b8', // Slate-400
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none'
    },
    toggleBtn: {
        position: 'absolute',
        right: '12px',
        background: 'transparent',
        border: 'none',
        color: '#94a3b8',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: 0
    },
    errorText: {
        fontSize: '0.8rem',
        color: '#ef4444',
        marginTop: '4px'
    },
    helperText: {
        fontSize: '0.8rem',
        color: '#64748b',
        marginTop: '4px'
    }
};

export const Input = forwardRef(({
    label,
    type = 'text',
    value,
    onChange,
    onBlur,
    placeholder = '',
    error,
    helperText,
    icon: Icon,      // Soporte legacy para prop 'icon'
    startIcon: StartIcon, // Soporte explícito para icono al inicio (como en CompraForm)
    disabled = false,
    required = false,
    className = '',
    style = {},
    ...props
}, ref) => {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Determinar qué icono usar al inicio
    const FinalStartIcon = StartIcon || Icon;

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    // Estilos dinámicos
    const inputStyle = {
        ...baseStyles.input,
        paddingLeft: FinalStartIcon ? '38px' : '12px',
        paddingRight: isPassword ? '40px' : '12px',
        borderColor: error ? '#ef4444' : (focused ? '#9B8DC5' : '#e2e8f0'),
        boxShadow: focused 
            ? (error ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(155, 141, 197, 0.1)') 
            : 'none',
        backgroundColor: disabled ? '#f8fafc' : 'white',
        cursor: disabled ? 'not-allowed' : 'text',
        ...style // Permite sobreescribir desde props (ej: width)
    };

    return (
        <div style={baseStyles.container} className={className}>
            {label && (
                <label style={baseStyles.label}>
                    {label}
                    {required && <span style={baseStyles.required}>*</span>}
                </label>
            )}

            <div style={baseStyles.wrapper}>
                {FinalStartIcon && (
                    <div style={baseStyles.iconStart}>
                        <FinalStartIcon size={18} />
                    </div>
                )}

                <input
                    ref={ref}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setFocused(true)}
                    onBlur={(e) => {
                        setFocused(false);
                        onBlur?.(e);
                    }}
                    disabled={disabled}
                    placeholder={placeholder}
                    style={inputStyle}
                    aria-invalid={!!error}
                    {...props}
                />

                {isPassword && (
                    <button
                        type="button"
                        style={baseStyles.toggleBtn}
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>

            {error && (
                <span style={baseStyles.errorText}>{error}</span>
            )}
            {!error && helperText && (
                <span style={baseStyles.helperText}>{helperText}</span>
            )}
        </div>
    );
});

Input.displayName = 'Input';