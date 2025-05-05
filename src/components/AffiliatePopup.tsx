import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  // Removed DialogClose import
  // import DialogClose from "@/components/ui/dialog";
  DialogDescription, // Import DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type AffiliatePopupProps = {
  isOpen: boolean;
  onClose: () => void; // Function to close the dialog (still needed for the "Voir mon programme" button)
  onProceed: () => void; // Function to proceed after closing
  imageSrc: string;
  affiliateLink?: string;
  buttonText?: string; // Add buttonText prop
  title?: string; // Add title prop
  description?: string; // Add description prop
};

const AffiliatePopup: React.FC<AffiliatePopupProps> = ({
  isOpen,
  onClose,
  onProceed,
  imageSrc,
  affiliateLink,
  buttonText, // Receive buttonText prop
  title, // Receive title prop
  description, // Receive description prop
}) => {

  // Log the image source when the component renders or updates
  console.log("AffiliatePopup rendering with imageSrc:", imageSrc);

  const handleProceed = () => {
    onClose(); // Close the dialog first
    onProceed(); // Then trigger the proceed action
  };

  return (
    // Removed the misplaced comment
    <Dialog open={isOpen}>
      {/* Adjusted max width to sm:max-w-[350px] */}
      {/* Added hide-dialog-close class */}
      <DialogContent className="sm:max-w-[350px] md:max-w-[400px] hide-dialog-close"> {/* Adjust max width as needed */}
        <DialogHeader>
          {/* Wrap children in a Fragment to potentially fix React.Children.only error */}
          <>
            {/* Use the title prop for the DialogTitle */}
            <DialogTitle>{title || "Offre Spéciale !"}</DialogTitle>
            {/* Use the description prop for the DialogDescription */}
            {/* Increased mt-2 for more spacing and added whitespace-pre-wrap */}
            {/* Use dangerouslySetInnerHTML to render HTML tags like <b> */}
            {description && (
              <DialogDescription
                className="mt-2 whitespace-pre-wrap" // Reverted mt-4 to mt-2
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
          </>
        </DialogHeader>
        <div className="my-4 flex justify-center"> {/* Center the image container */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt="Offre affiliée"
            // Reverted styling: use w-full h-auto object-contain
            // Kept animate-bounce-subtle class for animation
            className="w-full h-auto rounded-md object-contain animate-bounce-subtle"
          />
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
           {/* Affiliate Button */}
           {affiliateLink ? (
             <Button asChild variant="default"> {/* Removed sm:flex-1 */}
               <a href={affiliateLink} target="_blank" rel="noopener noreferrer">
                 {buttonText || "Découvrir l'offre"}
               </a>
             </Button>
           ) : (
             <Button disabled>{buttonText || "Lien bientôt disponible"}</Button> // Removed sm:flex-1
           )}
           {/* Proceed Button */}
           <Button onClick={handleProceed} variant="outline"> {/* Removed sm:flex-1 */}
             Voir mon programme
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AffiliatePopup;