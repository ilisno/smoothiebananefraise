import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose, // Import DialogClose for the default close button
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type AffiliatePopupProps = {
  isOpen: boolean;
  onClose: () => void; // Function to close the dialog
  onProceed: () => void; // Function to proceed after closing
  imageSrc: string;
  affiliateLink?: string;
  buttonText?: string; // Add buttonText prop
  title?: string; // Add title prop
};

const AffiliatePopup: React.FC<AffiliatePopupProps> = ({
  isOpen,
  onClose,
  onProceed,
  imageSrc,
  affiliateLink,
  buttonText, // Receive buttonText prop
  title, // Receive title prop
}) => {

  // Log the image source when the component renders or updates
  console.log("AffiliatePopup rendering with imageSrc:", imageSrc);

  const handleProceed = () => {
    onClose(); // Close the dialog first
    onProceed(); // Then trigger the proceed action
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Adjusted max width to sm:max-w-[350px] */}
      <DialogContent className="sm:max-w-[350px] md:max-w-[400px]"> {/* Adjust max width as needed */}
        <DialogHeader>
          {/* Use the title prop for the DialogTitle */}
          <DialogTitle>{title || "Offre Spéciale !"}</DialogTitle>
          {/* Optional description */}
          {/* <DialogDescription>
            Découvrez cette offre avant de voir votre programme.
          </DialogDescription> */}
        </DialogHeader>
        <div className="my-4 flex justify-center"> {/* Center the image container */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt="Offre affiliée"
            // Simplified styling: ensure it has width and height are auto
            className="max-w-full h-auto rounded-md"
          />
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
           {/* Affiliate Button */}
           {affiliateLink ? (
             <Button asChild variant="default">
               <a href={affiliateLink} target="_blank" rel="noopener noreferrer">
                 {buttonText || "Découvrir l'offre"} {/* Use buttonText prop */}
               </a>
             </Button>
           ) : (
             <Button disabled>{buttonText || "Lien bientôt disponible"}</Button>
           )}
           {/* Proceed Button */}
           <Button onClick={handleProceed} variant="outline">
             Voir mon programme
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AffiliatePopup;