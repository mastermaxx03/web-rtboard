import React, { createContext, useState, useContext } from 'react';

// 1. Create the context
const ModalContext = createContext();

// 2. Create a custom hook to easily use the context
export const useModal = () => {
  return useContext(ModalContext);
};

// 3. Create the Provider component
export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    type: null, // e.g., 'voltage', 'panelInfo'
    props: {}   // Any props to pass to the modal
  });

  const openModal = (type, props = {}) => {
    setModalState({ type, props });
  };

  const closeModal = () => {
    setModalState({ type: null, props: {} });
  };

  const value = {
    modalType: modalState.type,
    modalProps: modalState.props,
    openModal,
    closeModal
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};
