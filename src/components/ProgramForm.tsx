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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription as ShadcnCardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Ajout de CardHeader et CardTitle
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react'; // Import Loader2

// Keep the schema and FormData type
const formSchema = z.object({
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
  }).refine(data => Object.values(data).some(Boolean), {
    message: "Sélectionnez au moins un type d'équipement.",
    path: ["equipment"],
  }),
});

export type FormData = z.infer<typeof formSchema>;

// Update props
type ProgramFormProps = {
  onSubmit: (data: FormData) => void; // Parent handles submission logic
  isLoading: boolean; // Parent controls loading state
};

const ProgramForm: React.FC<ProgramFormProps> = ({ onSubmit, isLoading }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      days: 3,
      duration: 60,
      equipment: {
        barre_halteres: false,
        machines_guidees: false,
        poids_corp: true,
      },
      goal: "prise_masse",
      level: "intermediaire",
      split: "autre", // Add default for split
    },
  });

  // Remove mode state and handlers

  const equipmentItems = [
    { id: "barre_halteres", label: "Barre & Haltères" },
    { id: "machines_guidees", label: "Machines Guidées" },
    { id: "poids_corp", label: "Poids du Corps (dips tractions)" },
  ] as const;

  const goalItems = [
    { value: "prise_masse", label: "Prise de Masse 💪" },
    { value: "seche", label: "Sèche / Perte de Gras 🔥" },
    { value: "force", label: "Powerlifting 🏋️" },
    { value: "powerbuilding", label: "Powerbuilding ⚡" },
  ] as const;

  const levelItems = [
    { value: "debutant", label: "Débutant (< 1 an)" },
    { value: "intermediaire", label: "Intermédiaire (1-3 ans)" },
    { value: "avance", label: "Avancé (3+ ans)" },
  ] as const;

  const splitItems = [ // Add split items
    { value: "full_body", label: "Full Body (Tout le corps)" },
    { value: "half_body", label: "Half Body (Haut / Bas)" },
    { value: "ppl", label: "Push Pull Legs" },
    { value: "autre", label: "Autre / Pas de préférence" },
  ] as const;


  return (
    <Card className="w-full max-w-2xl mx-auto animate-in fade-in duration-500">
      <CardHeader> {/* Utilisation de CardHeader */}
         <CardTitle className="text-2xl font-bold text-center">Générer un programme personnalisé</CardTitle> {/* Utilisation de CardTitle */}
         <ShadcnCardDescription className="text-center">Remplissez le formulaire pour obtenir votre plan d'entraînement sur mesure.</ShadcnCardDescription>
      </CardHeader>
      <CardContent className="animate-in fade-in delay-200 duration-500 pt-6">
        {/* Remove mode toggle */}

        <Form {...form}>
          {/* Use form.handleSubmit to pass data to the parent's onSubmit */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Fields remain the same */}
            <FormField
              key="goal-field"
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem className="space-y-3 animate-in fade-in slide-in-from-bottom-2 delay-[350ms]">
                  <FormLabel>Objectif principal</FormLabel>
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

            <FormField
              key="level-field"
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem className="space-y-3 animate-in fade-in slide-in-from-bottom-2 delay-400 duration-500">
                  <FormLabel>Niveau d'expérience</FormLabel>
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

            <FormField
              key="split-field"
              control={form.control}
              name="split"
              render={({ field }) => (
                <FormItem className="space-y-3 animate-in fade-in slide-in-from-bottom-2 delay-[450ms] duration-500">
                  <FormLabel>Type de split préféré</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {splitItems.map((item) => ( // Use splitItems
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

            <FormField
              key="days-field"
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

            <FormField
              key="duration-field"
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

            <FormField
              key="equipment-field-group"
              control={form.control}
              name="equipment"
              render={() => (
                <FormItem className="animate-in fade-in slide-in-from-bottom-2 delay-600 duration-500">
                  <div className="mb-4">
                    <FormLabel className="text-base">Matériel disponible</FormLabel>
                    <ShadcnCardDescription>
                      Cochez tout ce que vous avez à disposition.
                    </ShadcnCardDescription>
                  </div>
                  {equipmentItems.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name={`equipment.${item.id}`}
                      render={({ field }) => (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0 mb-2"
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
                  <FormMessage>{form.formState.errors.equipment?.root?.message}</FormMessage>
                </FormItem>
              )}
            />

            {/* Email field remains */}
            <FormField
              key="email-field-generate"
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="animate-in fade-in slide-in-from-bottom-2 delay-[650ms] duration-500">
                  <FormLabel>Votre email</FormLabel>
                  <FormControl>
                    <Input placeholder="vous@email.com" {...field} />
                  </FormControl>
                  <ShadcnCardDescription>
                    Entrez votre email pour enregistrer votre programme et le retrouver plus tard.
                  </ShadcnCardDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className={cn(
                "w-full animate-in fade-in slide-in-from-bottom-2 delay-[700ms] duration-500",
                isLoading && "animate-pulse-subtle"
              )}
              disabled={isLoading} // Use isLoading prop
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                "Générer mon programme"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProgramForm;