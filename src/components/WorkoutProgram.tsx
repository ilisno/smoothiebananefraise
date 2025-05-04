import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, RotateCcw, Share2 } from 'lucide-react'; // Import Share2 icon
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Program, WorkoutDay, Exercise } from '@/pages/Index'; // Import types from Index
import { showSuccess, showError } from '@/utils/toast';

type WorkoutProgramProps = {
  program: Program;
  onReset: () => void;
  formData: any; // Receive form data if needed for display or PDF
};

const WorkoutProgram: React.FC<WorkoutProgramProps> = ({ program, onReset, formData }) => {

  const exportToPDF = () => {
    const input = document.getElementById('program-content');
    if (!input) {
        showError("Erreur: Impossible de trouver le contenu du programme pour l'export.");
        return;
    }

    showSuccess("Génération du PDF en cours...");

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

      const filename = `Programme_${formData?.goal || 'perso'}_${formData?.level || 'standard'}.pdf`.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
      pdf.save(filename);
      showSuccess("PDF généré avec succès !");
    })
    .catch(err => {
        console.error("Erreur lors de la génération du PDF:", err);
        showError("Erreur lors de la génération du PDF.");
        input.style.boxShadow = originalStyles.boxShadow;
        input.style.padding = originalStyles.padding;
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Smoothie Banane Fraise - Générateur de Programme Muscu',
      text: 'Viens générer ton programme de musculation personnalisé gratuitement ! 💪🍌🍓',
      url: window.location.href // Share the current page URL
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showSuccess('Merci pour le partage !');
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(shareData.url);
        showSuccess('Lien copié dans le presse-papiers ! Partage-le à tes amis.');
      }
    } catch (err) {
      // Handle errors (e.g., user cancelled share)
      // Don't show error if it's just AbortError (user cancellation)
      if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Erreur de partage:', err);
          showError('Le partage a échoué. Réessaie ou copie le lien manuellement.');
      } else {
          console.log('Partage annulé par l\'utilisateur ou non supporté.');
      }
    }
  };


  return (
    <Card className="w-full max-w-4xl mx-auto animate-in fade-in duration-700" id="workout-program">
       <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 screen-only">
            <div>
                <CardTitle className="text-2xl font-bold">Votre Programme Personnalisé</CardTitle>
                <CardDescription>{program.description}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2"> {/* Use gap for spacing and flex-wrap */}
                 <Button variant="outline" onClick={onReset}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Nouveau Programme
                </Button>
                <Button onClick={exportToPDF}>
                    <Download className="mr-2 h-4 w-4" /> Exporter en PDF
                </Button>
                 <Button variant="secondary" onClick={handleShare}> {/* Added Share Button */}
                    <Share2 className="mr-2 h-4 w-4" /> Partager
                </Button>
            </div>
        </CardHeader>
      <CardContent id="program-content" className="p-6">
         {/* PDF Header - Hidden on screen */}
         <div className="hidden pdf-only mb-6">
             <h1 className="text-3xl font-bold mb-2">Smoothie Banane Fraise 🍌🍓</h1>
             <h2 className="text-xl font-semibold mb-1">{program.title}</h2>
             <p className="text-sm text-gray-600 mb-4">{program.description}</p>
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
                    <TableCell>{exercise.rest ?? 'Comme nécessaire'}</TableCell>
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