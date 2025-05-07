import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type AffiliatePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  imageSrc: string;
  affiliateLink?: string;
  buttonText?: string;
  title?: string;
  description?: string;
  onAffiliateLinkClick: () => void; // Nouvelle prop pour gérer le clic sur le lien affilié
};

const AffiliatePopup: React.FC<AffiliatePopupProps> = ({
  isOpen,
  onClose,
  onProceed,
  imageSrc,
  affiliateLink,
  buttonText,
  title,
  description,
  onAffiliateLinkClick, // Utiliser la nouvelle prop
}) => {

  console.log("AffiliatePopup rendering with imageSrc:", imageSrc);

  const handleProceed = () => {
    onClose();
    onProceed();
  };

  const handleAffiliateClick = () => {
    onAffiliateLinkClick(); // Appeler le callback fourni par le parent
    // Le lien s'ouvrira toujours grâce au `<a>` tag
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[400px] md:max-w-[450px] hide-dialog-close">
        <DialogHeader>
          <DialogTitle>{title || "Offre Spéciale !"}</DialogTitle>
          {description && (
            <DialogDescription
              className="mt-4 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </DialogHeader>
        <div className="my-4 flex justify-center">
          <img
            src={imageSrc}
            alt="Offre affiliée"
            className="max-w-full h-auto rounded-md animate-bounce-subtle"
          />
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
           {affiliateLink ? (
             <Button asChild variant="default" onClick={handleAffiliateClick}> {/* Appeler handleAffiliateClick ici */}
               <a href={affiliateLink} target="_blank" rel="noopener noreferrer">
                 {buttonText || "Découvrir l'offre"}
               </a>
             </Button>
           ) : (
             <Button disabled>{buttonText || "Lien bientôt disponible"}</Button>
           )}
           <Button onClick={handleProceed} variant="outline">
             Voir mon programme
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AffiliatePopup;