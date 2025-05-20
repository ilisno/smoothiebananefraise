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
import { ArrowLeft, Edit, Save, X, Loader2 } from 'lucide-react'; // Import Edit, Save, X, Loader2 icons
import { useSession } from '@supabase/auth-helpers-react'; // Import useSession

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

  // State for renaming feature
  const [editingProgramId, setEditingProgramId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [isRenaming, setIsRenaming] = useState(false); // State for renaming loading

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
          } else {
            setProgramLogs([]); // Set to empty array if no programs found
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
    setEditingProgramId(null); // Ensure editing mode is off
    setNewTitle(''); // Clear new title state
  };

  // Handle starting rename mode
  const handleStartRename = (log: ProgramLog) => {
    setEditingProgramId(log.id);
    setNewTitle(log.program_title);
  };

  // Handle canceling rename mode
  const handleCancelRename = () => {
    setEditingProgramId(null);
    setNewTitle('');
  };

  // Handle saving the new program title
  const handleSaveRename = async (logId: number) => {
    if (newTitle.trim() === '') {
      showError("Le nom du programme ne peut pas être vide.");
      return;
    }

    setIsRenaming(true);
    setError(null); // Clear previous errors

    try {
      const { error: updateError } = await supabase
        .from('program_generation_logs')
        .update({ program_title: newTitle.trim() })
        .eq('id', logId);

      if (updateError) {
        console.error("Error updating program title:", updateError);
        setError("Une erreur est survenue lors du renommage.");
        showError("Impossible de renommer le programme.");
      } else {
        console.log(`Program ${logId} renamed to "${newTitle.trim()}"`);
        showSuccess("Programme renommé avec succès !");

        // Update the programLogs state locally instead of refetching everything
        setProgramLogs(prevLogs =>
          prevLogs ? prevLogs.map(log =>
            log.id === logId ? { ...log, program_title: newTitle.trim() } : log
          ) : null
        );

        handleCancelRename(); // Exit editing mode
      }
    } catch (err) {
      console.error("Unexpected error during renaming:", err);
      setError("Une erreur inattendue est survenue.");
      showError("Une erreur inattendue est survenue.");
    } finally {
      setIsRenaming(false);
    }
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
  if (error && !isRenaming) { // Only show main error if not currently renaming
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <p className="text-red-500">{error}</p>
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
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <CardHeader className="p-4 flex flex-row items-center justify-between"> {/* Use flex for layout */}
                         {editingProgramId === log.id ? (
                            // Editing mode
                            <div className="flex-grow flex items-center space-x-2">
                               <Input
                                  value={newTitle}
                                  onChange={(e) => setNewTitle(e.target.value)}
                                  placeholder="Nouveau nom du programme"
                                  disabled={isRenaming}
                                  className="flex-grow"
                               />
                               <Button
                                  size="sm"
                                  onClick={() => handleSaveRename(log.id)}
                                  disabled={isRenaming || newTitle.trim() === ''}
                               >
                                  {isRenaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                               </Button>
                               <Button size="sm" variant="outline" onClick={handleCancelRename} disabled={isRenaming}>
                                  <X size={16} />
                               </Button>
                            </div>
                         ) : (
                            // Viewing mode
                            <div className="flex-grow cursor-pointer" onClick={() => handleSelectProgram(log)}>
                               <CardTitle className="text-lg font-semibold text-gray-800">{log.program_title}</CardTitle>
                               <CardDescriptionShadcn className="text-sm text-gray-600">
                                  Généré le {new Date(log.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                               </CardDescriptionShadcn>
                            </div>
                         )}
                         {/* Edit button - hidden when editing */}
                         {editingProgramId !== log.id && (
                            <Button variant="ghost" size="sm" onClick={() => handleStartRename(log)} disabled={isRenaming}>
                               <Edit size={16} />
                            </Button>
                         )}
                      </CardHeader>
                       {/* Show renaming error if exists for this item */}
                       {editingProgramId === log.id && error && (
                           <CardContent className="p-4 pt-0 text-red-500 text-sm">
                               {error}
                           </CardContent>
                       )}
                    </Card>
                  ))}
                </div>
              ) : (
                // No programs found message
                <div className="text-center text-gray-600">
                  <p>Aucun programme trouvé pour votre compte.</p>
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