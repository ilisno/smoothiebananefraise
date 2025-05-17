import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, RotateCcw, CheckCircle2, Circle } from 'lucide-react'; // Ajout d'icônes
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Program, WorkoutDay, Exercise } from '@/lib/programGenerator';
import { useToast } from "@/components/ui/use-toast";
import { FormData } from '@/components/ProgramForm';
import { Checkbox } from '@/components/ui/checkbox'; // Ajout du composant Checkbox
import { Label } from '@/components/ui/label'; // Ajout du composant Label
import { cn } from '@/lib/utils'; // Pour combiner les classes Tailwind

type WorkoutProgramProps = {
  program: Program;
  onReset: () => void; // Utilisé pour revenir au formulaire ou à la liste
  formData: FormData;
  // Nouvelles props pour la progression
  userProgress?: { completed_weeks: { [week: string]: boolean } };
  onToggleWeekComplete?: (weekNumber: number, isComplete: boolean) => void;
  isSavingProgress?: boolean;
};

// Level map for PDF display
const levelMapPDF: Record<string, string> = {
    debutant: "Débutant",
    intermediaire: "Intermédiaire",
    avance: "Avancé"
};

// Goal map for PDF display
const goalMapPDF: Record<FormData['goal'], string> = {
    prise_masse: "Prise de Masse",
    seche: "Sèche / Perte de Gras",
    force: "Powerlifting",
    powerbuilding: "Powerbuilding"
};

// Helper function to format rest time from seconds string to simplified minutes
const formatRestTime = (rest: string | undefined): string => {
    if (!rest || rest === 'Comme nécessaire') {
        return 'Comme nécessaire';
    }

    // Attempt to parse the rest time string (e.g., "60-90s", "120s")
    const secondsMatch = rest.match(/(\d+)-?(\d*)s?/);

    if (secondsMatch) {
        const minSeconds = parseInt(secondsMatch[1], 10);
        const maxSeconds = secondsMatch[2] ? parseInt(secondsMatch[2], 10) : minSeconds;
        const avgSeconds = (minSeconds + maxSeconds) / 2;

        // Map average seconds to simplified minute values
        if (avgSeconds >= 120) { // 2 minutes or more
            return '3-5 min'; // Use a range for heavier lifts
        } else if (avgSeconds >= 75) { // Between 75s and 120s
            return '2-3 min'; // Use a range for compounds/hypertrophy
        } else if (avgSeconds >= 45) { // Between 45s and 75s
             return '1-2 min'; // Use a range for isolation/shorter rest
        } else { // Less than 45s
             return `${Math.round(avgSeconds)} sec`; // Keep seconds if very short
        }
    }

    return rest; // Return original if format is unexpected
};

// Helper to determine the week number for a given day index (0-based)
const getWeekNumber = (dayIndex: number): number => {
    // Assuming days are sequential, Day 1-7 is Week 1, Day 8-14 is Week 2, etc.
    return Math.floor(dayIndex / 7) + 1;
};


const WorkoutProgram: React.FC<WorkoutProgramProps> = ({
    program,
    onReset,
    formData,
    userProgress,
    onToggleWeekComplete,
    isSavingProgress
}) => {

  const { toast } = useToast();

  // Détermine si on est en mode "espace personnel" (avec suivi de progression)
  const isPersonalSpace = userProgress !== undefined && onToggleWeekComplete !== undefined;

  const exportToPDF = () => {
    const input = document.getElementById('program-content');
    if (!input) {
        toast({
            title: "Erreur PDF",
            description: "Impossible de trouver le contenu du programme pour l'export.",
            variant: "destructive",
        });
        return;
    }

    toast({
        title: "Génération PDF",
        description: "Génération du PDF en cours...",
    });

    // Temporarily hide progress tracking elements for PDF
    const progressElements = input.querySelectorAll('.progress-tracker');
    progressElements.forEach(el => (el as HTMLElement).style.display = 'none');


    const originalStyles = {
        boxShadow: input.style.boxShadow,
        padding: input.style.padding,
    };
    input.style.boxShadow = 'none';
    input.style.padding = '20px';

    html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (document) => {
            const pdfOnlyElements = document.querySelectorAll('.pdf-only');
            pdfOnlyElements.forEach(el => (el as HTMLElement).style.display = 'block');
            const screenOnlyElements = document.querySelectorAll('.screen-only');
            screenOnlyElements.forEach(el => (el as HTMLElement).style.display = 'none');

            // Update PDF header/footer with correct mapped values
            const pdfTitleElement = document.querySelector('.pdf-only h2');
            if (pdfTitleElement && formData) {
                 pdfTitleElement.textContent = `Programme ${goalMapPDF[formData.goal]} - ${levelMapPDF[formData.level]}`;
            }
             const pdfDescriptionElement = document.querySelector('.pdf-only p.text-sm');
             if (pdfDescriptionElement && formData) {
                 const splitMapPDF: Record<string, string> = {
                     full_body: "Full Body",
                     half_body: "Half Body (Haut/Bas)",
                     ppl: "Push Pull Legs",
                     autre: "Adapté"
                 };
                 // Extract effective split from program description if possible, fallback to form data
                 const effectiveSplitMatch = program.description.match(/Format (.*) sur/);
                 const effectiveSplitPDF = effectiveSplitMatch ? effectiveSplitMatch[1] : splitMapPDF[formData.split] || 'Inconnu';

                 pdfDescriptionElement.textContent = `Format ${effectiveSplitPDF} sur ${formData.days} jours. Objectif: ${goalMapPDF[formData.goal]}. Durée max: ${formData.duration} min.`;
             }

             // Update rest times in the cloned document for PDF
             const restCells = document.querySelectorAll('#program-content table td:nth-child(5)'); // Select the 5th cell (Rest)
             restCells.forEach(cell => {
                 const originalText = cell.textContent || '';
                 cell.textContent = formatRestTime(originalText); // Use the simplified format for PDF too
             });

             // Ensure progress elements remain hidden in the cloned document
             const clonedProgressElements = document.querySelectorAll('.progress-tracker');
             clonedProgressElements.forEach(el => (el as HTMLElement).style.display = 'none');
        }
    })
    .then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

      // Restore original styles and show progress elements after canvas is created
      input.style.boxShadow = originalStyles.boxShadow;
      input.style.padding = originalStyles.padding;
      progressElements.forEach(el => (el as HTMLElement).style.display = 'flex'); // Assuming they are flex containers

      const filename = `Programme_${formData?.goal || 'perso'}_${levelMapPDF[formData?.level || 'debutant']}.pdf`.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
      pdf.save(filename);
      toast({
          title: "PDF Généré",
          description: "Le PDF a été généré avec succès !",
      });
    })
    .catch(err => {
        console.error("erreur lors de la génération du PDF:", err);
        // Restore original styles and show progress elements even on error
        input.style.boxShadow = originalStyles.boxShadow;
        input.style.padding = originalStyles.padding;
        progressElements.forEach(el => (el as HTMLElement).style.display = 'flex'); // Assuming they are flex containers

        toast({
            title: "Erreur PDF",
            description: "Erreur lors de la génération du PDF.",
            variant: "destructive",
        });
    });
  };

  // Group days by week number
  const weeks: { [week: number]: WorkoutDay[] } = {};
  program.schedule.forEach((day, index) => {
      const weekNumber = getWeekNumber(index);
      if (!weeks[weekNumber]) {
          weeks[weekNumber] = [];
      }
      weeks[weekNumber].push(day);
  });

  const weekNumbers = Object.keys(weeks).map(Number).sort((a, b) => a - b);


  return (
    <Card className="w-full max-w-4xl mx-auto animate-in fade-in duration-700" id="workout-program">
       <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 screen-only">
            <div>
                <CardTitle className="text-2xl font-bold">{program.title}</CardTitle> {/* Utilise le titre du programme */}
                <CardDescription>{program.description}</CardDescription> {/* Utilise la description du programme */}
            </div>
            <div className="flex flex-wrap gap-2">
                 <Button variant="outline" onClick={onReset}>
                    {isPersonalSpace ? (
                        <>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
                        </>
                    ) : (
                        <>
                            <RotateCcw className="mr-2 h-4 w-4" /> Nouveau programme
                        </>
                    )}
                </Button>
                <Button onClick={exportToPDF}>
                    <Download className="mr-2 h-4 w-4" /> Exporter en PDF
                </Button>
            </div>
        </CardHeader>
      <CardContent id="program-content" className="p-6">
         {/* PDF Header - Hidden on screen */}
         <div className="hidden pdf-only mb-6">
             <h1 className="text-3xl font-bold mb-2">Smoothie Banane Fraise 🍌🍓</h1>
             {/* Title and Description will be updated by html2canvas onclone */}
             <h2 className="text-xl font-semibold mb-1"></h2>
             <p className="text-sm text-gray-600 mb-4"></p>
             <hr className="my-4"/>
         </div>

        {weekNumbers.map(weekNumber => (
            <div key={`week-${weekNumber}`} className="mb-10 last:mb-0 border rounded-md p-4">
                <div className={cn("flex items-center justify-between mb-4", isPersonalSpace && "border-b pb-3")}>
                    <h3 className="text-xl font-semibold">Semaine {weekNumber}</h3>
                    {isPersonalSpace && userProgress && onToggleWeekComplete && (
                        <div className="flex items-center space-x-2 progress-tracker"> {/* Added class for hiding in PDF */}
                            <Label htmlFor={`week-complete-${weekNumber}`} className="text-sm font-medium cursor-pointer">
                                Complétée
                            </Label>
                            <Checkbox
                                id={`week-complete-${weekNumber}`}
                                checked={!!userProgress.completed_weeks[weekNumber.toString()]}
                                onCheckedChange={(checked) => onToggleWeekComplete(weekNumber, !!checked)}
                                disabled={isSavingProgress}
                            />
                        </div>
                    )}
                </div>
                {weeks[weekNumber].map((day: WorkoutDay) => (
                    <div key={day.day} className="mb-6 last:mb-0">
                        <h4 className="text-lg font-semibold mb-2 text-primary">{day.title}</h4>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">Exercice</TableHead>
                                    <TableHead>Séries</TableHead>
                                    <TableHead>Répétitions</TableHead>
                                    <TableHead>RPE</TableHead>
                                    <TableHead>Repos</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {day.exercises.map((exercise: Exercise, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{exercise.name}</TableCell>
                                        <TableCell>{exercise.sets}</TableCell>
                                        <TableCell>{exercise.reps}</TableCell>
                                        <TableCell>{exercise.rpe ?? '-'}</TableCell>
                                        <TableCell>{formatRestTime(exercise.rest ?? 'Comme nécessaire')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ))}
            </div>
        ))}

         {/* PDF Footer - Hidden on screen */}
         <div className="hidden pdf-only mt-8 pt-4 border-t text-center text-xs text-gray-500">
            <p>Programme généré par Smoothie Banane Fraise le {new Date().toLocaleDateString('fr-FR')}</p>
            <p>Ceci est un exemple de programme. Consultez un professionnel avant de commencer.</p>
         </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutProgram;