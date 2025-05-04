import React, { useState } from 'react';
import ProgramForm, { FormData } from '@/components/ProgramForm'; // Import FormData type
import WorkoutProgram from '@/components/WorkoutProgram';
import { ProgramGenerator, Program } from '@/lib/programGenerator'; // Import the generator logic
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton for loading state

// Types for Exercise and WorkoutDay are now likely defined within ProgramGenerator or a shared types file
// For clarity, let's assume they are exported from programGenerator or defined similarly
export type { Exercise, WorkoutDay, Program } from '@/lib/programGenerator';

const Index = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [generatedProgram, setGeneratedProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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