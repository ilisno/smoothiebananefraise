import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, // Keep Select import for other potential uses if needed, or remove if not
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from '@/lib/utils'; // Import cn utility
import { useToast } from "@/components/ui/use-toast"; // Import useToast from shadcn/ui toast
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client

// Define the schema for form validation using Zod
const formSchema = z.object({
  // Modified email validation to accept 'b' or a standard email format
  email: z.union([z.literal('b'), z.string().email({ message: "Adresse email invalide." })], {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_union) {
        return { message: "Adresse email invalide." };
      }
      return { message: ctx.defaultError };
    }
  }),
  goal: z.enum(["prise_masse", "seche", "force", "powerbuilding"], { required_error: "Objectif requis." }),
  level: z.enum(["debutant", "intermediaire", "avance"], { required_error: "Niveau requis." }),
  split: z.enum(["full_body", "half_body", "ppl", "autre"], { required_error: "Split requis." }),
  days: z.coerce.number().min(1, { message: "Minimum 1 jour." }).max(7, { message: "Maximum 7 jours." }),
  duration: z.coerce.number().min(30, { message: "Minimum 30 minutes." }).max(180, { message: "Maximum 180 minutes." }),
  equipment: z.object({
    barre_halteres: z.boolean().default(false),
    machines_guidees: z.boolean().default(false),
    poids_corp: z.boolean().default(false),
    // Removed elastiques and kettlebells from schema
  }).refine(data => Object.values(data).some(Boolean), {
    message: "Sélectionnez au moins un type d'équipement.",
    path: ["equipment"], // Attach error to the equipment field group
  }),
});

export type FormData = z.infer<typeof formSchema>; // Export the type

type ProgramFormProps = {
  onGenerate: (data: FormData) => void;
  isLoading: boolean;
};

const ProgramForm: React.FC<ProgramFormProps> = ({ onGenerate, isLoading }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      days: 3,
      duration: 60,
      equipment: {
        barre_halteres: false,
        machines_guidees: false,
        poids_corp: true, // Default to bodyweight
        // Removed elastiques and kettlebells from defaultValues
      },
      // Set default values for goal and level if needed, matching the enum
      goal: "prise_masse", // Example default
      level: "intermediaire", // Example default
    },
  });

  // Call useToast hook at the top level of the component
  const { toast } = useToast();

  async function onSubmit(values: FormData) {
    console.log("Form submitted:", values);

    // --- Added bypass logic for email 'b' ---
    if (values.email === 'b') {
        console.log("Bypassing Supabase insertion for test email 'b'.");
        toast({
            title: "Formulaire soumis !",
            description: "Génération du programme...",
        });
        onGenerate(values);
        return; // Exit the function early
    }
    // --- End bypass logic ---


    // Disable button during submission (already handled by isLoading prop)

    try {
      // Attempt to insert the email into the Supabase table
      const { error } = await supabase
        .from('subscribers') // Make sure 'subscribers' matches your table name
        .insert({ email: values.email });

      if (error) {
        // Handle potential errors (like duplicate email if UNIQUE constraint is violated)
        if (error.code === '23505') { // Postgres code for unique violation
          console.warn('Email already exists:', values.email);
          // Decide how to handle: show success anyway, or a specific message?
          // Let's proceed to generation but maybe show a different toast later
           toast({
                title: "Email déjà enregistré",
                description: "Cet email est déjà dans notre liste. Génération du programme...",
                variant: "default", // Or 'secondary' or similar
            });
        } else {
          // Throw other errors to be caught by the catch block
          throw error;
        }
      } else {
        console.log('Email successfully added to Supabase:', values.email);
        // Optionally show a success toast for email submission here if needed
         toast({
            title: "Email enregistré !",
            description: "Votre email a été ajouté. Génération du programme...",
        });
      }

      // Proceed with program generation regardless of whether email was new or duplicate
      onGenerate(values);

    } catch (error) {
      console.error('Error inserting email into Supabase:', error);
      toast({
          title: "Erreur d'enregistrement",
          description: "Erreur lors de l'enregistrement de l'email. Veuillez réessayer.",
          variant: "destructive",
      });
      // Do not proceed with generation if there was a critical error saving the email
      // Or, you could choose to proceed anyway by calling onGenerate(values) here too,
      // depending on desired behavior. Let's prevent generation on error for now.
    }
    // Re-enable button is handled by the parent component via isLoading prop
  }

  const equipmentItems = [
    { id: "barre_halteres", label: "Barre & Haltères" },
    { id: "machines_guidees", label: "Machines Guidées" },
    { id: "poids_corp", label: "Poids du Corps (dips tractions)" }, // Updated label
    // Removed elastiques and kettlebells from equipmentItems
  ] as const;

  const goalItems = [
    { value: "prise_masse", label: "Prise de Masse 💪" },
    { value: "seche", label: "Sèche / Perte de Gras 🔥" },
    { value: "force", label: "Powerlifting 🏋️" }, // Changed label and added emoji
    { value: "powerbuilding", label: "Powerbuilding ⚡" }, // Added emoji
  ] as const;

  const levelItems = [
    { value: "debutant", label: "Débutant (< 1 an)" },
    { value: "intermediaire", label: "Intermédiaire (1-3 ans)" },
    { value: "avance", label: "Avancé (8+ ans)" }, // Updated label
  ] as const;


  return (
    <Card className="w-full max-w-2xl mx-auto animate-in fade-in duration-500">
      <CardHeader className="animate-in fade-in delay-100 duration-500">
        <CardTitle className="text-2xl font-bold text-center">Smoothie Banane Fraise 🍌🍓</CardTitle>
        <CardDescription className="text-center">Générez votre programme d'entraînement personnalisé</CardDescription>
      </CardHeader>
      <CardContent className="animate-in fade-in delay-200 duration-500">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <FormField
              key="email-field" // Added key
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="animate-in fade-in slide-in-from-bottom-2 delay-300 duration-500">
                  <FormLabel>Votre Email</FormLabel>
                  <FormControl>
                    <Input placeholder="vous@email.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Entrez votre email pour recevoir le programme (stocké sur Supabase).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Goal (Radio Buttons) */}
            <FormField
              key="goal-field" // Added key
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem className="space-y-3 animate-in fade-in slide-in-from-bottom-2 delay-[350ms]">
                  <FormLabel>Objectif Principal</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {goalItems.map((item) => (
                        <FormItem key={item.value} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={item.value} />
                          </FormControl>
                          <FormLabel className="font-normal">{item.label}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Level (Radio Buttons) */}
            <FormField
              key="level-field" // Added key
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem className="space-y-3 animate-in fade-in slide-in-from-bottom-2 delay-400 duration-500">
                  <FormLabel>Niveau d'Expérience</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                       {levelItems.map((item) => (
                        <FormItem key={item.value} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={item.value} />
                          </FormControl>
                          <FormLabel className="font-normal">{item.label}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Split */}
            <FormField
              key="split-field" // Added key
              control={form.control}
              name="split"
              render={({ field }) => (
                <FormItem className="space-y-3 animate-in fade-in slide-in-from-bottom-2 delay-[450ms] duration-500">
                  <FormLabel>Type de Split Préféré</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem key="split-full-body" className="flex items-center space-x-3 space-y-0"> {/* Added key */}
                        <FormControl>
                          <RadioGroupItem value="full_body" />
                        </FormControl>
                        <FormLabel className="font-normal">Full Body (Tout le corps)</FormLabel>
                      </FormItem>
                      <FormItem key="split-half-body" className="flex items-center space-x-3 space-y-0"> {/* Added key */}
                        <FormControl>
                          <RadioGroupItem value="half_body" />
                        </FormControl>
                        <FormLabel className="font-normal">Half Body (Haut / Bas)</FormLabel>
                      </FormItem>
                      <FormItem key="split-ppl" className="flex items-center space-x-3 space-y-0"> {/* Added key */}
                        <FormControl>
                          <RadioGroupItem value="ppl" />
                        </FormControl>
                        <FormLabel className="font-normal">Push Pull Legs</FormLabel>
                      </FormItem>
                       <FormItem key="split-autre" className="flex items-center space-x-3 space-y-0"> {/* Added key */}
                        <FormControl>
                          <RadioGroupItem value="autre" />
                        </FormControl>
                        <FormLabel className="font-normal">Autre / Pas de préférence</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Days per week */}
            <FormField
              key="days-field" // Added key
              control={form.control}
              name="days"
              render={({ field }) => (
                <FormItem className="animate-in fade-in slide-in-from-bottom-2 delay-500 duration-500">
                  <FormLabel>Jours d'entraînement / semaine</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="7" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Session duration */}
            <FormField
              key="duration-field" // Added key
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem className="animate-in fade-in slide-in-from-bottom-2 delay-[550ms] duration-500">
                  <FormLabel>Durée max par séance (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" min="30" max="180" step="15" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Equipment */}
            <FormField
              key="equipment-field-group" // Added key for the group wrapper
              control={form.control}
              name="equipment"
              render={() => (
                <FormItem className="animate-in fade-in slide-in-from-bottom-2 delay-600 duration-500">
                  <div className="mb-4">
                    <FormLabel className="text-base">Matériel Disponible</FormLabel>
                    <FormDescription>
                      Cochez tout ce que vous avez à disposition.
                    </FormDescription>
                  </div>
                  {equipmentItems.map((item) => (
                    <FormField
                      key={item.id} // Key for each individual equipment checkbox FormField
                      control={form.control}
                      name={`equipment.${item.id}`} // Access nested field
                      render={({ field }) => (
                        <FormItem
                          key={item.id} // Key for the FormItem wrapping the checkbox
                          className="flex flex-row items-start space-x-3 space-y-0 mb-2" // Added margin-bottom
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                  {/* Display the specific error for the equipment group */}
                  <FormMessage>{form.formState.errors.equipment?.root?.message}</FormMessage>
                </FormItem>
              )}
            />


            <Button
              type="submit"
              className={cn(
                "w-full animate-in fade-in slide-in-from-bottom-2 delay-[650ms] duration-500",
                isLoading && "animate-pulse-subtle" // Apply subtle pulse when loading
              )}
              disabled={isLoading}
            >
              {isLoading ? "Génération en cours..." : "Générer mon Programme"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProgramForm;