import React, { useState } from 'react';
import ProgramForm from '@/components/ProgramForm';
import WorkoutProgram from '@/components/WorkoutProgram'; // We'll create this next
import { z } from 'zod'; // Import Zod if you need the type

// Define the type for the form data based on ProgramForm's schema
// You might need to export the schema from ProgramForm or redefine it here
// For simplicity, let's define a basic type here, ensure it matches ProgramForm
type FormData = {
  email: string;
  goal: string;
  level: string;
  split: string;
  days: number;
  duration: number;
  equipment: {
    barre_halteres: boolean;
    machines_guidees: boolean;
    poids_corp: boolean;
    elastiques: boolean;
    kettlebells: boolean;
  };
};

// Define a type for the generated program structure (example)
export type Exercise = {
  name: string;
  sets: number;
  reps: string | number; // Can be a range like "8-12" or a number
  rpe?: number; // Rate of Perceived Exertion
  rest?: string; // e.g., "60-90s"
};

export type WorkoutDay = {
  day: number; // e.g., 1, 2, 3...
  title: string; // e.g., "Push", "Legs", "Full Body A"
  exercises: Exercise[];
};

export type Program = {
  title: string;
  description: string;
  schedule: WorkoutDay[];
};


const Index = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [generatedProgram, setGeneratedProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simplified program generation logic (Placeholder)
  const generateProgram = (data: FormData): Program => {
    console.log("Generating program with data:", data);
    // --- This is where the complex logic would go ---
    // Based on data.goal, data.level, data.split, data.days, data.equipment...
    // Select exercises, determine sets/reps/RPE, structure the week.

    // Example simplified generation:
    let programTitle = `Programme ${data.goal} - ${data.level} - ${data.split}`;
    let programDescription = `Programme généré pour ${data.days} jours/semaine, séances de ${data.duration} min.`;
    let schedule: WorkoutDay[] = [];

    for (let i = 1; i <= data.days; i++) {
        let dayTitle = `Jour ${i}`;
        let exercises: Exercise[] = [];

        // Very basic example based on split
        if (data.split === 'ppl') {
            if (i % 3 === 1) dayTitle = `Push ${Math.ceil(i/3)}`;
            else if (i % 3 === 2) dayTitle = `Pull ${Math.ceil(i/3)}`;
            else dayTitle = `Legs ${Math.ceil(i/3)}`;
        } else if (data.split === 'half_body') {
             dayTitle = i % 2 === 1 ? `Haut du corps ${Math.ceil(i/2)}` : `Bas du corps ${Math.ceil(i/2)}`;
        } else {
            dayTitle = `Full Body ${String.fromCharCode(64 + i)}`; // A, B, C...
        }

        // Add some sample exercises (replace with real logic)
        exercises.push({ name: "Exercice Principal", sets: 3, reps: data.goal === 'force' ? 5 : '8-12', rpe: data.goal === 'force' ? 7 : 9, rest: "90-120s" });
        exercises.push({ name: "Exercice Assistance 1", sets: 3, reps: '10-15', rpe: 10, rest: "60s" });
        exercises.push({ name: "Exercice Assistance 2", sets: 3, reps: '12-15', rpe: 10, rest: "60s" });
         if (data.equipment.barre_halteres) {
             exercises.unshift({ name: "Squat ou Deadlift (si barre)", sets: data.goal === 'force' ? 3 : 4, reps: data.goal === 'force' ? 3 : 8, rpe: data.goal === 'force' ? 6 : 8, rest: "120-180s" });
         }
         if (data.equipment.poids_corp) {
             exercises.push({ name: "Pompes ou Tractions (si possible)", sets: 3, reps: 'Max', rpe: 9, rest: "90s" });
         }


        schedule.push({ day: i, title: dayTitle, exercises });
    }

    return { title: programTitle, description: programDescription, schedule };
    // --- End of complex logic section ---
  };


  const handleGenerate = (data: FormData) => {
    setIsLoading(true);
    setFormData(data);
    // Simulate generation time
    setTimeout(() => {
      const program = generateProgram(data);
      setGeneratedProgram(program);
      setIsLoading(false);
      // Scroll to the program section smoothly
      const programElement = document.getElementById('workout-program');
      if (programElement) {
          programElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 1500); // Simulate 1.5 seconds delay
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {!generatedProgram ? (
        <ProgramForm onGenerate={handleGenerate} isLoading={isLoading} />
      ) : (
        <WorkoutProgram
            program={generatedProgram}
            onReset={() => {
                setGeneratedProgram(null);
                setFormData(null);
                // Scroll back to top smoothly
                 window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            formData={formData} // Pass form data for potential use in WorkoutProgram
        />
      )}
    </div>
  );
};

export default Index;