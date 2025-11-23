// ========================================
// src/context/UIContext.jsx
// ========================================
import React, { createContext, useState, useCallback, useContext } from 'react';

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalStack, setModalStack] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Modal management
  const openModal = useCallback((modalId, props = {}) => {
    setModalStack(prev => [...prev, { id: modalId, props }]);
  }, []);

  const closeModal = useCallback((modalId) => {
    if (modalId) {
      setModalStack(prev => prev.filter(m => m.id !== modalId));
    } else {
      setModalStack(prev => prev.slice(0, -1));
    }
  }, []);

  const closeAllModals = useCallback(() => {
    setModalStack([]);
  }, []);

  const isModalOpen = useCallback((modalId) => {
    return modalStack.some(m => m.id === modalId);
  }, [modalStack]);

  const getModalProps = useCallback((modalId) => {
    const modal = modalStack.find(m => m.id === modalId);
    return modal?.props || {};
  }, [modalStack]);

  // Notifications
  const addNotification = useCallback((notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    // Auto remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    // Sidebar
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
    setSidebarOpen,
    
    // Modals
    modalStack,
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    getModalProps,
    
    // Loading
    globalLoading,
    setGlobalLoading,
    
    // Notifications
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export { UIContext };