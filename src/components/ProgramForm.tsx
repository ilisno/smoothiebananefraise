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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { showError, showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client

// Define the schema for form validation using Zod
const formSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide." }),
  goal: z.enum(["prise_masse", "seche", "force", "powerbuilding"], { required_error: "Objectif requis." }),
  level: z.enum(["debutant", "intermediaire", "avance"], { required_error: "Niveau requis." }),
  split: z.enum(["full_body", "half_body", "ppl", "autre"], { required_error: "Split requis." }),
  days: z.coerce.number().min(1, { message: "Minimum 1 jour." }).max(7, { message: "Maximum 7 jours." }),
  duration: z.coerce.number().min(30, { message: "Minimum 30 minutes." }).max(180, { message: "Maximum 180 minutes." }),
  equipment: z.object({
    barre_halteres: z.boolean().default(false),
    machines_guidees: z.boolean().default(false),
    poids_corp: z.boolean().default(false),
    elastiques: z.boolean().default(false),
    kettlebells: z.boolean().default(false),
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
        elastiques: false,
        kettlebells: false,
      },
    },
  });

  // Make onSubmit async to handle Supabase call
  async function onSubmit(values: FormData) {
    console.log("Form submitted:", values);

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
        } else {
          // Throw other errors to be caught by the catch block
          throw error;
        }
      } else {
        console.log('Email successfully added to Supabase:', values.email);
        // Optionally show a success toast for email submission here if needed
      }

      // Proceed with program generation regardless of whether email was new or duplicate
      showSuccess("Formulaire soumis ! Génération du programme...");
      onGenerate(values);

    } catch (error) {
      console.error('Error inserting email into Supabase:', error);
      showError("Erreur lors de l'enregistrement de l'email. Veuillez réessayer.");
      // Do not proceed with generation if there was a critical error saving the email
      // Or, you could choose to proceed anyway by calling onGenerate(values) here too,
      // depending on desired behavior. Let's prevent generation on error for now.
    }
    // Re-enable button is handled by the parent component via isLoading prop
  }

  const equipmentItems = [
    { id: "barre_halteres", label: "Barre & Haltères" },
    { id: "machines_guidees", label: "Machines Guidées" },
    { id: "poids_corp", label: "Poids du Corps" },
    { id: "elastiques", label: "Élastiques" },
    { id: "kettlebells", label: "Kettlebells" },
  ] as const;

  // Base animation classes for cascade effect
  const baseAnimation = "animate-in fade-in zoom-in-95 duration-700 fill-mode-both";
  const slideAnimation = "slide-in-from-bottom-4";

  return (
    // Card animation
    <Card className={cn("w-full max-w-2xl mx-auto", baseAnimation)}>
      {/* Header animation */}
      <CardHeader className={cn(baseAnimation, "delay-100")}>
        <CardTitle className="text-2xl font-bold text-center">Smoothie Banane Fraise 🍌🍓</CardTitle>
        <CardDescription className="text-center">Générez votre programme d'entraînement personnalisé</CardDescription>
      </CardHeader>
      {/* Content animation */}
      <CardContent className={cn(baseAnimation, "delay-200")}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className={cn(baseAnimation, slideAnimation, "delay-300")}>
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

            {/* Goal */}
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem className={cn(baseAnimation, slideAnimation, "delay-[350ms]")}>
                  <FormLabel>Objectif Principal</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisissez votre objectif" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="prise_masse">Prise de Masse</SelectItem>
                      <SelectItem value="seche">Sèche / Perte de Gras</SelectItem>
                      <SelectItem value="force">Force</SelectItem>
                      <SelectItem value="powerbuilding">Powerbuilding</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Level */}
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem className={cn(baseAnimation, slideAnimation, "delay-400")}>
                  <FormLabel>Niveau d'Expérience</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisissez votre niveau" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="debutant">Débutant (&lt; 1 an)</SelectItem>
                      <SelectItem value="intermediaire">Intermédiaire (1-3 ans)</SelectItem>
                      <SelectItem value="avance">Avancé (3+ ans)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Split */}
            <FormField
              control={form.control}
              name="split"
              render={({ field }) => (
                <FormItem className={cn("space-y-3", baseAnimation, slideAnimation, "delay-[450ms]")}>
                  <FormLabel>Type de Split Préféré</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="full_body" />
                        </FormControl>
                        <FormLabel className="font-normal">Full Body (Tout le corps)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="half_body" />
                        </FormControl>
                        <FormLabel className="font-normal">Half Body (Haut / Bas)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="ppl" />
                        </FormControl>
                        <FormLabel className="font-normal">Push Pull Legs</FormLabel>
                      </FormItem>
                       <FormItem className="flex items-center space-x-3 space-y-0">
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
              control={form.control}
              name="days"
              render={({ field }) => (
                <FormItem className={cn(baseAnimation, slideAnimation, "delay-500")}>
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
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem className={cn(baseAnimation, slideAnimation, "delay-[550ms]")}>
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
              control={form.control}
              name="equipment"
              render={() => (
                <FormItem className={cn(baseAnimation, slideAnimation, "delay-600")}>
                  <div className="mb-4">
                    <FormLabel className="text-base">Matériel Disponible</FormLabel>
                    <FormDescription>
                      Cochez tout ce que vous avez à disposition.
                    </FormDescription>
                  </div>
                  {equipmentItems.map((item, index) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name={`equipment.${item.id}`} // Access nested field
                      render={({ field }) => (
                        <FormItem
                          key={item.id}
                          // Stagger animation for checkboxes
                          className={cn("flex flex-row items-start space-x-3 space-y-0 mb-2", baseAnimation, `delay-[${600 + index * 50}ms]`)}
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
                "w-full",
                 baseAnimation, slideAnimation, "delay-[750ms]", // Animate button last
                isLoading && "animate-pulse-subtle" // Apply subtle pulse when loading
              )}
              disabled={isLoading}
            >
              {isLoading ? "Enregistrement..." : "Générer mon Programme"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProgramForm;