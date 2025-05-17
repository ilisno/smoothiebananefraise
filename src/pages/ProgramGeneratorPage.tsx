import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ProgramForm, { FormData } from '@/components/ProgramForm';
import WorkoutProgram, { Program } from '@/components/WorkoutProgram';
import { ProgramGenerator } from '@/lib/programGenerator';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react'; // Import Loader2 for loading state

const ProgramGeneratorPage: React.FC = () => {
  const [mode, setMode] = useState<'form' | 'program'>('form');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (data: FormData) => {
    setIsLoading(true);
    setFormData(data); // Store form data
    setProgram(null); // Clear previous program

    try {
      // Generate the program
      const generator = new ProgramGenerator(data);
      const generatedProgram = generator.generate();
      setProgram(generatedProgram);

      // Log the generation to Supabase
      const { error: logError } = await supabase
        .from('program_generation_logs')
        .insert({
          user_email: data.email === 'b' ? null : data.email, // Don't log test email 'b'
          form_data: data,
          program_title: generatedProgram.title,
          program_description: generatedProgram.description,
        });

      if (logError) {
        console.error('Error logging program generation:', logError);
        // Continue even if logging fails, but show a toast
        toast({
          title: "Erreur d'enregistrement",
          description: "Votre programme a été généré, mais nous n'avons pas pu l'enregistrer pour le moment.",
          variant: "destructive",
        });
      } else {
         console.log('Program generation logged successfully.');
         toast({
            title: "Programme généré !",
            description: "Votre programme personnalisé est prêt.",
         });
      }

      setMode('program'); // Switch to program view

    } catch (error) {
      console.error('Error generating or logging program:', error);
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
      toast({
        title: "Erreur de génération",
        description: `Impossible de générer le programme : ${errorMessage}`,
        variant: "destructive",
      });
      // Stay in form mode or reset
      setMode('form');
      setFormData(null);
      setProgram(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMode('form');
    setFormData(null);
    setProgram(null);
  };

  return (
    <>
      <Helmet>
        <title>Générateur de Programme Personnalisé Musculation Gratuit | Smoothie Banane Fraise</title>
        <meta name="description" content="Créez votre programme de musculation personnalisé et gratuit avec notre générateur. Adapté à vos objectifs, niveau et équipement pour des résultats optimaux. Obtenez un plan d'entraînement sur mesure dès maintenant !" />
        <meta name="keywords" content="générateur programme musculation, programme musculation personnalisé, musculation gratuit, plan entraînement musculation, entraînement personnalisé, fitness, sport, objectifs musculation, programme sportif gratuit, créer son programme de sport" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        {mode === 'form' && (
          <ProgramForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        )}

        {mode === 'program' && program && formData && (
          <WorkoutProgram program={program} onReset={handleReset} formData={formData} />
        )}

        {/* Optional: Add a loading indicator if needed outside the form */}
        {isLoading && mode === 'form' && (
             <div className="mt-8 text-center">
                <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">Génération du programme...</p>
             </div>
        )}
      </div>
    </>
  );
  };

export default ProgramGeneratorPage;