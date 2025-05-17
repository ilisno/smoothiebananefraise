import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import ProgramList, { ProgramLog } from '@/components/ProgramList'; // Réutilisation du composant liste
import WorkoutProgram, { Program } from '@/components/WorkoutProgram'; // Réutilisation du composant programme
import { ProgramGenerator } from '@/lib/programGenerator'; // Pour re-générer le programme à partir des form_data
import { FormData } from '@/components/ProgramForm'; // Import du type FormData
import { Label } from '@/components/ui/label'; // <-- Ajout de cet import

// Définir le type pour les données de progression
interface UserProgramProgress {
    id?: number; // Optional for new entries
    user_email: string;
    program_log_id: number;
    completed_weeks: { [week: string]: boolean }; // e.g., { "1": true, "2": false }
}

const PersonalSpacePage: React.FC = () => {
  const [userEmail, setUserEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'email_input' | 'list' | 'program'>('email_input'); // Gère l'affichage
  const [retrievedPrograms, setRetrievedPrograms] = useState<ProgramLog[]>([]);
  const [selectedProgramLog, setSelectedProgramLog] = useState<ProgramLog | null>(null);
  const [isRetrievingPrograms, setIsRetrievingPrograms] = useState(false);

  const [generatedProgram, setGeneratedProgram] = useState<Program | null>(null); // Le programme généré à afficher
  const [userProgress, setUserProgress] = useState<UserProgramProgress | null>(null); // La progression de l'utilisateur pour ce programme
  const [isSavingProgress, setIsSavingProgress] = useState(false);


  const { toast } = useToast();

  // Fonction pour récupérer les programmes de l'utilisateur
  const fetchUserPrograms = async (email: string) => {
    setIsRetrievingPrograms(true);
    setRetrievedPrograms([]);
    setSelectedProgramLog(null);
    setGeneratedProgram(null);
    setUserProgress(null);
    setEmailError(null);

    try {
      const { data, error } = await supabase
        .from('program_generation_logs')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching programs:', error);
        setEmailError("Impossible de retrouver vos programmes. Veuillez réessayer.");
        setViewMode('email_input');
      } else if (data && data.length > 0) {
        console.log(`Found ${data.length} programs for ${email}`);
        setRetrievedPrograms(data as ProgramLog[]);
        setViewMode('list');
      } else {
        console.log(`No programs found for ${email}`);
        setEmailError("Aucun programme trouvé pour cet email.");
        setViewMode('email_input');
      }
    } catch (e) {
      console.error('Exception during program retrieval:', e);
      setEmailError("Une erreur inattendue est survenue.");
      setViewMode('email_input');
    } finally {
      setIsRetrievingPrograms(false);
    }
  };

  // Gère la soumission de l'email
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !/\S+@\S+\.\S+/.test(emailInput)) {
      setEmailError("Veuillez entrer une adresse email valide.");
      return;
    }
    setUserEmail(emailInput); // Stocke l'email validé
    fetchUserPrograms(emailInput); // Lance la récupération
  };

  // Gère la sélection d'un programme dans la liste
  const handleSelectProgram = async (programLog: ProgramLog) => {
      setSelectedProgramLog(programLog);
      setIsRetrievingPrograms(true); // Utilise l'état de chargement pour l'affichage

      try {
          // Re-génère l'objet Program complet à partir des form_data stockées
          const generator = new ProgramGenerator(programLog.form_data as FormData); // Cast pour s'assurer du type
          const program: Program = generator.generate();
          program.title = programLog.program_title;
          program.description = programLog.program_description;
          setGeneratedProgram(program);

          // Récupère la progression existante pour ce programme et cet utilisateur
          const { data: progressData, error: progressError } = await supabase
              .from('user_program_progress')
              .select('*')
              .eq('user_email', userEmail)
              .eq('program_log_id', programLog.id)
              .single();

          if (progressError && progressError.code !== 'PGRST116') { // PGRST116 = row not found, which is expected for new programs
              console.error('Error fetching user progress:', progressError);
              // Continuer sans progression si erreur de fetch (sauf si non trouvé)
              setUserProgress({ user_email: userEmail, program_log_id: programLog.id, completed_weeks: {} });
          } else if (progressData) {
              setUserProgress(progressData as UserProgramProgress);
          } else {
              // Si aucune progression trouvée, initialise un objet vide
              setUserProgress({ user_email: userEmail, program_log_id: programLog.id, completed_weeks: {} });
          }

          setViewMode('program'); // Passe en mode affichage du programme

      } catch (e) {
          console.error("Error loading program or progress:", e);
           toast({
              title: "Erreur",
              description: "Impossible d'afficher ce programme ou sa progression.",
              variant: "destructive",
          });
          setViewMode('list'); // Retour à la liste en cas d'erreur
      } finally {
          setIsRetrievingPrograms(false);
      }
  };

  // Gère le retour à la liste des programmes
  const handleBackToList = () => {
      setGeneratedProgram(null);
      setSelectedProgramLog(null);
      setUserProgress(null);
      setViewMode('list');
  };

  // Gère le retour à la saisie de l'email
  const handleBackToEmailInput = () => {
      setUserEmail('');
      setEmailInput('');
      setRetrievedPrograms([]);
      setSelectedProgramLog(null);
      setGeneratedProgram(null);
      setUserProgress(null);
      setEmailError(null);
      setViewMode('email_input');
  };

  // Fonction pour marquer une semaine comme complétée/incomplète
  const handleToggleWeekComplete = async (weekNumber: number, isComplete: boolean) => {
      if (!userProgress || !selectedProgramLog) return;

      setIsSavingProgress(true);

      const updatedCompletedWeeks = {
          ...userProgress.completed_weeks,
          [weekNumber.toString()]: isComplete,
      };

      try {
          const { data, error } = await supabase
              .from('user_program_progress')
              .upsert(
                  {
                      user_email: userEmail,
                      program_log_id: selectedProgramLog.id,
                      completed_weeks: updatedCompletedWeeks,
                  },
                  { onConflict: 'user_email, program_log_id' } // Utilise le conflit sur la clé unique
              )
              .select() // Sélectionne les données mises à jour
              .single();

          if (error) {
              console.error('Error saving progress:', error);
              toast({
                  title: "Erreur de sauvegarde",
                  description: "Impossible d'enregistrer votre progression.",
                  variant: "destructive",
              });
          } else if (data) {
              console.log('Progress saved successfully:', data);
              setUserProgress(data as UserProgramProgress); // Met à jour l'état local avec les données de Supabase
              toast({
                  title: "Progression enregistrée !",
                  description: `Semaine ${weekNumber} marquée comme ${isComplete ? 'complétée' : 'incomplète'}.`,
              });
          }
      } catch (e) {
          console.error('Exception saving progress:', e);
           toast({
              title: "Erreur de sauvegarde",
              description: "Une erreur inattendue est survenue lors de l'enregistrement.",
              variant: "destructive",
          });
      } finally {
          setIsSavingProgress(false);
      }
  };


  return (
    <>
      <Helmet>
        <title>Mon Espace Personnel - Programmes Musculation | Smoothie Banane Fraise</title>
        <meta name="description" content="Retrouvez vos programmes de musculation personnalisés générés et suivez votre progression semaine par semaine dans votre espace personnel." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col min-h-screen">
        <header className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Mon Espace Personnel
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Retrouvez ici tous les programmes de musculation que vous avez générés et suivez votre progression.
          </p>
        </header>

        <main className="flex-grow flex items-center justify-center">
          {/* Saisie de l'email */}
          {viewMode === 'email_input' && (
            <Card className="w-full max-w-md animate-in fade-in duration-500">
              <CardHeader>
                <CardTitle>Accéder à mes programmes</CardTitle>
                <CardDescription>Entrez l'adresse email utilisée lors de la génération de vos programmes.</CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-personal-space">Adresse email</Label>
                    <Input
                      id="email-personal-space"
                      type="email"
                      placeholder="vous@email.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                      disabled={isEmailSubmitting || isRetrievingPrograms}
                    />
                    {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isEmailSubmitting || isRetrievingPrograms || !emailInput.trim()}>
                    {(isEmailSubmitting || isRetrievingPrograms) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Retrouver mes programmes
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* Affichage de la liste des programmes */}
          {viewMode === 'list' && retrievedPrograms.length > 0 && (
              <ProgramList
                  programs={retrievedPrograms}
                  onSelectProgram={handleSelectProgram}
                  onBack={handleBackToEmailInput} // Retour à la saisie email
              />
          )}

           {/* Affichage du programme sélectionné */}
          {viewMode === 'program' && generatedProgram && selectedProgramLog && userProgress && (
              <WorkoutProgram
                  program={generatedProgram}
                  onReset={handleBackToList} // Le bouton "Nouveau programme" revient à la liste
                  formData={selectedProgramLog.form_data as FormData} // Passe les form_data
                  userProgress={userProgress} // Passe la progression
                  onToggleWeekComplete={handleToggleWeekComplete} // Passe la fonction de toggle
                  isSavingProgress={isSavingProgress} // Passe l'état de sauvegarde
              />
          )}

           {/* Skeleton ou message de chargement */}
           {(isEmailSubmitting || isRetrievingPrograms) && viewMode !== 'program' && (
             <div className="w-full max-w-md mx-auto space-y-4 text-center">
                <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">Chargement des programmes...</p>
             </div>
           )}

        </main>

        {/* Le popup d'affiliation n'est pas affiché sur cette page */}

        <footer className="text-center mt-12 py-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            © {new Date().getFullYear()} Smoothie Banane Fraise - Votre <strong>générateur de programme personnalisé musculation gratuit</strong>. Tous droits réservés.
          </p>
        </footer>
      </div>
    </>
  );
};

export default PersonalSpacePage;