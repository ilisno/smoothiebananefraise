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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription as CardDescriptionShadcn } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { generateProgramClientSide, Program, ProgramFormData } from '@/utils/programGenerator'; // Import generator and types
import { ArrowLeft } from 'lucide-react'; // Import back arrow icon

// Define the schema for email validation
const emailSchema = z.object({
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
});

type EmailFormValues = z.infer<typeof emailSchema>;

// Define type for the data fetched from program_generation_logs
interface ProgramLog {
  id: number;
  created_at: string;
  form_data: ProgramFormData; // Use the imported type
  program_title: string;
  program_description: string;
  user_email: string;
}

const MonEspace: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [programLogs, setProgramLogs] = useState<ProgramLog[] | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the email form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle email form submission
  const onEmailSubmit = async (values: EmailFormValues) => {
    setIsLoading(true);
    setError(null);
    setProgramLogs(null); // Clear previous results
    setSelectedProgram(null); // Clear any selected program
    setUserEmail(values.email); // Store the email

    try {
      // Fetch program logs from Supabase for the given email
      const { data, error: dbError } = await supabase
        .from('program_generation_logs')
        .select('*') // Select all columns
        .eq('user_email', values.email) // Filter by email
        .order('created_at', { ascending: false }); // Order by newest first

      if (dbError) {
        console.error("Error fetching program logs:", dbError);
        setError("Une erreur est survenue lors de la récupération de vos programmes.");
        showError("Impossible de charger vos programmes.");
      } else {
        console.log("Fetched program logs:", data);
        if (data && data.length > 0) {
          setProgramLogs(data as ProgramLog[]); // Cast data to ProgramLog[]
          showSuccess(`Trouvé ${data.length} programme(s) pour cet email.`);
        } else {
          setProgramLogs([]); // Set to empty array if no programs found
          showError("Aucun programme trouvé pour cet email.");
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching logs:", err);
      setError("Une erreur inattendue est survenue.");
      showError("Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting a program log to view details
  const handleSelectProgram = (log: ProgramLog) => {
    try {
      // Re-generate the program structure using the stored form_data
      const program = generateProgramClientSide(log.form_data);
      setSelectedProgram(program);
      console.log("Selected and re-generated program:", program);
    } catch (err) {
      console.error("Error re-generating program:", err);
      setError("Impossible de re-générer les détails du programme.");
      showError("Impossible d'afficher les détails du programme.");
    }
  };

  // Handle going back to the program list
  const handleBackToList = () => {
    setSelectedProgram(null);
  };

  // --- Render Logic ---

  // 1. Show email form if no email is submitted yet
  if (!userEmail) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 flex justify-center items-center">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">Mon Espace</CardTitle>
              <CardDescriptionShadcn className="text-gray-600">
                Entrez votre email pour retrouver vos programmes générés.
              </CardDescriptionShadcn>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="vous@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-sbf-red text-white hover:bg-red-700" disabled={isLoading}>
                    {isLoading ? 'Recherche...' : 'Retrouver mes programmes'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // 2. Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <p>Chargement de vos programmes...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // 3. Show error state
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <p className="text-red-500">{error}</p>
           <Button onClick={() => setUserEmail(null)} className="mt-4">Retour à la recherche</Button>
        </main>
        <Footer />
      </div>
    );
  }

  // 4. Show program list or selected program details
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 flex justify-center">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center">
             {selectedProgram ? (
                <>
                   <Button variant="ghost" onClick={handleBackToList} className="self-start -ml-4 mb-4">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
                   </Button>
                   <CardTitle className="text-2xl font-bold text-gray-800">{selectedProgram.title}</CardTitle>
                   <CardDescriptionShadcn className="text-gray-600">{selectedProgram.description}</CardDescriptionShadcn>
                </>
             ) : (
                <>
                   <CardTitle className="text-2xl font-bold text-gray-800">Vos Programmes</CardTitle>
                   <CardDescriptionShadcn className="text-gray-600">
                      Programmes générés pour {userEmail}.
                   </CardDescriptionShadcn>
                </>
             )}
          </CardHeader>
          <CardContent>
            {selectedProgram ? (
              // Display selected program details
              <Accordion type="single" collapsible className="w-full">
                {selectedProgram.weeks.map((week) => (
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
            ) : (
              // Display list of program logs
              programLogs && programLogs.length > 0 ? (
                <div className="space-y-4">
                  {programLogs.map((log) => (
                    <Card
                      key={log.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSelectProgram(log)}
                    >
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg font-semibold text-gray-800">{log.program_title}</CardTitle>
                        <CardDescriptionShadcn className="text-sm text-gray-600">
                          Généré le {new Date(log.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </CardDescriptionShadcn>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                // No programs found message
                <div className="text-center text-gray-600">
                  <p>Aucun programme trouvé pour cet email.</p>
                   <Button onClick={() => setUserEmail(null)} className="mt-4">Essayer un autre email</Button>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default MonEspace;