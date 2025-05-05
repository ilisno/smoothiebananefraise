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
  affiliateLink?: string; // Optional for now
};

const AffiliatePopup: React.FC<AffiliatePopupProps> = ({
  isOpen,
  onClose,
  onProceed,
  imageSrc,
  affiliateLink,
}) => {

  const handleProceed = () => {
    onClose(); // Close the dialog first
    onProceed(); // Then trigger the proceed action
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]"> {/* Adjust max width as needed */}
        <DialogHeader>
          <DialogTitle>Offre Spéciale !</DialogTitle>
          {/* Optional description */}
          {/* <DialogDescription>
            Découvrez cette offre avant de voir votre programme.
          </DialogDescription> */}
        </DialogHeader>
        <div className="my-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt="Offre affiliée"
            className="w-full h-auto rounded-md object-contain" // Adjust styling as needed
          />
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
           {/* Affiliate Button (placeholder for now) */}
           {affiliateLink ? (
             <Button asChild variant="default">
               <a href={affiliateLink} target="_blank" rel="noopener noreferrer">
                 Découvrir l'offre
               </a>
             </Button>
           ) : (
             <Button disabled>Lien bientôt disponible</Button>
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