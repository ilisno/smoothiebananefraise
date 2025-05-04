import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, RotateCcw } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Program, WorkoutDay, Exercise } from '@/lib/programGenerator';
import { useToast } from "@/components/ui/use-toast";
import { FormData } from '@/components/ProgramForm';

type WorkoutProgramProps = {
  program: Program;
  onReset: () => void;
  formData: FormData;
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

// Helper function to format rest time from seconds to minutes
const formatRestTime = (rest: string | undefined): string => {
    if (!rest || rest === 'Comme nécessaire') {
        return 'Comme nécessaire';
    }
    // Remove 's' and split by '-'
    const parts = rest.replace('s', '').split('-').map(Number);

    if (parts.length === 1) {
        const minutes = parts[0] / 60;
        return minutes >= 1 ? `${minutes} min` : `${parts[0]} sec`; // Keep seconds if less than a minute
    } else if (parts.length === 2) {
        const minMinutes = parts[0] / 60;
        const maxMinutes = parts[1] / 60;
        // Format based on whether they are whole minutes or need decimals
        const formatMin = minMinutes % 1 === 0 ? minMinutes.toString() : minMinutes.toFixed(1);
        const formatMax = maxMinutes % 1 === 0 ? maxMinutes.toString() : maxMinutes.toFixed(1);
        return `${formatMin}-${formatMax} min`;
    }
    return rest; // Return original if format is unexpected
};


const WorkoutProgram: React.FC<WorkoutProgramProps> = ({ program, onReset, formData }) => {

  const { toast } = useToast();

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
                 const effectiveSplitMatch = program.description.match(/Format (.*) sur/);
                 const effectiveSplitPDF = effectiveSplitMatch ? effectiveSplitMatch[1] : splitMapPDF[formData.split] || 'Inconnu';

                 pdfDescriptionElement.textContent = `Format ${effectiveSplitPDF} sur ${formData.days} jours. Objectif: ${goalMapPDF[formData.goal]}. Durée max: ${formData.duration} min.`;
             }

             // Update rest times in the cloned document for PDF
             const restCells = document.querySelectorAll('#program-content table td:nth-child(5)'); // Select the 5th cell (Rest)
             restCells.forEach(cell => {
                 const originalText = cell.textContent || '';
                 cell.textContent = formatRestTime(originalText);
             });
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

      input.style.boxShadow = originalStyles.boxShadow;
      input.style.padding = originalStyles.padding;

      const filename = `Programme_${formData?.goal || 'perso'}_${levelMapPDF[formData?.level || 'debutant']}.pdf`.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
      pdf.save(filename);
      toast({
          title: "PDF Généré",
          description: "Le PDF a été généré avec succès !",
      });
    })
    .catch(err => {
        console.error("erreur lors de la génération du PDF:", err);
        input.style.boxShadow = originalStyles.boxShadow;
        input.style.padding = originalStyles.padding;
        toast({
            title: "Erreur PDF",
            description: "Erreur lors de la génération du PDF.",
            variant: "destructive",
        });
    });
  };


  return (
    <Card className="w-full max-w-4xl mx-auto animate-in fade-in duration-700" id="workout-program">
       <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 screen-only">
            <div>
                <CardTitle className="text-2xl font-bold">Votre Programme Personnalisé</CardTitle>
                <CardDescription>{program.description}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
                 <Button variant="outline" onClick={onReset}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Nouveau Programme
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

        {program.schedule.map((day: WorkoutDay) => (
          <div key={day.day} className="mb-8 last:mb-0">
            <h3 className="text-xl font-semibold mb-3 border-b pb-2">{day.title}</h3>
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
                    {/* Use the formatRestTime helper for display */}
                    <TableCell>{formatRestTime(exercise.rest ?? 'Comme nécessaire')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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