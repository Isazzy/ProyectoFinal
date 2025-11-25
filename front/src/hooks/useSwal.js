// ========================================
// src/hooks/useSwal.js
// ========================================
import { useCallback } from 'react';
import Swal from 'sweetalert2';
import theme from '../styles/theme';

export const useSwal = () => {
  // Success alert
  const showSuccess = useCallback((title, text = '') => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonColor: theme.colors.primary,
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }, []);

  // Error alert
  const showError = useCallback((title, text = '') => {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: theme.colors.danger,
      confirmButtonText: 'Entendido',
    });
  }, []);

  // Warning alert
  const showWarning = useCallback((title, text = '') => {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonColor: theme.colors.warning,
      confirmButtonText: 'Entendido',
    });
  }, []);

  // Info alert
  const showInfo = useCallback((title, text = '') => {
    return Swal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonColor: theme.colors.primary,
      confirmButtonText: 'Entendido',
    });
  }, []);

  // Confirm dialog
  const confirm = useCallback(async (options = {}) => {
    const {
      title = '¿Estás seguro?',
      text = '',
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      icon = 'question',
      isDanger = false,
    } = options;

    const result = await Swal.fire({
      icon,
      title,
      text,
      showCancelButton: true,
      confirmButtonColor: isDanger ? theme.colors.danger : theme.colors.primary,
      cancelButtonColor: theme.colors.muted,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
    });

    return result.isConfirmed;
  }, []);

  // Delete confirmation
  const confirmDelete = useCallback(async (itemName = 'este elemento') => {
    return confirm({
      title: '¿Eliminar?',
      text: `Se eliminará ${itemName} permanentemente. Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      icon: 'warning',
      isDanger: true,
    });
  }, [confirm]);

  // Toast notification
  const toast = useCallback((title, icon = 'success') => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    return Toast.fire({ icon, title });
  }, []);

  // Loading
  const showLoading = useCallback((title = 'Cargando...') => {
    Swal.fire({
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }, []);

  const hideLoading = useCallback(() => {
    Swal.close();
  }, []);

  // Input prompt
  const prompt = useCallback(async (options = {}) => {
    const {
      title = 'Ingrese un valor',
      inputPlaceholder = '',
      inputValue = '',
      inputType = 'text',
    } = options;

    const result = await Swal.fire({
      title,
      input: inputType,
      inputValue,
      inputPlaceholder,
      showCancelButton: true,
      confirmButtonColor: theme.colors.primary,
      cancelButtonColor: theme.colors.muted,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) return 'Este campo es requerido';
      },
    });

    return result.isConfirmed ? result.value : null;
  }, []);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    confirm,
    confirmDelete,
    toast,
    showLoading,
    hideLoading,
    prompt,
    Swal, // Export raw Swal for custom usage
  };
};