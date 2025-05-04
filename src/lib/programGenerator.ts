import { FormData } from '@/components/ProgramForm'; // Assuming FormData type is exported

// --- Types ---
export type Exercise = {
    name: string;
    sets: number | string; // Can be "3" or "2-3"
    reps: number | string; // Can be "5", "8-12", "AMRAP"
    rpe?: number | string; // Optional RPE, e.g., 8 or 9
    rest?: string; // e.g., "2-3 min", "1 min"
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

// --- Exercise Database (French Names, Bodyweight Squat Moved) ---
const exerciseDB = {
    compound: {
        barbell: [
            { name: "Squat", target: ["legs", "glutes", "quads"] },
            { name: "Bench Press (Développé Couché)", target: ["chest", "shoulders", "triceps"] },
            { name: "Deadlift (Soulevé de Terre)", target: ["back", "legs", "glutes", "hamstrings"] },
            { name: "Overhead Press (Développé Militaire)", target: ["shoulders", "triceps"] },
            { name: "Barbell Row (Row Barre)", target: ["back", "biceps"] },
        ],
        dumbbell: [
            { name: "Développé Couché Haltères", target: ["chest", "shoulders", "triceps"] },
            { name: "Row Haltère", target: ["back", "biceps"] },
            { name: "Goblet Squat", target: ["legs", "glutes", "quads"] },
            { name: "Romanian Deadlift (RDL) Haltères", target: ["hamstrings", "glutes", "back"] },
            { name: "Développé Épaules Haltères", target: ["shoulders", "triceps"] },
        ],
        bodyweight: [ // Bodyweight Squat removed from here
            { name: "Tractions (Pull-ups / Chin-ups)", target: ["back", "biceps"] },
            { name: "Dips", target: ["chest", "shoulders", "triceps"] },
            { name: "Pompes (Push-ups)", target: ["chest", "shoulders", "triceps"] },
            { name: "Fentes (Lunges)", target: ["legs", "glutes", "quads", "hamstrings"] },
        ],
        machine: [
            { name: "Presse à Cuisses (Leg Press)", target: ["legs", "glutes", "quads"] },
            { name: "Tirage Vertical (Lat Pulldown)", target: ["back", "biceps"] },
            { name: "Développé Pectoraux Machine", target: ["chest", "shoulders", "triceps"] },
            { name: "Rowing Assis Machine/Câble", target: ["back", "biceps"] },
            { name: "Développé Épaules Machine", target: ["shoulders", "triceps"] },
        ],
        kettlebell: [
             { name: "Kettlebell Swing", target: ["hamstrings", "glutes", "back", "conditioning"] },
             { name: "Kettlebell Goblet Squat", target: ["legs", "glutes", "quads"] },
             { name: "Kettlebell Press", target: ["shoulders", "triceps"] },
             { name: "Kettlebell Row", target: ["back", "biceps"] },
        ],
        elastiques: [],
    },
    isolation: {
        barbell: [
            { name: "Curl Barre", target: ["biceps"] },
            { name: "Barre au Front (Skullcrushers)", target: ["triceps"] },
        ],
        dumbbell: [
            { name: "Curl Haltères", target: ["biceps"] },
            { name: "Extension Triceps Haltère", target: ["triceps"] },
            { name: "Élévations Latérales", target: ["shoulders"] },
            { name: "Curl Marteau", target: ["biceps", "forearms"] },
            { name: "Élévations Frontales", target: ["shoulders"] },
            { name: "Oiseau (Rear Delt Fly)", target: ["shoulders", "upper back"] },
        ],
        bodyweight: [
             { name: "Mollets Poids du Corps", target: ["calves"] },
             { name: "Pont Fessier (Glute Bridge)", target: ["glutes"] },
             { name: "Gainage Planche (Plank)", target: ["core"] },
             { name: "Crunchs", target: ["core"] },
             { name: "Squat Poids du Corps", target: ["legs", "glutes", "quads"] }, // Added here as isolation/fallback/warmup
        ],
        machine: [
            { name: "Leg Extension", target: ["quads"] },
            { name: "Leg Curl", target: ["hamstrings"] },
            { name: "Extension Triceps Poulie", target: ["triceps"] },
            { name: "Curl Biceps Machine", target: ["biceps"] },
            { name: "Écartés Pectoraux Machine/Poulie", target: ["chest"] },
            { name: "Élévations Latérales Machine", target: ["shoulders"] },
            { name: "Mollets Machine", target: ["calves"] },
        ],
         elastiques: [
            { name: "Tirage Élastique Arrière (Pull-Apart)", target: ["upper back", "shoulders"] },
            { name: "Extension Triceps Élastique", target: ["triceps"] },
            { name: "Curl Biceps Élastique", target: ["biceps"] },
            { name: "Marche Latérale Élastique", target: ["glutes", "hips"] },
            { name: "Pont Fessier Élastique", target: ["glutes"] },
        ],
         kettlebell: [
             { name: "Kettlebell Halo", target: ["shoulders", "core"] },
         ],
    }
};

// --- Helper Functions ---

function getAvailableExercises(equipment: FormData['equipment'], type: 'compound' | 'isolation'): { name: string, target: string[] }[] {
    let available: { name: string, target: string[] }[] = [];
    const db = exerciseDB[type];

    if (equipment.barre_halteres) {
        available = available.concat(db.barbell, db.dumbbell);
    }
    if (equipment.kettlebells) {
         available = available.concat(db.kettlebell);
    }
    if (equipment.machines_guidees) {
        available = available.concat(db.machine);
    }
     if (equipment.elastiques) {
        available = available.concat(db.elastiques);
    }
    // Add bodyweight isolation/core always if selected
    if (equipment.poids_corp && type === 'isolation') {
         available = available.concat(db.bodyweight);
    }
     // Add bodyweight compound only if NO other compound equipment is available AND bodyweight is selected
     if (equipment.poids_corp && type === 'compound' && !equipment.barre_halteres && !equipment.kettlebells && !equipment.machines_guidees) {
         available = available.concat(db.bodyweight);
     }


    // Remove duplicates by name
    const uniqueAvailable = available.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i);
    return uniqueAvailable;
}

function getSetsRepsRpe(goal: FormData['goal'], level: FormData['level'], type: 'compound' | 'isolation'): Pick<Exercise, 'sets' | 'reps' | 'rpe' | 'rest'> {
    let sets: number | string = 3;
    let reps: number | string = "8-12";
    let rpe: number | string = 9; // Default RPE to 9 (high intensity)
    let rest = "1-1.5 min"; // Default rest

    // --- Adjust based on Goal ---
    if (goal === 'force') {
        if (type === 'compound') {
            sets = 3; // Keep sets at 3 max
            reps = level === 'debutant' ? 5 : '3-5'; // Lower reps for strength
            rpe = level === 'debutant' ? 7 : 8; // Lower RPE for strength focus, less failure
            rest = "2-3 min"; // Longer rest for strength
        } else { // Isolation for force goal
            sets = 2;
            reps = "8-12";
            rpe = 8;
            rest = "1 min";
        }
    } else if (goal === 'prise_masse' || goal === 'seche') {
        // Hypertrophy focus
        sets = 3; // Max 3 sets
        reps = type === 'compound' ? "6-12" : "10-15";
        rpe = level === 'debutant' ? 8 : 9; // High RPE for hypertrophy
        rest = type === 'compound' ? "1.5-2 min" : "1 min";

        if (goal === 'seche' && level !== 'debutant') {
             reps = type === 'compound' ? "8-15" : "12-20"; // Slightly higher reps for cutting potentially
             rpe = 9; // Keep intensity high
             rest = type === 'compound' ? "1-1.5 min" : "30-60 sec"; // Shorter rest for cutting
        }
    } else if (goal === 'powerbuilding') {
        // Mix of strength and hypertrophy
        if (type === 'compound') {
            sets = 3;
            reps = level === 'debutant' ? 5 : '3-6'; // Strength focus reps
            rpe = level === 'debutant' ? 7 : 8;
            rest = "2-3 min";
        } else { // Hypertrophy focus for isolation
            sets = 3; // Allow 3 sets for isolation in powerbuilding
            reps = "10-15";
            rpe = 9;
            rest = "1 min";
        }
    }

     // Final check for beginners - maybe reduce sets on isolation
     if (level === 'debutant' && type === 'isolation') {
         sets = 2;
     }


    return { sets, reps, rpe, rest };
}

// Fisher-Yates Shuffle
function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


// Function to get exercise details (targets) from the DB
function getExerciseDetails(name: string): { name: string, target: string[] } | undefined {
    for (const type of Object.values(exerciseDB)) {
        for (const equip of Object.values(type)) {
            const exercise = equip.find(ex => ex.name === name);
            if (exercise) return exercise;
        }
    }
    return undefined;
}


function selectExercisesForDay(
    dayType: 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'full_body',
    availableCompound: { name: string, target: string[] }[],
    availableIsolation: { name: string, target: string[] }[],
    maxExercises: number,
    goal: FormData['goal'],
    level: FormData['level']
): Exercise[] {
    let selectedExercises: Exercise[] = [];
    const addedNames = new Set<string>();

    const addExercise = (exercise: { name: string, target: string[] }, type: 'compound' | 'isolation') => {
        if (selectedExercises.length < maxExercises && !addedNames.has(exercise.name)) {
            const params = getSetsRepsRpe(goal, level, type);
            selectedExercises.push({ name: exercise.name, ...params });
            addedNames.add(exercise.name);
        }
    };

    const targets: Record<typeof dayType, string[]> = {
        push: ['chest', 'shoulders', 'triceps'],
        pull: ['back', 'biceps', 'forearms'],
        legs: ['quads', 'hamstrings', 'glutes', 'calves', 'legs'],
        upper: ['chest', 'shoulders', 'triceps', 'back', 'biceps', 'forearms'],
        lower: ['quads', 'hamstrings', 'glutes', 'calves', 'legs'],
        full_body: ['chest', 'shoulders', 'triceps', 'back', 'biceps', 'quads', 'hamstrings', 'glutes', 'legs']
    };

    const dayTargets = targets[dayType];
    const dayCompounds = shuffleArray(availableCompound.filter(ex => ex.target.some(t => dayTargets.includes(t))));
    const dayIsolations = shuffleArray(availableIsolation.filter(ex => ex.target.some(t => dayTargets.includes(t))));

    let compoundCount = 0;
    // Slightly adjusted compound target: less for full body, maybe 1-2, more balanced otherwise
    const targetCompoundCount = dayType === 'full_body' ? Math.max(1, Math.min(2, Math.floor(maxExercises * 0.4)))
                             : Math.max(1, Math.floor(maxExercises * (goal === 'force' || goal === 'powerbuilding' ? 0.5 : 0.4)));

    for (const ex of dayCompounds) {
        if (compoundCount < targetCompoundCount) {
            addExercise(ex, 'compound');
            compoundCount++;
        }
    }

    const currentTargets = new Set(selectedExercises.flatMap(ex => getExerciseDetails(ex.name)?.target ?? []));

    for (const ex of dayIsolations) {
        if (selectedExercises.length < maxExercises) {
             const exerciseData = getExerciseDetails(ex.name);
             if (exerciseData) {
                 const targetsNewMuscle = !exerciseData.target.every(t => currentTargets.has(t));
                 // Prioritize exercises hitting new muscles, or fill up remaining slots
                 if (targetsNewMuscle || selectedExercises.length < maxExercises -1) {
                     addExercise(ex, 'isolation');
                     exerciseData.target.forEach(t => currentTargets.add(t));
                 }
             }
        }
    }

     // Fill remaining slots if needed (less priority now)
     if (selectedExercises.length < maxExercises) {
         for (const ex of dayCompounds) { // Try adding more compounds if space
             if (selectedExercises.length < maxExercises && !addedNames.has(ex.name)) {
                 addExercise(ex, 'compound');
             }
         }
     }
     if (selectedExercises.length < maxExercises) {
         for (const ex of dayIsolations) { // Then more isolations
             if (selectedExercises.length < maxExercises && !addedNames.has(ex.name)) {
                 addExercise(ex, 'isolation');
             }
         }
     }

    return selectedExercises;
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

        let effectiveSplit = split;
        if (split === 'autre' || (split === 'full_body' && days > 4) || (split === 'half_body' && days > 5) || (split === 'ppl' && days < 3)) {
            if (days <= 2) effectiveSplit = 'full_body';
            else if (days === 3) effectiveSplit = level === 'debutant' ? 'full_body' : 'ppl';
            else if (days === 4) effectiveSplit = 'half_body';
            else if (days === 5) effectiveSplit = 'ppl';
            else effectiveSplit = 'ppl';
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

        const avgTimePerExercise = level === 'debutant' ? 12 : (level === 'intermediaire' ? 10 : 8);
        const maxExercises = Math.max(4, Math.min(7, Math.floor(duration / avgTimePerExercise)));

        const availableCompound = getAvailableExercises(equipment, 'compound');
        const availableIsolation = getAvailableExercises(equipment, 'isolation');

        if (availableCompound.length === 0 && availableIsolation.length === 0) {
             if (equipment.poids_corp) {
                 availableCompound.push(...exerciseDB.compound.bodyweight); // Add bodyweight compounds as last resort
                 availableIsolation.push(...exerciseDB.isolation.bodyweight);
                 console.warn("No specific equipment exercises found, falling back to bodyweight.");
             } else {
                throw new Error("Aucun exercice disponible avec l'équipement sélectionné. Veuillez sélectionner au moins 'Poids du Corps'.");
             }
        }
         if (availableCompound.length === 0 && availableIsolation.length > 0) {
             console.warn("Aucun exercice composé disponible avec cet équipement. Le programme sera basé sur l'isolation.");
         }

        const schedule: WorkoutDay[] = [];
        const usedExerciseNamesThisWeek = new Set<string>();
        const addedNames = new Set<string>(); // Keep track of names added within a single day selection call

        for (let i = 0; i < days; i++) {
            const dayType = dayTypes[i];
            let dayTitle = "";
            const cycleLength = effectiveSplit === 'ppl' ? 3 : (effectiveSplit === 'half_body' ? 2 : (days > 1 ? 2 : 1));
            const dayLetter = String.fromCharCode(65 + (i % cycleLength));

            if (effectiveSplit === 'full_body') dayTitle = `Full Body ${dayLetter}`;
            else if (effectiveSplit === 'half_body') dayTitle = dayType === 'upper' ? `Haut du Corps ${dayLetter}` : `Bas du Corps ${dayLetter}`;
            else if (effectiveSplit === 'ppl') dayTitle = `${dayType.charAt(0).toUpperCase() + dayType.slice(1)} ${dayLetter}`;

            // Filter out exercises used recently if possible, to add variety
            const filteredCompounds = availableCompound.filter(ex => !usedExerciseNamesThisWeek.has(ex.name));
            const filteredIsolations = availableIsolation.filter(ex => !usedExerciseNamesThisWeek.has(ex.name));

            // Determine target compound count for the day
            const targetCompoundCount = dayType === 'full_body' ? Math.max(1, Math.min(2, Math.floor(maxExercises * 0.4)))
                                     : Math.max(1, Math.floor(maxExercises * (goal === 'force' || goal === 'powerbuilding' ? 0.5 : 0.4)));

            // Use filtered lists if they have enough variety, otherwise use the full available lists
            const compoundsToSelectFrom = filteredCompounds.length >= targetCompoundCount ? filteredCompounds : availableCompound;
            const isolationsToSelectFrom = filteredIsolations.length >= (maxExercises - targetCompoundCount) ? filteredIsolations : availableIsolation;


            let selectedExercises = selectExercisesForDay(
                dayType,
                compoundsToSelectFrom,
                isolationsToSelectFrom,
                maxExercises,
                goal,
                level
            );

            // Add selected exercises to the tracking set for the week
            selectedExercises.forEach(ex => usedExerciseNamesThisWeek.add(ex.name));

            // Basic reset for next week simulation if days > cycleLength (simplistic)
            if ((i + 1) % cycleLength === 0 && days > cycleLength) {
                 usedExerciseNamesThisWeek.clear();
            }

            // Add Core work suggestion if not explicitly included often
            const hasCoreWork = selectedExercises.some(ex => getExerciseDetails(ex.name)?.target.includes('core'));
            if (!hasCoreWork && level !== 'debutant' && selectedExercises.length < maxExercises) {
                 const coreEx = availableIsolation.find(ex => getExerciseDetails(ex.name)?.target.includes('core'));
                 if (coreEx && !addedNames.has(coreEx.name) && !selectedExercises.some(e => e.name === coreEx.name)) { // Check addedNames for the day too
                     const coreParams = getSetsRepsRpe(goal, level, 'isolation');
                     selectedExercises.push({ name: coreEx.name, sets: 2, reps: "10-15", rpe: 8, rest: "30-60 sec" }); // Standard core params
                     addedNames.add(coreEx.name); // Add to day's set
                     usedExerciseNamesThisWeek.add(coreEx.name); // Add to week's set
                 }
            }

            schedule.push({
                day: i + 1,
                title: dayTitle,
                exercises: selectedExercises,
            });
            addedNames.clear(); // Clear daily added names for the next day
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
        const splitMap: Record<typeof effectiveSplit, string> = {
            full_body: "Full Body",
            half_body: "Half Body (Haut/Bas)",
            ppl: "Push Pull Legs",
            autre: "Adapté"
        };


        this.program.title = `Programme ${goalMap[goal]} - ${levelMap[level]}`;
        this.program.description = `Format ${splitMap[effectiveSplit]} sur ${days} jours. Objectif: ${goalMap[goal]}. Durée max: ${duration} min.`;
        this.program.schedule = schedule;

        return this.program;
    }
}