import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PopupContent {
  title: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  primaryButtonText: string;
  primaryButtonAction: () => void | string;
  secondaryButtonText?: string;
  secondaryButtonAction?: () => void | string;
  id: string; // Unique ID for this specific popup instance/type
}

interface PopupContextType {
  showPopup: (content: PopupContent) => void;
  hidePopup: () => void;
  popupState: {
    isOpen: boolean;
    content: PopupContent | null;
  };
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const PopupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [popupState, setPopupState] = useState<{ isOpen: boolean; content: PopupContent | null }>({
    isOpen: false,
    content: null,
  });

  const showPopup = (content: PopupContent) => {
     // Check if this popup has been shown before (using localStorage)
     const hasBeenShown = localStorage.getItem(`popup_${content.id}_shown`);
     if (hasBeenShown) {
       console.log(`Popup with ID ${content.id} has already been shown.`);
       return; // Don't show if already shown
     }

    setPopupState({ isOpen: true, content });
  };

  const hidePopup = () => {
     // Mark the currently open popup as shown in localStorage
     if (popupState.content?.id) {
        localStorage.setItem(`popup_${popupState.content.id}_shown`, 'true');
     }
    setPopupState({ isOpen: false, content: null });
  };

  return (
    <PopupContext.Provider value={{ showPopup, hidePopup, popupState }}>
      {children}
      {/* Render the Popup component here, controlled by the context state */}
      {popupState.isOpen && popupState.content && (
        <Popup
          isOpen={popupState.isOpen}
          onClose={hidePopup}
          title={popupState.content.title}
          description={popupState.content.description}
          imageSrc={popupState.content.imageSrc}
          imageAlt={popupState.content.imageAlt}
          primaryButtonText={popupState.content.primaryButtonText}
          primaryButtonAction={popupState.content.primaryButtonAction}
          secondaryButtonText={popupState.content.secondaryButtonText}
          secondaryButtonAction={popupState.content.secondaryButtonAction}
        />
      )}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};