import React, { useState, useEffect } from 'react';
import ProgramForm, { FormData } from '@/components/ProgramForm'; // Import FormData type
import WorkoutProgram from '@/components/WorkoutProgram';
import { ProgramGenerator, Program } from '@/lib/programGenerator'; // Import the generator logic
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton for loading state
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client
import { useToast } from "@/components/ui/use-toast"; // Import useToast for notifications

// Types for Exercise and WorkoutDay are now likely defined within ProgramGenerator or a shared types file
// For clarity, let's assume they are exported from programGenerator or defined similarly
export type { Exercise, WorkoutDay, Program } from '@/lib/programGenerator';

const Index = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [generatedProgram, setGeneratedProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCount, setGeneratedCount] = useState<number | null>(null); // State for the global counter

  const { toast } = useToast(); // Initialize toast hook

  // Effect to fetch the initial count on component mount
  useEffect(() => {
    const fetchCount = async () => {
      const { data, error } = await supabase
        .from('global_counts')
        .select('count')
        .eq('name', 'program_generations')
        .single(); // Use single() as we expect only one row for this name

      if (error) {
        console.error('Error fetching global count:', error);
        // Optionally show an error toast, but maybe too noisy on load
        // toast({
        //     title: "Erreur",
        //     description: "Impossible de charger le compteur.",
        //     variant: "destructive",
        // });
      } else if (data) {
        setGeneratedCount(data.count);
        console.log('Fetched initial program count:', data.count);
      } else {
         // If no row exists, initialize the count state to 0
         setGeneratedCount(0);
         console.log('No initial program count found, starting at 0.');
      }
    };

    fetchCount();
  }, []); // Empty dependency array means this runs once on mount

  // Function to increment the counter in Supabase
  const incrementCounter = async () => {
      // Note: This client-side increment is simple but has race condition risks
      // if many users click at the exact same millisecond.
      // A more robust approach uses Supabase functions or database transactions.
      // For demonstration, we'll do a simple read-then-update.

      // First, get the current count
      const { data: currentData, error: fetchError } = await supabase
        .from('global_counts')
        .select('count')
        .eq('name', 'program_generations')
        .single();

      if (fetchError) {
          console.error('Error fetching count before increment:', fetchError);
          // Don't stop generation, but log the error
          return;
      }

      const currentCount = currentData ? currentData.count : 0;
      const newCount = currentCount + 1;

      // Then, update the count
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
          setGeneratedCount(newCount); // Update local state
      }
  };


  const handleGenerate = (data: FormData) => {
    setIsLoading(true);
    setFormData(data);
    setGeneratedProgram(null); // Clear previous program

    // Simulate generation time - replace with actual async call if needed
    setTimeout(() => {
      try {
        const generator = new ProgramGenerator(data);
        const program = generator.generate();
        setGeneratedProgram(program);
        console.log("Generated Program:", program);

        // *** Increment the counter AFTER successful generation ***
        incrementCounter();

        // Scroll to the program section smoothly after a short delay for rendering
        setTimeout(() => {
            const programElement = document.getElementById('workout-program');
            if (programElement) {
                programElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100); // Small delay

      } catch (error) {
        console.error("Error generating program:", error);
        // Optionally show an error toast to the user
        // showError("Une erreur est survenue lors de la génération."); // Example
        toast({
            title: "Erreur de génération",
            description: error instanceof Error ? error.message : "Une erreur inconnue est survenue lors de la génération.",
            variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }, 1500); // Simulate 1.5 seconds delay
  };

  const handleReset = () => {
    setGeneratedProgram(null);
    setFormData(null);
    setIsLoading(false); // Ensure loading is reset
    // Scroll back to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 flex flex-col min-h-screen">
      {/* Header Section */}
      <header className="text-center mb-10 md:mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
          Smoothie Banane Fraise 🍌🍓
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Créez votre programme de musculation personnalisé en quelques clics. Simple, rapide et basé sur vos objectifs.
        </p>
         {/* Display the global counter */}
         {generatedCount !== null && (
             <p className="mt-4 text-xl font-semibold text-primary animate-bounce-subtle"> {/* Use primary color and subtle bounce */}
                 {generatedCount} programmes générés !
             </p>
         )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center">
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

        {generatedProgram && !isLoading && (
          <WorkoutProgram
              program={generatedProgram}
              onReset={handleReset}
              formData={formData} // Pass form data for potential use in WorkoutProgram
          />
        )}
      </main>

      {/* Footer Section */}
      <footer className="text-center mt-12 py-4 border-t">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Smoothie Banane Fraise - Générateur de programme simple.
        </p>
      </footer>
    </div>
  );
};

export default Index;