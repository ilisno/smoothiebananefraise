import React, { useState } from 'react';
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
import { showError, showSuccess } from '@/utils/toast'; // Assuming you have toast utilities

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

type ProgramFormProps = {
  onGenerate: (data: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
};

const ProgramForm: React.FC<ProgramFormProps> = ({ onGenerate, isLoading }) => {
  const form = useForm<z.infer<typeof formSchema>>({
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submitted:", values);
    // TODO: Implement email sending logic here (e.g., via Supabase function or API)
    showSuccess("Formulaire soumis ! Génération du programme...");
    onGenerate(values);
  }

  const equipmentItems = [
    { id: "barre_halteres", label: "Barre & Haltères" },
    { id: "machines_guidees", label: "Machines Guidées" },
    { id: "poids_corp", label: "Poids du Corps" },
    { id: "elastiques", label: "Élastiques" },
    { id: "kettlebells", label: "Kettlebells" },
  ] as const; // Use 'as const' for type safety in FieldName

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Smoothie Banane Fraise 🍌🍓</CardTitle>
        <CardDescription className="text-center">Générez votre programme d'entraînement personnalisé</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Votre Email</FormLabel>
                  <FormControl>
                    <Input placeholder="vous@email.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Recevez votre programme et nos conseils (promis, pas de spam !).
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
                <FormItem>
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
                <FormItem>
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
                <FormItem className="space-y-3">
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
                <FormItem>
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
                <FormItem>
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
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Matériel Disponible</FormLabel>
                    <FormDescription>
                      Cochez tout ce que vous avez à disposition.
                    </FormDescription>
                  </div>
                  {equipmentItems.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name={`equipment.${item.id}`} // Access nested field
                      render={({ field }) => (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
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
                  <FormMessage>{form.formState.errors.equipment?.message}</FormMessage>
                </FormItem>
              )}
            />


            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Génération en cours..." : "Générer mon Programme"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProgramForm;