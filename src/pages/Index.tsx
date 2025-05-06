import React, { useState, useEffect } from 'react';
import ProgramForm, { FormData } from '@/components/ProgramForm';
import WorkoutProgram from '@/components/WorkoutProgram';
import AffiliatePopup from '@/components/AffiliatePopup'; // Import the new component
import { ProgramGenerator, Program } from '@/lib/programGenerator';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

export type { Exercise, WorkoutDay, Program } from '@/lib/programGenerator';

// Updated popup data with affiliate links, button text, titles, and descriptions
const popupData = [
  {
    image: '/popup-placeholder-1.jpg',
    link: 'https://nmsquad.link/03olk',
    buttonText: 'Découvrir la whey de qualité',
    title: 'Nutrimuscle — Construis du muscle', // Removed quotes
    description: '<b>Que du propre, du traçable et du performant.</b>\nLa whey Nutrimuscle, c’est du sérieux pour <b>des vrais résultats.</b>\n<b>Formulations haut de gamme, sans compromis.</b>', // Added description with bold tags
  },
  {
    image: '/popup-placeholder-2.jpg',
    link: 'https://go.nordvpn.net/aff_c?offer_id=15&aff_id=122852&url_id=1172',
    buttonText: 'Sécuriser ma connexion',
    title: 'NordVPN — Ton chien protège ta maison… Qui protège ton Wi-Fi ?', // Removed quotes
    description: '<b>Aujourd’hui, protéger sa connexion, c’est comme fermer sa porte à clé.</b>\nNordVPN, c’est le chien de garde numérique de <b>+15 millions d’utilisateurs.</b>\n<b>Jusqu’à -73 % de réduction + 4 mois offerts maintenant.</b>', // Added description with bold tags
  },
  {
    image: '/popup-placeholder-3.jpg',
    link: 'https://ericflag.com/?ref=ebdudilx',
    buttonText: 'M’équiper pour progresser',
    title: 'Boutique Éric Flag — Transforme ton salon en salle de sport', // Removed quotes
    description: '<b>Bandes élastiques, barres de traction, anneaux…</b>\n<b>Tout ce qu’il faut pour t’entraîner chez toi ou dehors.</b>\n<b>Du matériel minimaliste, solide, et stylé.</b>', // Added description with bold tags
  },
  // Added BoursoBank popup
  {
    image: '/popup-placeholder-4.jpg', // Using a new placeholder image path
    link: 'https://bour.so/p/pC1PYLtQLf6',
    buttonText: '→ Profiter de l’offre maintenant',
    title: 'BoursoBank — Change de banque, gagne du cash',
    description: 'Tu peux toucher jusqu’à 200€ de prime rien qu’en ouvrant ton compte.\nC’est la banque la moins chère de France, et c’est pas nous qui le disons.\nApplication fluide, carte gratuite, zéro paperasse inutile.',
  },
];

const Index = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [generatedProgram, setGeneratedProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCount, setGeneratedCount] = useState<number | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State for popup visibility
  const [selectedPopupIndex, setSelectedPopupIndex] = useState<number | null>(null); // State for selected popup
  const [showProgram, setShowProgram] = useState(false); // State to control program visibility after popup

  const { toast } = useToast();

  useEffect(() => {
    const fetchCount = async () => {
      console.log('Fetching initial program count...');
      const { data, error } = await supabase
        .from('global_counts')
        .select('count')
        .eq('name', 'program_generations')
        .single();

      console.log('Supabase fetch result:', { data, error });

      if (error) {
        console.error('Error fetching global count:', error);
        setGeneratedCount(0);
        console.log('Set generated count to 0 due to fetch error.');
      } else if (data) {
        setGeneratedCount(data.count);
        console.log('Set generated count to fetched value:', data.count);
      } else {
         setGeneratedCount(0);
         console.log('Set generated count to 0 as no data returned (row might not exist).');
      }
    };

    fetchCount();
  }, []);

  const incrementCounter = async () => {
      const { data: currentData, error: fetchError } = await supabase
        .from('global_counts')
        .select('count')
        .eq('name', 'program_generations')
        .single();

      if (fetchError) {
          console.error('Error fetching count before increment:', fetchError);
          return;
      }

      const currentCount = currentData ? currentData.count : 0;
      const newCount = currentCount + 1;

      const { error: updateError } = await supabase
        .from('global_counts')
        .update({ count: newCount })
        .eq('name', 'program_generations');

      if (updateError) {
          console.error('Error incrementing global count:', updateError);
           toast({
               title: "Erreur Compteur",
               description: "Impossible de mettre à jour le compteur global.",
               variant: "destructive",
           });
      } else {
          console.log('Global program count incremented to:', newCount);
          setGeneratedCount(newCount);
      }
  };


  const handleGenerate = (data: FormData) => {
    setIsLoading(true);
    setFormData(data);
    setGeneratedProgram(null); // Clear previous program
    setShowProgram(false); // Hide program view
    setIsPopupOpen(false); // Ensure popup is closed initially

    // Simulate generation time
    setTimeout(() => {
      try {
        const generator = new ProgramGenerator(data);
        const program = generator.generate();
        setGeneratedProgram(program); // Store the generated program
        console.log("Generated Program:", program);

        // Increment counter only if email is not 'b'
        if (data.email !== 'b') {
           incrementCounter();
        }

        // --- Popup Logic ---
        const randomIndex = Math.floor(Math.random() * popupData.length);
        setSelectedPopupIndex(randomIndex);
        setIsPopupOpen(true); // Open the popup
        // --- End Popup Logic ---

      } catch (error) {
        console.error("Error generating program:", error);
        toast({
            title: "Erreur de génération",
            description: error instanceof Error ? error.message : "Une erreur inconnue est survenue lors de la génération.",
            variant: "destructive",
        });
      } finally {
        setIsLoading(false); // Stop loading indicator *before* showing popup
      }
    }, 1500);
  };

  const handleProceedToProgram = () => {
    setShowProgram(true); // Set flag to show the program
    // Scroll to the program section smoothly
    setTimeout(() => {
        const programElement = document.getElementById('workout-program');
        if (programElement) {
            programElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100); // Small delay for rendering
  };

  const handleReset = () => {
    setGeneratedProgram(null);
    setFormData(null);
    setIsLoading(false);
    setIsPopupOpen(false);
    setSelectedPopupIndex(null);
    setShowProgram(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 flex flex-col min-h-screen">
      {/* Header Section */}
      <header className="text-center mb-10 md:mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
          Générateur de Programme Personnalisé Musculation Gratuit <span className="block text-3xl md:text-4xl font-normal mt-1">par Smoothie Banane Fraise 🍌🍓</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Créez votre programme de musculation personnalisé en quelques clics avec notre <strong>générateur de programme personnalisé musculation gratuit</strong>. Obtenez un plan d'entraînement simple, rapide, et parfaitement adapté à vos objectifs, votre niveau et l'équipement dont vous disposez.
        </p>
        <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
          Que vous soyez débutant cherchant à démarrer, ou un pratiquant avancé visant de nouveaux sommets, notre outil vous aide à structurer vos séances de sport. Fini les entraînements génériques ! Recevez un plan de musculation détaillé, semaine après semaine, pour progresser efficacement. Notre <strong>générateur de programme de musculation</strong> est conçu pour être intuitif et vous fournir des résultats, le tout <strong>gratuitement</strong>.
        </p>
         {generatedCount !== null && (
             <p className="mt-4 text-xl font-semibold text-primary animate-bounce-subtle">
                 {generatedCount} programmes générés !
             </p>
         )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center">
        {/* Show Form if no program generated and not loading */}
        {!generatedProgram && !isLoading && (
          <ProgramForm onGenerate={handleGenerate} isLoading={isLoading} />
        )}

        {isLoading && (
          // Simple Skeleton Loading State
          <div className="w-full max-w-2xl mx-auto space-y-6">
             <Skeleton className="h-16 w-full" />
             <Skeleton className="h-10 w-3/4" />
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-20 w-full" />
             <Skeleton className="h-10 w-1/2" />
             <Skeleton className="h-10 w-1/2" />
             <Skeleton className="h-24 w-full" />
             <Skeleton className="h-12 w-full" />
          </div>
        )}

        {/* Show Program only if generated, not loading, popup closed, and proceed flag is true */}
        {generatedProgram && !isLoading && !isPopupOpen && showProgram && (
          <WorkoutProgram
              program={generatedProgram}
              onReset={handleReset}
              formData={formData!} // formData will be set if program is generated
          />
        )}
      </main>

      {/* Affiliate Popup */}
      {isPopupOpen && selectedPopupIndex !== null && generatedProgram && (
          <AffiliatePopup
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)} // Close the dialog
            onProceed={handleProceedToProgram} // Trigger showing the program
            imageSrc={popupData[selectedPopupIndex].image}
            affiliateLink={popupData[selectedPopupIndex].link}
            buttonText={popupData[selectedPopupIndex].buttonText} // Pass button text
            title={popupData[selectedPopupIndex].title} // Pass title
            description={popupData[selectedPopupIndex].description} // Pass description
          />
        )}


      {/* Footer Section */}
      <footer className="text-center mt-12 py-4 border-t">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Smoothie Banane Fraise - Votre <strong>générateur de programme personnalisé musculation gratuit</strong>. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
};

export default Index;