import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { FormData } from '@/components/ProgramForm'; // Import FormData type

// Définir le type pour les données récupérées de Supabase
export interface ProgramLog {
    id: number; // Assurez-vous que 'id' est le nom de la colonne clé primaire dans Supabase
    created_at: string;
    form_data: FormData; // Le type doit correspondre à la structure JSONB stockée
    program_title: string;
    program_description: string;
    user_email: string | null;
}

interface ProgramListProps {
  programs: ProgramLog[];
  onSelectProgram: (program: ProgramLog) => void;
  onBack: () => void;
}

const ProgramList: React.FC<ProgramListProps> = ({ programs, onSelectProgram, onBack }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto animate-in fade-in duration-500" id="program-list">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Vos programmes enregistrés</CardTitle>
        <CardDescription>Sélectionnez un programme pour le visualiser.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {programs.map((programLog) => (
          <div
            key={programLog.id}
            className="border rounded-md p-4 cursor-pointer hover:bg-muted transition-colors"
            onClick={() => onSelectProgram(programLog)}
          >
            <h3 className="text-lg font-semibold">{programLog.program_title || 'Programme sans titre'}</h3>
            <p className="text-sm text-muted-foreground">
              Généré le {new Date(programLog.created_at).toLocaleDateString('fr-FR')}
            </p>
            {/* Afficher quelques détails du formulaire si disponibles */}
            {programLog.form_data && (
                 <p className="text-sm text-muted-foreground mt-1">
                    Objectif: {programLog.form_data.goal || 'N/A'}, Niveau: {programLog.form_data.level || 'N/A'}, Jours: {programLog.form_data.days || 'N/A'}
                </p>
            )}
          </div>
        ))}
      </CardContent>
      <CardFooter>
          <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
      </CardFooter>
    </Card>
  );
};

export default ProgramList;