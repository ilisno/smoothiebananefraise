import { FormData } from '@/components/ProgramForm'; // Assuming FormData type is exported

// --- Types ---
export type Exercise = {
    name: string;
    sets: number | string; // Can be "3" or "3-4"
    reps: number | string; // Can be "5", "8-12", "AMRAP"
    rpe?: number | string; // Optional RPE, e.g., 8 or "7-8"
    rest?: string; // e.g., "60-90s"
    notes?: string; // e.g., "Focus on form"
};

export type WorkoutDay = {
    day: number;
    title: string; // e.g., "Push A", "Legs", "Full Body B"
    exercises: Exercise[];
};

export type Program = {
    title: string;
    description: string;
    schedule: WorkoutDay[];
};

// --- Exercise Database (Simplified Example) ---
// In a real app, this would be much larger and more structured
const exerciseDB = {
    compound: {
        barbell: [
            { name: "Squat", target: ["legs", "glutes"] },
            { name: "Bench Press", target: ["chest", "shoulders", "triceps"] },
            { name: "Deadlift", target: ["back", "legs", "glutes", "hamstrings"] },
            { name: "Overhead Press (OHP)", target: ["shoulders", "triceps"] },
            { name: "Barbell Row", target: ["back", "biceps"] },
        ],
        dumbbell: [
            { name: "Dumbbell Bench Press", target: ["chest", "shoulders", "triceps"] },
            { name: "Dumbbell Row", target: ["back", "biceps"] },
            { name: "Goblet Squat", target: ["legs", "glutes"] },
            { name: "Romanian Deadlift (RDL)", target: ["hamstrings", "glutes", "back"] },
        ],
        bodyweight: [
            { name: "Pull-ups / Chin-ups", target: ["back", "biceps"] },
            { name: "Dips", target: ["chest", "shoulders", "triceps"] },
            { name: "Push-ups", target: ["chest", "shoulders", "triceps"] },
            { name: "Bodyweight Squat", target: ["legs", "glutes"] },
            { name: "Lunges", target: ["legs", "glutes"] },
        ],
        machine: [
            { name: "Leg Press", target: ["legs", "glutes"] },
            { name: "Lat Pulldown", target: ["back", "biceps"] },
            { name: "Chest Press Machine", target: ["chest", "shoulders", "triceps"] },
            { name: "Seated Cable Row", target: ["back", "biceps"] },
        ],
        kettlebell: [
             { name: "Kettlebell Swing", target: ["hamstrings", "glutes", "back", "conditioning"] },
             { name: "Kettlebell Goblet Squat", target: ["legs", "glutes"] },
        ],
    },
    isolation: {
        barbell: [
            { name: "Bicep Curl (Barbell)", target: ["biceps"] },
            { name: "Skullcrushers", target: ["triceps"] },
        ],
        dumbbell: [
            { name: "Bicep Curl (Dumbbell)", target: ["biceps"] },
            { name: "Triceps Extension (Dumbbell)", target: ["triceps"] },
            { name: "Lateral Raise", target: ["shoulders"] },
            { name: "Hammer Curl", target: ["biceps", "forearms"] },
        ],
        bodyweight: [
             { name: "Calf Raises", target: ["calves"] },
             { name: "Glute Bridge", target: ["glutes"] },
        ],
        machine: [
            { name: "Leg Extension", target: ["quads"] },
            { name: "Leg Curl", target: ["hamstrings"] },
            { name: "Triceps Pushdown", target: ["triceps"] },
            { name: "Bicep Curl Machine", target: ["biceps"] },
            { name: "Pec Deck Fly", target: ["chest"] },
        ],
         elastiques: [
            { name: "Banded Pull-Apart", target: ["upper back", "shoulders"] },
            { name: "Banded Triceps Extension", target: ["triceps"] },
            { name: "Banded Bicep Curl", target: ["biceps"] },
        ],
         kettlebell: [
             { name: "Kettlebell Halo", target: ["shoulders", "core"] },
         ],
    }
};

// --- Helper Functions ---

function getAvailableExercises(equipment: FormData['equipment'], type: 'compound' | 'isolation'): { name: string, target: string[] }[] {
    let available: { name: string, target: string[] }[] = [];
    if (equipment.barre_halteres) {
        available = available.concat(exerciseDB[type].barbell, exerciseDB[type].dumbbell);
    } else if (equipment.kettlebells && !equipment.barre_halteres) { // Prioritize KB if no bar/db
         available = available.concat(exerciseDB[type].kettlebell);
    }
    if (equipment.machines_guidees) {
        available = available.concat(exerciseDB[type].machine);
    }
     if (equipment.elastiques) {
        available = available.concat(exerciseDB[type].elastiques);
    }
    // Always include bodyweight if selected or as fallback
    if (equipment.poids_corp || available.length === 0) {
         available = available.concat(exerciseDB[type].bodyweight);
    }

    // Remove duplicates
    return available.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i);
}

function getSetsRepsRpe(goal: FormData['goal'], level: FormData['level'], type: 'compound' | 'isolation'): Pick<Exercise, 'sets' | 'reps' | 'rpe' | 'rest'> {
    let sets: number | string = 3;
    let reps: number | string = "8-12";
    let rpe: number | string = "8-9";
    let rest = "60-90s";

    // Adjust based on goal
    if (goal === 'force') {
        if (type === 'compound') {
            sets = level === 'debutant' ? 3 : (level === 'intermediaire' ? '3-4' : 5);
            reps = level === 'debutant' ? 5 : (level === 'intermediaire' ? '3-5' : '1-5');
            rpe = level === 'debutant' ? "6-7" : (level === 'intermediaire' ? '7-8' : '8-9');
            rest = "120-180s";
        } else { // Isolation for force goal (less emphasis)
            sets = 2;
            reps = "8-12";
            rpe = 8;
            rest = "60s";
        }
    } else if (goal === 'prise_masse' || goal === 'seche') {
        sets = level === 'debutant' ? 3 : (level === 'intermediaire' ? '3-4' : 4);
        reps = type === 'compound' ? "6-12" : "10-15";
        rpe = level === 'debutant' ? "7-8" : (level === 'intermediaire' ? '8-9' : '9-10');
        rest = type === 'compound' ? "90-120s" : "45-75s";
        if (goal === 'seche' && level !== 'debutant') {
             // Slightly higher reps or maintain intensity during cut
             reps = type === 'compound' ? "8-15" : "12-20";
             rpe = '8-10'; // Keep intensity high
        }
    } else if (goal === 'powerbuilding') {
        if (type === 'compound') {
            // Mix: Could alternate days or have top set + backoff sets
            sets = level === 'debutant' ? 3 : (level === 'intermediaire' ? '3-4' : 4);
            reps = level === 'debutant' ? 5 : (level === 'intermediaire' ? '3-6' : 'Top set 1-5 + Backoff 6-10'); // Simplified representation
            rpe = level === 'debutant' ? "7" : (level === 'intermediaire' ? '7-8' : '8-9');
            rest = "120-180s";
        } else { // Hypertrophy focus for isolation
            sets = level === 'debutant' ? 2 : 3;
            reps = "10-15";
            rpe = '9-10';
            rest = "60-90s";
        }
    }

    // Adjust sets based on level for hypertrophy/seche
     if (goal !== 'force' && level === 'debutant') sets = 3;


    return { sets, reps, rpe, rest };
}

function selectExercisesForDay(
    dayType: 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'full_body',
    availableCompound: { name: string, target: string[] }[],
    availableIsolation: { name: string, target: string[] }[],
    maxExercises: number
): Exercise[] {
    const exercises: Exercise[] = [];
    const addedNames = new Set<string>();

    const addExercise = (exercise: { name: string, target: string[] }, type: 'compound' | 'isolation') => {
        if (exercises.length < maxExercises && !addedNames.has(exercise.name)) {
            // Note: Sets/Reps/RPE are added later based on goal/level
            exercises.push({ name: exercise.name, sets: 0, reps: 0 }); // Placeholder sets/reps
            addedNames.add(exercise.name);
        }
    };

    // Prioritize compound exercises
    availableCompound.forEach(ex => {
        if (dayType === 'push' && (ex.target.includes('chest') || ex.target.includes('shoulders') || ex.target.includes('triceps'))) addExercise(ex, 'compound');
        else if (dayType === 'pull' && (ex.target.includes('back') || ex.target.includes('biceps'))) addExercise(ex, 'compound');
        else if (dayType === 'legs' && (ex.target.includes('legs') || ex.target.includes('quads') || ex.target.includes('hamstrings') || ex.target.includes('glutes'))) addExercise(ex, 'compound');
        else if (dayType === 'upper' && (ex.target.includes('chest') || ex.target.includes('shoulders') || ex.target.includes('triceps') || ex.target.includes('back') || ex.target.includes('biceps'))) addExercise(ex, 'compound');
        else if (dayType === 'lower' && (ex.target.includes('legs') || ex.target.includes('quads') || ex.target.includes('hamstrings') || ex.target.includes('glutes') || ex.target.includes('calves'))) addExercise(ex, 'compound');
        else if (dayType === 'full_body') {
             // Try to get one push, one pull, one legs compound
             if (!exercises.some(e => availableCompound.find(ac => ac.name === e.name)?.target.some(t => ['chest', 'shoulders', 'triceps'].includes(t))) && (ex.target.includes('chest') || ex.target.includes('shoulders'))) addExercise(ex, 'compound');
             else if (!exercises.some(e => availableCompound.find(ac => ac.name === e.name)?.target.some(t => ['back', 'biceps'].includes(t))) && (ex.target.includes('back'))) addExercise(ex, 'compound');
             else if (!exercises.some(e => availableCompound.find(ac => ac.name === e.name)?.target.some(t => ['legs', 'quads', 'hamstrings', 'glutes'].includes(t))) && (ex.target.includes('legs') || ex.target.includes('glutes'))) addExercise(ex, 'compound');
             // Add more compounds if space allows and targets differ
             else if (exercises.length < Math.floor(maxExercises / 2)) addExercise(ex, 'compound');
        }
    });

     // Fill remaining slots with isolation exercises, avoiding target overlap where possible
     const compoundTargets = new Set(exercises.flatMap(ex => availableCompound.find(ac => ac.name === ex.name)?.target ?? []));

     availableIsolation.forEach(ex => {
         const targets = ex.target;
         let suitable = false;
         if (dayType === 'push' && targets.some(t => ['chest', 'shoulders', 'triceps'].includes(t))) suitable = true;
         else if (dayType === 'pull' && targets.some(t => ['back', 'biceps', 'forearms'].includes(t))) suitable = true;
         else if (dayType === 'legs' && targets.some(t => ['legs', 'quads', 'hamstrings', 'glutes', 'calves'].includes(t))) suitable = true;
         else if (dayType === 'upper' && targets.some(t => ['chest', 'shoulders', 'triceps', 'back', 'biceps', 'forearms'].includes(t))) suitable = true;
         else if (dayType === 'lower' && targets.some(t => ['legs', 'quads', 'hamstrings', 'glutes', 'calves'].includes(t))) suitable = true;
         else if (dayType === 'full_body') {
             // Add isolation if it targets something not hit by compounds or adds variety
             if (!targets.every(t => compoundTargets.has(t)) || exercises.length < maxExercises) {
                 suitable = true;
             }
         }

         if (suitable) {
             addExercise(ex, 'isolation');
         }
     });


    // Basic shuffle to vary order slightly (optional)
    // exercises.sort(() => Math.random() - 0.5);

    return exercises;
}


// --- Main Generator Class ---
export class ProgramGenerator {
    formData: FormData;
    program: Program;

    constructor(formData: FormData) {
        this.formData = formData;
        this.program = { title: "", description: "", schedule: [] };
    }

    generate(): Program {
        const { goal, level, split, days, duration, equipment } = this.formData;

        // 1. Determine effective split and day types
        let effectiveSplit = split;
        if (split === 'autre') {
            if (days <= 3) effectiveSplit = 'full_body';
            else if (days === 4) effectiveSplit = 'half_body';
            else effectiveSplit = 'ppl'; // Default for 5+ days
        }

        const dayTypes: ('push' | 'pull' | 'legs' | 'upper' | 'lower' | 'full_body')[] = [];
        if (effectiveSplit === 'full_body') {
            for (let i = 0; i < days; i++) dayTypes.push('full_body');
        } else if (effectiveSplit === 'half_body') {
            for (let i = 0; i < days; i++) dayTypes.push(i % 2 === 0 ? 'upper' : 'lower');
        } else if (effectiveSplit === 'ppl') {
            const pplCycle: ('push' | 'pull' | 'legs')[] = ['push', 'pull', 'legs'];
            for (let i = 0; i < days; i++) dayTypes.push(pplCycle[i % 3]);
        }

        // 2. Estimate max exercises per session
        // Rough estimate: 7-10 mins per exercise (warmup, sets, rest)
        const avgTimePerExercise = level === 'debutant' ? 10 : (level === 'intermediaire' ? 8 : 7);
        const maxExercises = Math.max(3, Math.floor(duration / avgTimePerExercise)); // At least 3 exercises

        // 3. Get available exercises based on equipment
        const availableCompound = getAvailableExercises(equipment, 'compound');
        const availableIsolation = getAvailableExercises(equipment, 'isolation');

        if (availableCompound.length === 0 && availableIsolation.length === 0) {
             throw new Error("Aucun exercice disponible avec l'équipement sélectionné.");
        }


        // 4. Build schedule day by day
        const schedule: WorkoutDay[] = [];
        for (let i = 0; i < days; i++) {
            const dayType = dayTypes[i];
            let dayTitle = "";
            const dayNumberInCycle = effectiveSplit === 'ppl' ? Math.floor(i / 3) + 1 : (effectiveSplit === 'half_body' ? Math.floor(i / 2) + 1 : i + 1);
            const dayLetter = String.fromCharCode(65 + (i % (effectiveSplit === 'full_body' ? 3 : 2))); // A, B, C... or A, B

            if (effectiveSplit === 'full_body') dayTitle = `Full Body ${dayLetter}`;
            else if (effectiveSplit === 'half_body') dayTitle = dayType === 'upper' ? `Haut du Corps ${dayLetter}` : `Bas du Corps ${dayLetter}`;
            else if (effectiveSplit === 'ppl') dayTitle = `${dayType.charAt(0).toUpperCase() + dayType.slice(1)} ${dayNumberInCycle}`;


            let selectedExercises = selectExercisesForDay(dayType, availableCompound, availableIsolation, maxExercises);

            // Assign Sets/Reps/RPE to selected exercises
            const detailedExercises: Exercise[] = selectedExercises.map(ex => {
                const isCompound = availableCompound.some(ce => ce.name === ex.name);
                const params = getSetsRepsRpe(goal, level, isCompound ? 'compound' : 'isolation');
                return { ...ex, ...params };
            });

            schedule.push({
                day: i + 1,
                title: dayTitle,
                exercises: detailedExercises,
            });
        }

        // 5. Finalize Program Details
        const goalMap: Record<FormData['goal'], string> = {
            prise_masse: "Prise de Masse",
            seche: "Sèche / Perte de Gras",
            force: "Force",
            powerbuilding: "Powerbuilding"
        };
        const levelMap: Record<FormData['level'], string> = {
            debutant: "Débutant",
            intermediaire: "Intermédiaire",
            avance: "Avancé"
        };

        this.program.title = `Programme ${goalMap[goal]} - ${levelMap[level]}`;
        this.program.description = `Split ${effectiveSplit.replace('_', ' ')} sur ${days} jours. Durée max: ${duration} min.`;
        this.program.schedule = schedule;

        return this.program;
    }
}