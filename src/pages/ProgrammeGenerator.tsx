import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { showSuccess, showError } from '@/utils/toast'; // Import toast utilities
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client

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
  const { objectif, experience, split, joursEntrainement, materiel } = values;

  const baseReps = objectif === "Powerlifting" ? "3-5" : (objectif === "Sèche / Perte de Gras" ? "12-15" : "8-12");
  const baseSets = "3"; // Simplified

  // Very basic exercise list - needs expansion for real use
  const allExercises = [
    { name: "Développé Couché", muscle: "Pectoraux", equipment: ["barre-halteres"] },
    { name: "Développé Incliné Haltères", muscle: "Pectoraux", equipment: ["barre-halteres"] },
    { name: "Écartés Poulie", muscle: "Pectoraux", equipment: ["machines-guidees"] },
    { name: "Tractions", muscle: "Dos", equipment: ["poids-corps"] },
    { name: "Rowing Barre", muscle: "Dos", equipment: ["barre-halteres"] },
    { name: "Tirage Vertical Machine", muscle: "Dos", equipment: ["machines-guidees"] },
    { name: "Soulevé de Terre Roumain", muscle: "Jambes", equipment: ["barre-halteres"] },
    { name: "Squat Barre", muscle: "Jambes", equipment: ["barre-halteres"] },
    { name: "Presse à Cuisses", muscle: "Jambes", equipment: ["machines-guidees"] },
    { name: "Fentes Haltères", muscle: "Jambes", equipment: ["barre-halteres"] },
    { name: "Développé Militaire Barre", muscle: "Épaules", equipment: ["barre-halteres"] },
    { name: "Élévations Latérales Haltères", muscle: "Épaules", equipment: ["barre-halteres"] },
    { name: "Curl Biceps Barre", muscle: "Biceps", equipment: ["barre-halteres"] },
    { name: "Extension Triceps Poulie Haute", muscle: "Triceps", equipment: ["machines-guidees"] },
    { name: "Crunchs", muscle: "Abdos", equipment: [] },
  ];

  // Filter exercises based on available equipment
  const availableExercises = allExercises.filter(ex =>
    ex.equipment.length === 0 || ex.equipment.some(eq => materiel?.includes(eq))
  );

  const program: Program = {
    title: `Programme ${objectif} - ${experience}`,
    description: `Programme généré pour ${joursEntrainement} jours/semaine, split ${split}.`,
    weeks: [],
  };

  // Generate 4 weeks for demonstration
  for (let weekNum = 1; weekNum <= 4; weekNum++) {
    const week: Program['weeks'][0] = {
      weekNumber: weekNum,
      days: [],
    };

    // Simple distribution based on split and days
    const exercisesPerDay = Math.floor(availableExercises.length / joursEntrainement) || 3; // Ensure at least 3 exercises if possible

    for (let dayIndex = 0; dayIndex < joursEntrainement; dayIndex++) {
      const day: Program['weeks'][0]['days'][0] = {
        dayNumber: dayIndex + 1,
        exercises: [],
      };

      // Very basic exercise selection - just pick some available exercises
      // A real generator would select based on split, muscle groups, etc.
      const selectedExercises = availableExercises
        .slice(dayIndex * exercisesPerDay, (dayIndex + 1) * exercisesPerDay)
        .map(ex => ({
          name: ex.name,
          sets: baseSets,
          reps: baseReps,
          notes: `RPE ${experience === 'Débutant (< 1 an)' ? '6-7' : (experience === 'Intermédiaire (1-3 ans)' ? '7-8' : '8-9')}` // Simplified RPE
        }));

      // If not enough exercises for the last day, just take the remaining ones
      if (selectedExercises.length === 0 && dayIndex * exercisesPerDay < availableExercises.length) {
           selectedExercises.push(...availableExercises.slice(dayIndex * exercisesPerDay).map(ex => ({
              name: ex.name,
              sets: baseSets,
              reps: baseReps,
              notes: `RPE ${experience === 'Débutant (< 1 an)' ? '6-7' : (experience === 'Intermédiaire (1-3 ans)' ? '7-8' : '8-9')}`
           })));
      }


      day.exercises = selectedExercises;
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

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    console.log("Form submitted with values:", values);

    try {
      // Insert form data into Supabase table
      const { data, error } = await supabase
        .from('program_generation_logs')
        .insert([
          {
            form_data: values,
            user_email: values.email,
            // program_title and program_description can be added later if generated
          },
        ]);

      if (error) {
        console.error("Error inserting data:", error);
        showError("Une erreur est survenue lors de l'enregistrement de vos informations.");
      } else {
        console.log("Data inserted successfully:", data);
        showSuccess("Vos informations ont été enregistrées !");

        // --- Call the client-side generator ---
        const program = generateProgramClientSide(values);
        setGeneratedProgram(program);
        // You might want to update the Supabase log with program details here
        // await supabase.from('program_generation_logs').update({ program_title: program.title, program_description: program.description }).eq('id', data[0].id);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      showError("Une erreur inattendue est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Define materielOptions here, before it's used in the return statement
  const materielOptions = [
    { id: "barre-halteres", label: "Barre & Haltères" },
    { id: "machines-guidees", label: "Machines Guidées" },
    { id: "poids-corps", label: "Poids du Corps (dips tractions)" },
  ];


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
                            <ul className="list-disc pl-5 space-y-1">
                              {day.exercises.map((exercise, index) => (
                                <li key={index} className="text-gray-700">
                                  <strong>{exercise.name}:</strong> {exercise.sets} séries de {exercise.reps} répétitions ({exercise.notes})
                                </li>
                              ))}
                            </ul>
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