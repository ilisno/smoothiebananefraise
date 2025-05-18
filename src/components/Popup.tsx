import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// Removed Link import as we are not using react-router-dom Link directly in buttons

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  primaryButtonText: string;
  primaryButtonAction: () => void; // Action is always a function
  secondaryButtonText?: string;
  secondaryButtonAction?: () => void; // Action is always a function (optional)
}

const Popup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  title,
  description,
  imageSrc,
  imageAlt,
  primaryButtonText,
  primaryButtonAction,
  secondaryButtonText,
  secondaryButtonAction,
}) => {

  const handlePrimaryAction = () => {
    primaryButtonAction(); // Execute the provided action function
    onClose(); // Close the popup
  };

   const handleSecondaryAction = () => {
    if (secondaryButtonAction) {
      secondaryButtonAction(); // Execute the provided action function if it exists
    }
    onClose(); // Always close the popup on secondary action (or just close if no action)
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="p-6 text-center">
          <DialogHeader>
            {imageSrc && (
              <img src={imageSrc} alt={imageAlt || title} className="mx-auto mb-4 max-h-48 object-contain" />
            )}
            <DialogTitle className="text-2xl font-bold text-gray-800">{title}</DialogTitle>
            {description && <DialogDescription className="text-gray-600 mt-2">{description}</DialogDescription>}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Content goes here if needed */}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-3 mt-4">
            {/* Primary Button */}
            <Button onClick={handlePrimaryAction} className="bg-sbf-red text-white hover:bg-red-700 text-base px-6 py-3 rounded-md font-semibold">
              {primaryButtonText}
            </Button>

            {/* Secondary Button (only render if text is provided) */}
            {secondaryButtonText && (
              <Button onClick={handleSecondaryAction} variant="outline" className="text-gray-800 border-gray-300 hover:bg-gray-200 text-base px-6 py-3 rounded-md font-semibold">
                {secondaryButtonText}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Popup;