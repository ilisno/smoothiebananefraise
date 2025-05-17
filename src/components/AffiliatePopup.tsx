import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button"; // Import buttonVariants
import { cn } from "@/lib/utils"; // Import cn

type AffiliatePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  imageSrc: string;
  affiliateLink?: string;
  buttonText?: string; // Texte pour le bouton d'affiliation
  proceedButtonText?: string; // Nouveau: Texte pour le bouton "Proceed"
  title?: string;
  description?: string;
  onAffiliateLinkClick: () => void;
};

const AffiliatePopup: React.FC<AffiliatePopupProps> = ({
  isOpen,
  onClose,
  onProceed,
  imageSrc,
  affiliateLink,
  buttonText,
  proceedButtonText, // Utiliser la nouvelle prop
  title,
  description,
  onAffiliateLinkClick,
}) => {

  console.log("AffiliatePopup rendering with imageSrc:", imageSrc);

  const handleAffiliateClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onAffiliateLinkClick();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}> {/* Ajout de onOpenChange pour fermer avec la croix/echap */}
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
             <a
               href={affiliateLink}
               target="_blank"
               rel="noopener noreferrer"
               onClick={handleAffiliateClick}
               className={cn(buttonVariants({ variant: "default" }))}
             >
               {buttonText || "Découvrir l'offre"}
             </a>
           ) : (
             <Button disabled>{buttonText || "Lien bientôt disponible"}</Button>
           )}
           <Button onClick={onProceed} variant="outline">
             {proceedButtonText || "Continuer"} {/* Utilisation de la prop ou du texte par défaut */}
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AffiliatePopup;