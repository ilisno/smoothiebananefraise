import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from 'react-router-dom'; // Import useNavigate

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription as CardDescriptionShadcn } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Import Accordion components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Import Table components
import { showSuccess, showError } from '@/utils/toast'; // Import toast utilities
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client
import { usePopup } from '@/contexts/PopupContext'; // Import usePopup hook

// Define the schema for form validation
const formSchema = z.object({
  objectif: z.enum(["Prise de Masse", "Sèche / Perte de Gras", "Powerlifting", "Powerbuilding"], {
    required_error: "Veuillez sélectionner un objectif principal.",
  }),
  experience: z.enum(["Débutant (< 1 an)", "Intermédiaire (1-3 ans)", "Avancé (3+ ans)"], {
    required_error: "Veuillez sélectionner votre niveau d'expérience.",
  }),
  split: z.enum(["Full Body (Tout le corps)", "Half Body (Haut / Bas)", "Push Pull Legs", "Autre / Pas de préférence"], {
    required_error: "Veuillez sélectionner un type de split.",
  }),
  joursEntrainement: z.coerce.number({
    required_error: "Veuillez indiquer le nombre de jours d'entraînement.",
    invalid_type_error: "Veuillez entrer un nombre valide.",
  }).min(1, { message: "Doit être au moins 1." }).max(7, { message: "Doit être au maximum 7." }),
  dureeMax: z.coerce.number({
    required_error: "Veuillez indiquer la durée maximale par séance.",
    invalid_type_error: "Veuillez entrer un nombre valide.",
  }).min(15, { message: "Doit être au moins 15 minutes." }).max(180, { message: "Doit être au maximum 180 minutes." }),
  materiel: z.array(z.string()).optional(), // Array of selected equipment
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }).or(z.literal("b")), // Allow "b" or a valid email
});

// Define a type for the program structure
type Program = {
  title: string;
  description: string;
  weeks: {
    weekNumber: number;
    days: {
      dayNumber: number;
      exercises: { name: string; sets: string; reps: string; notes?: string }[];
    }[];
  }[];
};

// --- Simplified Client-Side Program Generation Logic ---
// NOTE: This is a basic placeholder. A real generator would be much more complex.
const generateProgramClientSide = (values: z.infer<typeof formSchema>): Program => {
  const { objectif, experience, split, joursEntrainement, materiel, dureeMax } = values;

  const baseReps = objectif === "Powerlifting" ? "3-5" : (objectif === "Sèche / Perte de Gras" ? "12-15" : "8-12");
  const baseSets = 3; // Use number for calculations

  // Exercise list with type and muscle group
  const allExercises = [
    { name: "Squat Barre", muscleGroup: "Jambes", type: "compound", equipment: ["barre-halteres"] },
    { name: "Soulevé de Terre Roumain", muscleGroup: "Jambes", type: "compound", equipment: ["barre-halteres"] },
    { name: "Développé Couché", muscleGroup: "Pectoraux", type: "compound", equipment: ["barre-halteres"] },
    { name: "Développé Incliné Haltères", muscleGroup: "Pectoraux", type: "compound", equipment: ["barre-halteres"] },
    { name: "Tractions", muscleGroup: "Dos", type: "compound", equipment: ["poids-corps"] },
    { name: "Tractions australiennes", muscleGroup: "Dos", type: "compound", equipment: ["poids-corps"] },
    { name: "Dips", muscleGroup: "Triceps", type: "compound", equipment: ["poids-corps"] }, // Renamed Dips
    { name: "Pompes", muscleGroup: "Pectoraux", type: "compound", equipment: [] },
    { name: "Rowing Barre", muscleGroup: "Dos", type: "compound", equipment: ["barre-halteres"] },
    { name: "Presse à Cuisses", muscleGroup: "Jambes", type: "compound", equipment: ["machines-guidees"] },
    { name: "Fentes Haltères", muscleGroup: "Jambes", type: "compound", equipment: ["barre-halteres"] },
    { name: "Développé Militaire Barre", muscleGroup: "Épaules", type: "compound", equipment: ["barre-halteres"] },
    { name: "Écartés Poulie", muscleGroup: "Pectoraux", type: "isolation", equipment: ["machines-guidees"] },
    { name: "Tirage Vertical Machine", muscleGroup: "Dos", type: "compound", equipment: ["machines-guidees"] },
    { name: "Élévations Latérales Haltères", muscleGroup: "Épaules", type: "isolation", equipment: ["barre-halteres"] },
    { name: "Curl Biceps Barre", muscleGroup: "Biceps", type: "isolation", equipment: ["barre-halteres"] },
    { name: "Extension Triceps Poulie Haute", muscleGroup: "Triceps", type: "isolation", equipment: ["machines-guidees"] },
    { name: "Crunchs", muscleGroup: "Abdos", type: "isolation", equipment: [] }, // Added Crunchs
    { name: "Leg Raises", muscleGroup: "Abdos", type: "isolation", equipment: [] }, // Added Leg Raises
    { name: "Leg Extension", muscleGroup: "Jambes", type: "isolation", equipment: ["machines-guidees"] },
    { name: "Leg Curl", muscleGroup: "Jambes", type: "isolation", equipment: ["machines-guidees"] },
  ];

  // Define "big strength" exercises for RPE calculation
  const bigStrengthExercises = ["Squat Barre", "Soulevé de Terre Roumain", "Développé Couché", "Développé Militaire Barre"];
  // Define other compound exercises that are not "big strength"
  const otherCompoundExercises = allExercises.filter(ex => ex.type === 'compound' && !bigStrengthExercises.includes(ex.name));
  // Define isolation exercises
  const isolationExercises = allExercises.filter(ex => ex.type === 'isolation');


  // Filter exercises based on available equipment
  const availableExercises = allExercises.filter(ex =>
    ex.equipment.length === 0 || (materiel && ex.equipment.some(eq => materiel.includes(eq)))
  );

  const program: Program = {
    title: `Programme ${objectif} - ${experience}`,
    description: `Programme généré pour ${joursEntrainement} jours/semaine, split ${split}. Durée max par séance: ${dureeMax} minutes.`,
    weeks: [],
  };

  // Define muscle groups for each split type
  const splitMuscles: { [key: string]: string[][] } = {
      "Full Body (Tout le corps)": [["Jambes", "Pectoraux", "Dos", "Épaules", "Biceps", "Triceps", "Abdos"]], // All muscles each day
      "Half Body (Haut / Bas)": [["Pectoraux", "Dos", "Épaules", "Biceps", "Triceps"], ["Jambes", "Abdos"]], // Upper/Lower split
      "Push Pull Legs": [["Pectoraux", "Épaules", "Triceps"], ["Dos", "Biceps"], ["Jambes", "Abdos"]], // PPL split
      "Autre / Pas de préférence": [["Jambes", "Pectoraux", "Dos", "Épaules", "Biceps", "Triceps", "Abdos"]], // Default to Full Body logic
  };

  const selectedSplitMuscles = splitMuscles[split] || splitMuscles["Autre / Pas de préférence"];
  const numSplitDays = selectedSplitMuscles.length;

  // Define large muscle groups for volume tracking
  const largeMuscleGroups = ["Jambes", "Pectoraux", "Dos", "Épaules"];
  const weeklyVolumeCap = 15; // Max sets per week for large muscle groups

  // Generate 4 weeks
  for (let weekNum = 1; weekNum <= 4; weekNum++) {
    const week: Program['weeks'][number] = {
      weekNumber: weekNum,
      days: [],
    };

    // Initialize weekly volume tracker for this week
    const weeklyVolume: { [key: string]: number } = {};
    largeMuscleGroups.forEach(group => weeklyVolume[group] = 0);


    // Generate days based on joursEntrainement
    for (let dayIndex = 0; dayIndex < joursEntrainement; dayIndex++) {
      const day: Program['weeks'][number]['days'][number] = {
        dayNumber: dayIndex + 1,
        exercises: [],
      };

      // Determine which muscle groups to target based on the split and day index
      const targetMuscleGroups = selectedSplitMuscles[dayIndex % numSplitDays];

      let dayExercises: typeof allExercises = [];
      const addedExerciseNames = new Set<string>(); // To track added exercises

      // Helper to add exercise if available, targets muscle group, not already added, and respects volume cap
      const tryAddExercise = (exerciseName: string, muscleGroup: string, type: 'compound' | 'isolation') => {
          const exercise = availableExercises.find(ex =>
              ex.name === exerciseName &&
              ex.muscleGroup === muscleGroup &&
              ex.type === type &&
              !addedExerciseNames.has(ex.name)
          );

          if (exercise) {
              // Check volume cap only for large muscle groups
              if (largeMuscleGroups.includes(exercise.muscleGroup)) {
                  if (weeklyVolume[exercise.muscleGroup] + baseSets > weeklyVolumeCap) {
                      console.log(`Skipping ${exercise.name} due to weekly volume cap for ${exercise.muscleGroup}`);
                      return false; // Cannot add due to cap
                  }
                  weeklyVolume[exercise.muscleGroup] += baseSets; // Add sets to weekly volume
              }

              dayExercises.push(exercise);
              addedExerciseNames.add(exercise.name);
              console.log(`Added ${exercise.name} for ${exercise.muscleGroup}. Weekly volume for ${exercise.muscleGroup}: ${weeklyVolume[exercise.muscleGroup] || 0}`);
              return true; // Exercise added
          }
          return false; // Exercise not available or already added
      };

      // --- Prioritized Exercise Selection for the Day ---

      // 1. Add "Big Strength" compounds if targeted and possible
      bigStrengthExercises.forEach(exName => {
          const exercise = allExercises.find(e => e.name === exName);
          if (exercise && targetMuscleGroups.includes(exercise.muscleGroup)) {
              tryAddExercise(exName, exercise.muscleGroup, 'compound');
          }
      });

      // 2. Ensure Biceps and Triceps isolation if targeted and possible
      if (targetMuscleGroups.includes("Biceps")) {
          tryAddExercise("Curl Biceps Barre", "Biceps", "isolation");
          // Could add a fallback if Barre Curl isn't available, e.g., try Dumbbell Curl
      }
       if (targetMuscleGroups.includes("Triceps")) {
          tryAddExercise("Extension Triceps Poulie Haute", "Triceps", "isolation");
           // Could add a fallback if Pulley Extension isn't available, e.g., try Overhead Extension
      }
       if (targetMuscleGroups.includes("Abdos")) {
          // Add at least one ab exercise if targeted
          tryAddExercise("Crunchs", "Abdos", "isolation") || tryAddExercise("Leg Raises", "Abdos", "isolation");
      }


      // 3. Add other Compound exercises if targeted and possible
      otherCompoundExercises.forEach(ex => {
          if (targetMuscleGroups.includes(ex.muscleGroup)) {
              tryAddExercise(ex.name, ex.muscleGroup, 'compound');
          }
      });

      // 4. Add other Isolation exercises if targeted and possible (excluding Biceps/Triceps/Abdos already prioritized)
      isolationExercises.filter(ex => !["Biceps", "Triceps", "Abdos"].includes(ex.muscleGroup)).forEach(ex => {
           if (targetMuscleGroups.includes(ex.muscleGroup)) {
              tryAddExercise(ex.name, ex.muscleGroup, 'isolation');
          }
      });


      // Simple limit on total exercises per day (e.g., max 8 exercises)
      const finalDayExercises = dayExercises.slice(0, 8);


      // Format exercises for the program structure and calculate RPE
      day.exercises = finalDayExercises.map(ex => {
        let rpeNote = "";
        if (ex.type === "isolation") {
          rpeNote = "RPE 10";
        } else if (bigStrengthExercises.includes(ex.name)) {
          // RPE progression for big strength: 5 -> 6 -> 8 -> 10
          const rpeMap: { [key: number]: number } = { 1: 5, 2: 6, 3: 8, 4: 10 };
          rpeNote = `RPE ${rpeMap[weekNum] || 5}`; // Default to 5 if weekNum is unexpected
        } else {
          // RPE progression for other compounds: 7 -> 7.5 -> 8 -> 9
           const rpeMap: { [key: number]: number | string } = { 1: 7, 2: 7.5, 3: 8, 4: 9 };
           rpeNote = `RPE ${rpeMap[weekNum] || 7}`; // Default to 7 if weekNum is unexpected
        }

        return {
          name: ex.name,
          sets: baseSets.toString(), // Convert back to string for display
          reps: baseReps,
          notes: rpeNote
        };
      });

      week.days.push(day);
    }
    program.weeks.push(week);
  }

  return program;
};
// --- End of Simplified Client-Side Program Generation Logic ---


const ProgrammeGenerator: React.FC = () => {
  const [generatedProgram, setGeneratedProgram] = useState<Program | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(null); // State to hold form data temporarily

  const { showRandomPopup } = usePopup(); // Use the showRandomPopup hook
  const navigate = useNavigate(); // Hook for navigation

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      objectif: undefined,
      experience: undefined,
      split: undefined,
      joursEntrainement: 3,
      dureeMax: 60,
      materiel: [],
      email: "",
    },
  });

  // Define materielOptions here, before it's used in the return statement
  const materielOptions = [
    { id: "barre-halteres", label: "Barre & Haltères" },
    { id: "machines-guidees", label: "Machines Guidées" },
    { id: "poids-corps", label: "Poids du Corps (dips tractions)" },
  ];

  // Function to handle the actual program generation and Supabase insertion
  async function generateAndSaveProgram(values: z.infer<typeof formSchema>) {
     setIsSubmitting(true);
     console.log("Generating and saving program for values:", values);

     try {
       // --- Call the client-side generator ---
       const program = generateProgramClientSide(values);
       setGeneratedProgram(program);
       console.log("Program generated:", program);


       // Insert form data into Supabase table
       const { data, error } = await supabase
         .from('program_generation_logs')
         .insert([
           {
             form_data: values,
             user_email: values.email,
             program_title: program.title, // Add program title
             program_description: program.description, // Add program description
           },
         ]);

       if (error) {
         console.error("Error inserting data:", error);
         showError("Une erreur est survenue lors de l'enregistrement de vos informations.");
       } else {
         console.log("Data inserted successfully:", data);
         showSuccess("Vos informations ont été enregistrées !");
       }
     } catch (error) {
       console.error("An unexpected error occurred:", error);
       showError("Une erreur inattendue est survenue.");
     } finally {
       setIsSubmitting(false);
     }
  }


  // Handle form submission - show popup first
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submitted, showing random popup...");
    setFormData(values); // Store form data temporarily

    // Define a callback function that calls generateAndSaveProgram after the popup is closed
    const handlePopupCloseAndGenerate = () => {
        console.log("Popup closed, proceeding with program generation...");
        if (formData) { // Use the stored formData
            generateAndSaveProgram(formData);
            setFormData(null); // Clear stored data after use
        }
    };

    // Show a random popup. When it's closed (by clicking "Continuer" or outside), the callback will run.
    showRandomPopup({ onCloseCallback: handlePopupCloseAndGenerate });

    // The rest of the onSubmit function is handled by the callback.
  }


  // Render the program if generated, otherwise render the form
  if (generatedProgram) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 flex justify-center">
          <Card className="w-full max-w-2xl shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">{generatedProgram.title}</CardTitle>
              <CardDescriptionShadcn className="text-gray-600">{generatedProgram.description}</CardDescriptionShadcn>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {generatedProgram.weeks.map((week) => (
                  <AccordionItem value={`week-${week.weekNumber}`} key={week.weekNumber}>
                    <AccordionTrigger className="text-lg font-semibold text-gray-800">Semaine {week.weekNumber}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {week.days.map((day) => (
                          <div key={day.dayNumber} className="border-t pt-4">
                            <h4 className="text-md font-semibold mb-2">Jour {day.dayNumber}</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Exercice</TableHead>
                                  <TableHead>Séries</TableHead>
                                  <TableHead>Répétitions</TableHead>
                                  <TableHead>Notes</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {day.exercises.map((exercise, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">{exercise.name}</TableCell>
                                    <TableCell>{exercise.sets}</TableCell>
                                    <TableCell>{exercise.reps}</TableCell>
                                    <TableCell>{exercise.notes}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Render the form if no program is generated yet
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 flex justify-center">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Générer un programme personnalisé</CardTitle>
            <CardDescriptionShadcn className="text-gray-600">Remplissez le formulaire pour obtenir votre plan d'entraînement sur mesure.</CardDescriptionShadcn>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Objectif Principal */}
                <FormField
                  control={form.control}
                  name="objectif"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-lg font-semibold text-gray-800">Objectif principal</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Prise de Masse" />
                            </FormControl>
                            <FormLabel className="font-normal text-gray-700">
                              Prise de Masse 💪
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Sèche / Perte de Gras" />
                            </FormControl>
                            <FormLabel className="font-normal text-gray-700">
                              Sèche / Perte de Gras 🔥
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Powerlifting" />
                            </FormControl>
                            <FormLabel className="font-normal text-gray-700">
                              Powerlifting 🏋️
                            </FormLabel>
                          </FormItem>
                           <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Powerbuilding" />
                            </FormControl>
                            <FormLabel className="font-normal text-gray-700">
                              Powerbuilding ✨
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Niveau d'expérience */}
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-lg font-semibold text-gray-800">Niveau d'expérience</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Débutant (< 1 an)" />
                            </FormControl>
                            <FormLabel className="font-normal text-gray-700">
                              Débutant (&lt; 1 an)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Intermédiaire (1-3 ans)" />
                            </FormControl>
                            <FormLabel className="font-normal text-gray-700">
                              Intermédiaire (1-3 ans)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Avancé (3+ ans)" />
                            </FormControl>
                            <FormLabel className="font-normal text-gray-700">
                              Avancé (3+ ans)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Type de split préféré */}
                <FormField
                  control={form.control}
                  name="split"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-lg font-semibold text-gray-800">Type de split préféré</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Full Body (Tout le corps)" />
                            </FormControl>
                            <FormLabel className="font-normal text-gray-700">
                              Full Body (Tout le corps)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Half Body (Haut / Bas)" />
                            </FormControl>
                            <FormLabel className="font-normal text-gray-700">
                              Half Body (Haut / Bas)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Push Pull Legs" />
                            </FormControl>
                            <FormLabel className="font-normal text-gray-700">
                              Push Pull Legs
                            </FormLabel>
                          </FormItem>
                           <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Autre / Pas de préférence" />
                            </FormControl>
                            <FormLabel className="font-normal text-gray-700">
                              Autre / Pas de préférence
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Jours d'entraînement / semaine */}
                <FormField
                  control={form.control}
                  name="joursEntrainement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-800">Jours d'entraînement / semaine</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Durée max par séance (minutes) */}
                <FormField
                  control={form.control}
                  name="dureeMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-800">Durée max par séance (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="60" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Matériel disponible */}
                <FormField
                  control={form.control}
                  name="materiel"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-lg font-semibold text-gray-800">Matériel disponible</FormLabel>
                        <FormDescription className="text-gray-600">
                          Cochez tout ce que vous avez à disposition.
                        </FormDescription>
                      </div>
                      {materielOptions.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="materiel"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-gray-700">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Votre email */}
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-800">Votre email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="vous@email.com" {...field} />
                      </FormControl>
                       <FormDescription className="text-gray-600">
                          Entrez votre email pour enregistrer votre programme et le retrouver plus tard.
                        </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button type="submit" className="w-full bg-sbf-red text-white hover:bg-red-700 text-lg py-6" disabled={isSubmitting}>
                  {isSubmitting ? 'Génération en cours...' : 'Générer mon programme'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ProgrammeGenerator;