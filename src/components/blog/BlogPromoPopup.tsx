import React from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BlogPromoPopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

const BlogPromoPopup: React.FC<BlogPromoPopupProps> = ({ isOpen, onClose }) => {
  const handleProceed = () => {
    onClose(); // Ferme le popup avant la navigation
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] md:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Ton Coach Muscu Virtuel t'attend !
          </DialogTitle>
        </DialogHeader>
        <div className="my-4 flex justify-center">
          <img
            src="/popup-generateur-promo.jpg" // Assurez-vous d'ajouter cette image dans public/
            alt="Promotion du générateur de programme de musculation"
            className="max-w-full h-auto rounded-md shadow-lg"
            style={{ maxHeight: '250px' }} // Limite la hauteur de l'image
          />
        </div>
        <DialogDescription className="text-center text-base mb-6 px-4">
          Arrête de suivre des plans génériques ! Obtiens un <strong>programme de musculation 100% personnalisé</strong> et gratuit, adapté à TES objectifs, TON niveau et TON matériel disponible.
        </DialogDescription>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-3">
          <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
            Non merci
          </Button>
          <Link
            to="/"
            onClick={handleProceed}
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full sm:w-auto")}
          >
            Générer Mon Programme Gratuit !
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlogPromoPopup;