import React, { useState, useEffect } from 'react';
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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription as CardDescriptionShadcn } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { generateProgramClientSide, Program, ProgramFormData } from '@/utils/programGenerator'; // Import generator and types
import { ArrowLeft } from 'lucide-react'; // Import back arrow icon

// Define the schema for email validation (still needed for program retrieval by email)
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
  user_id: string; // Add user_id to link logs to auth.users
}

// Define type for user profile
interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

const MonEspace: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any | null>(null); // Supabase user object
  const [profile, setProfile] = useState<UserProfile | null>(null); // User profile from public.profiles
  const [programLogs, setProgramLogs] = useState<ProgramLog[] | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading to check auth
  const [error, setError] = useState<string | null>(null);

  // Initialize the email form (still used for retrieving programs by email if user is not logged in)
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  // --- Authentication Check and Profile Fetch ---
  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        console.log("Authenticated user:", user);

        // Fetch profile data from the public.profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single(); // Expecting a single row

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setError("Impossible de charger votre profil.");
          showError("Impossible de charger votre profil.");
          setProfile(null); // Ensure profile is null on error
        } else {
          console.log("Fetched profile:", profileData);
          setProfile(profileData as UserProfile); // Set the fetched profile
        }

        // Automatically fetch programs for the logged-in user
        fetchProgramsForUser(user.id);

      } else {
        setUser(null);
        setProfile(null);
        setProgramLogs(null); // Clear programs if not logged in
        setIsLoading(false); // Stop loading if no user
        console.log("No authenticated user found, showing email form.");
        // No redirect here, we show the email form instead
      }
    };

    checkAuthAndFetchProfile();

    // Listen for auth state changes to update user/profile state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session);
      if (session?.user) {
        setUser(session.user);
        // Re-fetch profile and programs when user logs in
        checkAuthAndFetchProfile();
      } else {
        setUser(null);
        setProfile(null);
        setProgramLogs(null);
        setSelectedProgram(null); // Clear selected program
        setIsLoading(false); // Stop loading when user logs out
        console.log("User logged out.");
      }
    });

    return () => subscription.unsubscribe(); // Cleanup subscription
  }, []); // Empty dependency array: run once on mount and listen for changes

  // --- Fetch Programs for Authenticated User ---
  const fetchProgramsForUser = async (userId: string) => {
      setIsLoading(true);
      setError(null);
      setProgramLogs(null); // Clear previous results
      setSelectedProgram(null); // Clear any selected program

      try {
        // Fetch program logs from Supabase for the logged-in user ID
        const { data, error: dbError } = await supabase
          .from('program_generation_logs')
          .select('*') // Select all columns
          .eq('user_id', userId) // Filter by user_id
          .order('created_at', { ascending: false }); // Order by newest first

        if (dbError) {
          console.error("Error fetching program logs for user:", dbError);
          setError("Une erreur est survenue lors de la récupération de vos programmes.");
          showError("Impossible de charger vos programmes.");
        } else {
          console.log("Fetched program logs for user:", data);
          if (data && data.length > 0) {
            setProgramLogs(data as ProgramLog[]); // Cast data to ProgramLog[]
            // showSuccess(`Trouvé ${data.length} programme(s) pour cet email.`); // Avoid toast on initial load
          } else {
            setProgramLogs([]); // Set to empty array if no programs found
            // showError("Aucun programme trouvé pour cet email."); // Avoid toast on initial load
          }
        }
      } catch (err) {
        console.error("Unexpected error fetching logs for user:", err);
        setError("Une erreur inattendue est survenue.");
        showError("Une erreur inattendue est survenue.");
      } finally {
        setIsLoading(false);
      }
  };


  // --- Handle Email Form Submission (for non-authenticated users) ---
  // This part remains to allow users to retrieve programs by email even if they don't have an account
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
        console.error("Error fetching program logs by email:", dbError);
        setError("Une erreur est survenue lors de la récupération de vos programmes.");
        showError("Impossible de charger vos programmes.");
      } else {
        console.log("Fetched program logs by email:", data);
        if (data && data.length > 0) {
          setProgramLogs(data as ProgramLog[]); // Cast data to ProgramLog[]
          showSuccess(`Trouvé ${data.length} programme(s) pour cet email.`);
        } else {
          setProgramLogs([]); // Set to empty array if no programs found
          showError("Aucun programme trouvé pour cet email.");
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching logs by email:", err);
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

  // Handle user logout
  const handleLogout = async () => {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
          console.error("Error logging out:", error);
          showError("Erreur lors de la déconnexion.");
          setIsLoading(false); // Stop loading even on error
      } else {
          showSuccess("Déconnexion réussie !");
          // The auth state change listener will handle clearing state and potentially redirecting
      }
  };


  // --- Render Logic ---

  // Show loading state initially or during auth check/data fetch
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <p>Chargement...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // If user is authenticated, show their space
  if (user) {
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
                     <CardTitle className="text-2xl font-bold text-gray-800">
                        Bonjour {profile?.first_name || user.email}!
                     </CardTitle>
                     <CardDescriptionShadcn className="text-gray-600">
                        Retrouvez ici vos programmes générés.
                     </CardDescriptionShadcn>
                  </>
               )}
            </CardHeader>
            <CardContent>
              {error && <p className="text-red-500 text-center mb-4">{error}</p>}
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
                // Display list of program logs for the logged-in user
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
                  // No programs found message for logged-in user
                  <div className="text-center text-gray-600">
                    <p>Vous n'avez pas encore généré de programme avec ce compte.</p>
                     <Button onClick={() => navigate('/programme')} className="mt-4 bg-sbf-red text-white hover:bg-red-700">Générer mon premier programme</Button>
                  </div>
                )
              )}
              {/* Logout Button */}
              {!selectedProgram && ( // Only show logout button when viewing the list
                 <div className="text-center mt-8">
                    <Button variant="outline" onClick={handleLogout} disabled={isLoading}>
                       Se déconnecter
                    </Button>
                 </div>
              )}
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // If user is NOT authenticated, show the email form to retrieve programs by email
  // This is the fallback for users without an account or who are logged out
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 flex justify-center items-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Mon Espace</CardTitle>
            <CardDescriptionShadcn className="text-gray-600">
              Connectez-vous ou entrez votre email pour retrouver vos programmes générés.
            </CardDescriptionShadcn>
          </CardHeader>
          <CardContent>
            {/* Option 1: Login/Signup Link */}
            <div className="text-center mb-6">
               <p className="text-gray-700 mb-2">Vous avez un compte ?</p>
               <Button asChild className="w-full bg-sbf-red text-white hover:bg-red-700">
                  <a href="/login">Se connecter ou créer un compte</a> {/* Use a tag for full page reload to ensure auth state is picked up */}
               </Button>
            </div>

            {/* Separator */}
            <div className="relative flex justify-center text-xs uppercase mb-6">
              <span className="bg-white px-2 text-gray-500">Ou</span>
            </div>

            {/* Option 2: Retrieve by Email Form */}
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
                  {isLoading ? 'Recherche...' : 'Retrouver mes programmes par email'}
                </Button>
              </form>
            </Form>

             {/* Display program list or selected program details if retrieved by email */}
             {programLogs !== null && ( // Only show this section if email search has been attempted
                <div className="mt-8">
                   {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                   {selectedProgram ? (
                     // Display selected program details (same as authenticated view)
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
                     // Display list of program logs found by email
                     programLogs.length > 0 ? (
                       <div className="space-y-4">
                         <h3 className="text-xl font-bold text-gray-800 text-center mb-4">Programmes trouvés</h3>
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
                       // No programs found message for email search
                       <div className="text-center text-gray-600">
                         <p>Aucun programme trouvé pour cet email.</p>
                          <Button onClick={() => setUserEmail(null)} className="mt-4">Essayer un autre email</Button>
                       </div>
                     )
                   )}
                    {/* Back to email search button when viewing a program found by email */}
                   {selectedProgram && (
                      <div className="text-center mt-8">
                         <Button onClick={handleBackToList} variant="outline">Retour à la liste des programmes</Button>
                      </div>
                   )}
                </div>
             )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default MonEspace;