import React, { useState, useEffect } from 'react';
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
import { generateProgramClientSide, Program, ProgramFormData } from '@/utils/programGenerator';
import { ArrowLeft } from 'lucide-react';
import { useSession } from '@supabase/auth-helpers-react'; // Import useSession

// Define the schema for email validation (still needed if we allow lookup by email for non-logged-in users, but let's simplify for now and require login)
// const emailSchema = z.object({
//   email: z.string().email({
//     message: "Veuillez entrer une adresse email valide.",
//   }),
// });
// type EmailFormValues = z.infer<typeof emailSchema>;

// Define type for the data fetched from program_generation_logs
interface ProgramLog {
  id: number;
  created_at: string;
  form_data: ProgramFormData;
  program_title: string;
  program_description: string;
  user_email: string | null; // Email can be null if logged in user
  user_id: string | null; // Add user_id
}

const MonEspace: React.FC = () => {
  const session = useSession(); // Get the user session
  const [programLogs, setProgramLogs] = useState<ProgramLog[] | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading as we check session and fetch
  const [error, setError] = useState<string | null>(null);

  // Fetch programs when session changes or component mounts
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!session) {
        // If no session, stop loading and show message (handled in render)
        setIsLoading(false);
        setProgramLogs(null);
        setSelectedProgram(null);
        setError(null); // Clear any previous error
        return;
      }

      setIsLoading(true);
      setError(null);
      setProgramLogs(null);
      setSelectedProgram(null);

      try {
        // Fetch program logs from Supabase for the logged-in user ID
        const { data, error: dbError } = await supabase
          .from('program_generation_logs')
          .select('*')
          .eq('user_id', session.user.id) // Filter by user_id
          .order('created_at', { ascending: false });

        if (dbError) {
          console.error("Error fetching program logs:", dbError);
          setError("Une erreur est survenue lors de la récupération de vos programmes.");
          showError("Impossible de charger vos programmes.");
        } else {
          console.log("Fetched program logs:", data);
          if (data && data.length > 0) {
            setProgramLogs(data as ProgramLog[]);
            // showSuccess(`Trouvé ${data.length} programme(s) pour cet email.`); // Avoid toast on load
          } else {
            setProgramLogs([]); // Set to empty array if no programs found
            // showError("Aucun programme trouvé pour cet email."); // Avoid toast on no programs found on load
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

    fetchPrograms();
  }, [session]); // Re-run effect when session changes

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

  // Show message if not logged in
  if (!session) {
     return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 flex justify-center items-center">
          <Card className="w-full max-w-md shadow-lg text-center">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">Mon Espace</CardTitle>
              <CardDescriptionShadcn className="text-gray-600">
                Connectez-vous pour retrouver vos programmes générés.
              </CardDescriptionShadcn>
            </CardHeader>
            <CardContent>
               <Button asChild className="w-full bg-sbf-red text-white hover:bg-red-700">
                  <a href="/login">Se connecter</a> {/* Use a standard anchor for full page reload on login page */}
               </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
     );
  }


  // Show loading state
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

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <p className="text-red-500">{error}</p>
           {/* No need for back to email search button anymore */}
        </main>
        <Footer />
      </div>
    );
  }

  // Show program list or selected program details
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
                      Retrouvez ici les programmes que vous avez générés.
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
                  <p>Aucun programme trouvé pour votre compte.</p>
                   {/* No need for try another email button */}
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