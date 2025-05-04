import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, RotateCcw } from 'lucide-react';
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

    // Temporarily adjust styles for better PDF rendering if needed
    // e.g., ensure background colors are captured, remove shadows that might render poorly
    const originalStyles = {
        boxShadow: input.style.boxShadow,
        padding: input.style.padding,
    };
    input.style.boxShadow = 'none';
    input.style.padding = '20px'; // Add padding for PDF margins

    html2canvas(input, {
        scale: 2, // Increase scale for better resolution
        useCORS: true, // If you have external images/fonts
        logging: false, // Disable console logging from html2canvas
        onclone: (document) => {
            // You can modify the cloned document here before rendering if needed
            // e.g., hide elements specifically for PDF
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
        format: [canvas.width, canvas.height] // Use canvas dimensions for page size
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

      // Restore original styles
      input.style.boxShadow = originalStyles.boxShadow;
      input.style.padding = originalStyles.padding;

      // Sanitize filename
      const filename = `Programme_${formData?.goal || 'perso'}_${formData?.level || 'standard'}.pdf`.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
      pdf.save(filename);
      showSuccess("PDF généré avec succès !");
    })
    .catch(err => {
        console.error("Erreur lors de la génération du PDF:", err);
        showError("Erreur lors de la génération du PDF.");
        // Restore original styles even on error
        input.style.boxShadow = originalStyles.boxShadow;
        input.style.padding = originalStyles.padding;
    });
  };


  return (
    <Card className="w-full max-w-4xl mx-auto" id="workout-program">
       <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 screen-only">
            <div>
                <CardTitle className="text-2xl font-bold">Votre Programme Personnalisé</CardTitle>
                <CardDescription>{program.description}</CardDescription>
            </div>
            <div className="flex space-x-2">
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