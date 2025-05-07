import React, { useState, useEffect } from 'react';
import ProgramForm, { FormData } from '@/components/ProgramForm';
import WorkoutProgram from '@/components/WorkoutProgram';
import AffiliatePopup from '@/components/AffiliatePopup';
import { ProgramGenerator, Program } from '@/lib/programGenerator';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

export type { Exercise, WorkoutDay, Program } from '@/lib/programGenerator';

const popupData = [
  {
    image: '/popup-placeholder-1.jpg',
    link: 'https://nmsquad.link/03olk',
    buttonText: 'Découvrir la whey de qualité',
    title: 'Nutrimuscle — Construis du muscle',
    description: '<b>Que du propre, du traçable et du performant.</b>\nLa whey Nutrimuscle, c’est du sérieux pour <b>des vrais résultats.</b>\n<b>Formulations haut de gamme, sans compromis.</b>',
  },
  {
    image: '/popup-placeholder-2.jpg',
    link: 'https://go.nordvpn.net/aff_c?offer_id=15&aff_id=122852&url_id=1172',
    buttonText: 'Sécuriser ma connexion',
    title: 'NordVPN — Ton chien protège ta maison… Qui protège ton Wi-Fi ?',
    description: '<b>Aujourd’hui, protéger sa connexion, c’est comme fermer sa porte à clé.</b>\nNordVPN, c’est le chien de garde numérique de <b>+15 millions d’utilisateurs.</b>\n<b>Jusqu’à -73 % de réduction + 4 mois offerts maintenant.</b>',
  },
  {
    image: '/popup-placeholder-3.jpg',
    link: 'https://ericflag.com/?ref=ebdudilx',
    buttonText: 'M’équiper pour progresser',
    title: 'Boutique Éric Flag — Transforme ton salon en salle de sport',
    description: '<b>Bandes élastiques, barres de traction, anneaux…</b>\n<b>Tout ce qu’il faut pour t’entraîner chez toi ou dehors.</b>\n<b>Du matériel minimaliste, solide, et stylé.</b>',
  },
  {
    image: '/popup-placeholder-4.jpg',
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
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPopupIndex, setSelectedPopupIndex] = useState<number | null>(null);
  const [showProgram, setShowProgram] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const fetchCount = async () => {
      const { data, error } = await supabase
        .from('global_counts')
        .select('count')
        .eq('name', 'program_generations')
        .single();
      if (error) {
        console.error('Error fetching global count:', error);
        setGeneratedCount(0);
      } else if (data) {
        setGeneratedCount(data.count);
      } else {
         setGeneratedCount(0);
      }
    };
    fetchCount();
  }, []);

  const incrementGlobalCounter = async () => {
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
          setGeneratedCount(newCount);
      }
  };

  const logProgramGeneration = async (data: FormData, program: Program) => {
    try {
      const { error } = await supabase.from('program_generation_logs').insert({
        form_data: data,
        program_title: program.title,
        program_description: program.description,
      });
      if (error) {
        console.error('Error logging program generation:', error);
        // Optionnel: toast pour l'erreur de logging, mais peut-être pas nécessaire pour l'utilisateur
      } else {
        console.log('Program generation logged successfully.');
      }
    } catch (e) {
      console.error('Exception logging program generation:', e);
    }
  };

  const logAffiliateLinkClick = async (popupIndex: number) => {
    if (popupIndex === null || !popupData[popupIndex]) {
      console.error('Invalid popupIndex for logging affiliate click');
      return;
    }
    const clickedPopup = popupData[popupIndex];
    try {
      const { error } = await supabase.from('affiliate_link_clicks').insert({
        popup_image_src: clickedPopup.image,
        affiliate_link: clickedPopup.link,
        popup_title: clickedPopup.title,
        popup_button_text: clickedPopup.buttonText,
      });
      if (error) {
        console.error('Error logging affiliate link click:', error);
      } else {
        console.log('Affiliate link click logged successfully for:', clickedPopup.title);
      }
    } catch (e) {
      console.error('Exception logging affiliate link click:', e);
    }
  };

  const handleGenerate = (data: FormData) => {
    setIsLoading(true);
    setFormData(data);
    setGeneratedProgram(null);
    setShowProgram(false);
    setIsPopupOpen(false);

    setTimeout(() => {
      try {
        const generator = new ProgramGenerator(data);
        const program = generator.generate();
        setGeneratedProgram(program);
        logProgramGeneration(data, program); // Log la génération

        if (data.email !== 'b') {
           incrementGlobalCounter();
        }

        const randomIndex = Math.floor(Math.random() * popupData.length);
        setSelectedPopupIndex(randomIndex);
        setIsPopupOpen(true);

      } catch (error) {
        console.error("Error generating program:", error);
        toast({
            title: "Erreur de génération",
            description: error instanceof Error ? error.message : "Une erreur inconnue est survenue.",
            variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleProceedToProgram = () => {
    setShowProgram(true);
    setTimeout(() => {
        const programElement = document.getElementById('workout-program');
        if (programElement) {
            programElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
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
      <header className="text-center mb-10 md:mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
          Générateur de Programme Personnalisé Musculation Gratuit 
          <span className="block text-xs text-muted-foreground font-normal mt-1">par Smoothie Banane Fraise 🍌🍓</span>
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Créez votre programme de musculation personnalisé en quelques clics avec notre <strong>générateur de programme personnalisé musculation gratuit</strong>. Obtenez un plan d'entraînement simple, rapide, et parfaitement adapté à vos objectifs, votre niveau et l'équipement dont vous disposez.
        </p>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto mt-2">
          Nos programmes de muscu personnalisés vous fourniront des résultats optimaux.
        </p>
         {generatedCount !== null && (
             <p className="mt-4 text-xl font-semibold text-primary animate-bounce-subtle">
                 {generatedCount} programmes générés !
             </p>
         )}
      </header>

      <main className="flex-grow flex items-center justify-center">
        {!generatedProgram && !isLoading && (
          <ProgramForm onGenerate={handleGenerate} isLoading={isLoading} />
        )}

        {isLoading && (
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

        {generatedProgram && !isLoading && !isPopupOpen && showProgram && (
          <WorkoutProgram
              program={generatedProgram}
              onReset={handleReset}
              formData={formData!}
          />
        )}
      </main>

      {isPopupOpen && selectedPopupIndex !== null && generatedProgram && (
          <AffiliatePopup
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            onProceed={handleProceedToProgram}
            imageSrc={popupData[selectedPopupIndex].image}
            affiliateLink={popupData[selectedPopupIndex].link}
            buttonText={popupData[selectedPopupIndex].buttonText}
            title={popupData[selectedPopupIndex].title}
            description={popupData[selectedPopupIndex].description}
            onAffiliateLinkClick={() => { // Passer la fonction de log ici
              if (selectedPopupIndex !== null) {
                logAffiliateLinkClick(selectedPopupIndex);
              }
            }}
          />
        )}

      <footer className="text-center mt-12 py-4 border-t">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Smoothie Banane Fraise - Votre <strong>générateur de programme personnalisé musculation gratuit</strong>. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
};

export default Index;