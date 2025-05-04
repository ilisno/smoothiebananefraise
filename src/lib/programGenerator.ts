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

// --- Exercise Database (French Names) ---
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
        bodyweight: [
            { name: "Tractions (Pull-ups / Chin-ups)", target: ["back", "biceps"] },
            { name: "Dips", target: ["chest", "shoulders", "triceps"] },
            { name: "Pompes (Push-ups)", target: ["chest", "shoulders", "triceps"] },
            { name: "Squat Poids du Corps", target: ["legs", "glutes", "quads"] },
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
        elastiques: [], // Compound exercises with bands are less common, add if needed
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
             // { name: "Kettlebell Windmill", target: ["core", "shoulders", "hamstrings"] }, // Peut-être un peu complexe pour un générateur auto
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
    // Always include bodyweight if selected or as a fallback foundation
    if (equipment.poids_corp || available.length === 0) {
         available = available.concat(db.bodyweight);
    }

    // Remove duplicates by name
    const uniqueAvailable = available.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i);
    // console.log(`Available ${type} exercises:`, uniqueAvailable.map(e => e.name)); // Keep for debugging if needed
    return uniqueAvailable;
}

function getSetsRepsRpe(goal: FormData['goal'], level: FormData['level'], type: 'compound' | 'isolation'): Pick<Exercise, 'sets' | 'reps' | 'rpe' | 'rest'> {
    let sets: number | string = 3;
    let reps: number | string = "8-12";
    let rpe: number | string = "8-9";
    let rest = "60-90s";

    // --- Adjust based on Goal ---
    if (goal === 'force') {
        if (type === 'compound') {
            sets = level === 'debutant' ? 3 : (level === 'intermediaire' ? '3-4' : 5);
            reps = level === 'debutant' ? 5 : (level === 'intermediaire' ? '3-5' : '1-5');
            rpe = level === 'debutant' ? "6-7" : (level === 'intermediaire' ? '7-8' : '8-9');
            rest = "120-180s";
        } else { // Isolation for force goal (less emphasis, injury prevention)
            sets = 2;
            reps = "8-12";
            rpe = 8;
            rest = "60s";
        }
    } else if (goal === 'prise_masse' || goal === 'seche') {
        // Hypertrophy focus
        sets = level === 'debutant' ? 3 : (level === 'intermediaire' ? '3-4' : 4);
        reps = type === 'compound' ? "6-12" : "10-15"; // Higher reps for isolation
        rpe = level === 'debutant' ? "7-8" : (level === 'intermediaire' ? '8-9' : '9-10'); // Push closer to failure
        rest = type === 'compound' ? "90-120s" : "45-75s"; // Shorter rest for isolation/metabolic stress

        if (goal === 'seche' && level !== 'debutant') {
             // Maintain intensity, maybe slightly higher reps/shorter rest if tolerated
             reps = type === 'compound' ? "8-15" : "12-20";
             rpe = '8-10'; // Keep intensity high to preserve muscle
             rest = type === 'compound' ? "75-100s" : "30-60s";
        }
    } else if (goal === 'powerbuilding') {
        // Mix of strength and hypertrophy
        if (type === 'compound') {
            // Could alternate days or have top set + backoff sets. Simplified: Strength focus first.
            sets = level === 'debutant' ? 3 : (level === 'intermediaire' ? '3-4' : 4);
            reps = level === 'debutant' ? 5 : (level === 'intermediaire' ? '3-6' : 'Top 1-5 + Backoff 6-10'); // Simplified representation
            rpe = level === 'debutant' ? "7" : (level === 'intermediaire' ? '7-8' : '8-9');
            rest = "120-180s";
        } else { // Hypertrophy focus for isolation
            sets = level === 'debutant' ? 2 : 3;
            reps = "10-15";
            rpe = '9-10';
            rest = "60-90s";
        }
    }

    // --- Adjust based on Level (General Volume) ---
     if (level === 'debutant') {
         sets = Math.min(typeof sets === 'number' ? sets : parseInt(String(sets).split('-')[0]), 3); // Max 3 sets for beginners usually
     } else if (level === 'avance') {
         // Advanced might handle slightly more sets
         if (typeof sets === 'number' && sets < 5) sets++;
         else if (typeof sets === 'string' && sets.includes('-')) {
             const parts = sets.split('-').map(Number);
             sets = `${parts[0]}-${parts[1]+1}`;
         } else if (typeof sets === 'string' && !sets.includes('-')) {
             sets = `${sets}-${parseInt(sets)+1}`;
         }
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

    // Define target muscles for each day type
    const targets: Record<typeof dayType, string[]> = {
        push: ['chest', 'shoulders', 'triceps'],
        pull: ['back', 'biceps', 'forearms'],
        legs: ['quads', 'hamstrings', 'glutes', 'calves', 'legs'],
        upper: ['chest', 'shoulders', 'triceps', 'back', 'biceps', 'forearms'],
        lower: ['quads', 'hamstrings', 'glutes', 'calves', 'legs'],
        full_body: ['chest', 'shoulders', 'triceps', 'back', 'biceps', 'quads', 'hamstrings', 'glutes', 'legs'] // Broad
    };

    const dayTargets = targets[dayType];

    // Filter available exercises for the current day type
    const dayCompounds = shuffleArray(availableCompound.filter(ex => ex.target.some(t => dayTargets.includes(t))));
    const dayIsolations = shuffleArray(availableIsolation.filter(ex => ex.target.some(t => dayTargets.includes(t))));

    // Prioritize compound exercises, especially for strength/powerbuilding
    let compoundCount = 0;
    const targetCompoundCount = dayType === 'full_body' ? Math.max(1, Math.min(3, Math.floor(maxExercises * 0.5))) // 1-3 compounds for full body
                             : Math.max(1, Math.floor(maxExercises * (goal === 'force' || goal === 'powerbuilding' ? 0.6 : 0.5))); // ~50-60% compounds

    for (const ex of dayCompounds) {
        if (compoundCount < targetCompoundCount) {
            addExercise(ex, 'compound');
            compoundCount++;
        }
    }

    // Fill remaining slots with isolation exercises
    // Try to hit muscles not already targeted by compounds, or add volume
    const currentTargets = new Set(selectedExercises.flatMap(ex =>
        availableCompound.find(c => c.name === ex.name)?.target ??
        availableIsolation.find(i => i.name === ex.name)?.target ?? []
    ));

    for (const ex of dayIsolations) {
         // Add if space available AND (targets new muscle OR adds volume to existing)
        if (selectedExercises.length < maxExercises) {
             const targetsNewMuscle = !ex.target.every(t => currentTargets.has(t));
             // Simple logic: add if space, prioritize new muscles slightly
             if (targetsNewMuscle || selectedExercises.length < maxExercises -1) { // Leave maybe one slot for variety
                 addExercise(ex, 'isolation');
                 ex.target.forEach(t => currentTargets.add(t));
             }
        }
    }

     // If still space (e.g., few compounds available), add more relevant compounds if possible
     if (selectedExercises.length < maxExercises) {
         for (const ex of dayCompounds) {
             if (selectedExercises.length < maxExercises && !addedNames.has(ex.name)) {
                 addExercise(ex, 'compound');
             }
         }
     }
      // If still space, add more relevant isolations
     if (selectedExercises.length < maxExercises) {
         for (const ex of dayIsolations) {
             if (selectedExercises.length < maxExercises && !addedNames.has(ex.name)) {
                 addExercise(ex, 'isolation');
             }
         }
     }


    // console.log(`Selected exercises for ${dayType}:`, selectedExercises.map(e => e.name)); // Keep for debugging
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

        // 1. Determine effective split and day types
        let effectiveSplit = split;
        if (split === 'autre' || (split === 'full_body' && days > 4) || (split === 'half_body' && days > 5) || (split === 'ppl' && days < 3)) {
             // console.log(`Adjusting split from ${split} for ${days} days...`); // Keep for debugging
            // Basic heuristic adjustment if 'autre' or incompatible days/split
            if (days <= 2) effectiveSplit = 'full_body';
            else if (days === 3) effectiveSplit = level === 'debutant' ? 'full_body' : 'ppl'; // PPL often better for 3 days intermediate+
            else if (days === 4) effectiveSplit = 'half_body'; // Common 4-day split
            else if (days === 5) effectiveSplit = 'ppl'; // PPL variation (PPLPP, PPLUL etc.) - simplified to PPL cycle
            else effectiveSplit = 'ppl'; // PPL variation for 6 days (PPLPPL) - simplified
             // console.log(`Adjusted split to ${effectiveSplit}`); // Keep for debugging
        }


        const dayTypes: ('push' | 'pull' | 'legs' | 'upper' | 'lower' | 'full_body')[] = [];
        if (effectiveSplit === 'full_body') {
            for (let i = 0; i < days; i++) dayTypes.push('full_body');
        } else if (effectiveSplit === 'half_body') {
            // Alternate Upper/Lower, trying to start with Upper
            for (let i = 0; i < days; i++) dayTypes.push(i % 2 === 0 ? 'upper' : 'lower');
        } else if (effectiveSplit === 'ppl') {
            const pplCycle: ('push' | 'pull' | 'legs')[] = ['push', 'pull', 'legs'];
            for (let i = 0; i < days; i++) dayTypes.push(pplCycle[i % 3]);
        }

        // 2. Estimate max exercises per session
        // Rough estimate: 7-12 mins per exercise (warmup sets, work sets, rest)
        const avgTimePerExercise = level === 'debutant' ? 12 : (level === 'intermediaire' ? 9 : 7);
        const maxExercises = Math.max(3, Math.min(8, Math.floor(duration / avgTimePerExercise))); // 3-8 exercises typical range
        // console.log(`Estimated max exercises per session: ${maxExercises} (duration: ${duration}, level: ${level})`); // Keep for debugging

        // 3. Get available exercises based on equipment
        const availableCompound = getAvailableExercises(equipment, 'compound');
        const availableIsolation = getAvailableExercises(equipment, 'isolation');

        if (availableCompound.length === 0 && availableIsolation.length === 0) {
             // Fallback: Add basic bodyweight if nothing else selected but bodyweight is available
             if (equipment.poids_corp) {
                 availableCompound.push(...exerciseDB.compound.bodyweight);
                 availableIsolation.push(...exerciseDB.isolation.bodyweight);
                 console.warn("No specific equipment exercises found, falling back to bodyweight.");
             } else {
                throw new Error("Aucun exercice disponible avec l'équipement sélectionné. Veuillez sélectionner au moins 'Poids du Corps'.");
             }
        }
         if (availableCompound.length === 0 && availableIsolation.length > 0) {
             console.warn("Aucun exercice composé disponible avec cet équipement. Le programme sera basé sur l'isolation.");
             // Consider adjusting maxExercises or expectations if only isolation is possible
         }


        // 4. Build schedule day by day
        const schedule: WorkoutDay[] = [];
        const usedExerciseNamesThisWeek = new Set<string>(); // Track to avoid repeating same exercise too soon if possible
        const addedNames = new Set<string>(); // Track names added within a single day selection call

        for (let i = 0; i < days; i++) {
            const dayType = dayTypes[i];
            let dayTitle = "";
            // Simple A/B/C or 1/2/3 suffix logic
            const cycleLength = effectiveSplit === 'ppl' ? 3 : (effectiveSplit === 'half_body' ? 2 : (days > 1 ? 2 : 1)); // Assume A/B for FB unless 1 day
            const dayLetter = String.fromCharCode(65 + (i % cycleLength)); // A, B, C...

            if (effectiveSplit === 'full_body') dayTitle = `Full Body ${dayLetter}`;
            else if (effectiveSplit === 'half_body') dayTitle = dayType === 'upper' ? `Haut du Corps ${dayLetter}` : `Bas du Corps ${dayLetter}`;
            else if (effectiveSplit === 'ppl') dayTitle = `${dayType.charAt(0).toUpperCase() + dayType.slice(1)} ${dayLetter}`; // Push A, Pull A, Legs A, Push B...


            // Filter out exercises used recently if possible, to add variety
            const filteredCompounds = availableCompound.filter(ex => !usedExerciseNamesThisWeek.has(ex.name));
            const filteredIsolations = availableIsolation.filter(ex => !usedExerciseNamesThisWeek.has(ex.name));

            // Determine target compound count for the day
            const targetCompoundCount = dayType === 'full_body' ? Math.max(1, Math.min(3, Math.floor(maxExercises * 0.5)))
                                     : Math.max(1, Math.floor(maxExercises * (goal === 'force' || goal === 'powerbuilding' ? 0.6 : 0.5)));

            let selectedExercises = selectExercisesForDay(
                dayType,
                filteredCompounds.length >= targetCompoundCount ? filteredCompounds : availableCompound, // Use filtered if enough options remain, else use all available
                filteredIsolations.length >= (maxExercises - targetCompoundCount) / 2 ? filteredIsolations : availableIsolation, // Similar logic for isolation
                maxExercises,
                goal,
                level
            );

            // Add selected exercises to the tracking set for the week
            selectedExercises.forEach(ex => usedExerciseNamesThisWeek.add(ex.name));
            // Basic reset for next week simulation if days > cycleLength (simplistic)
            // Reset if we completed a full cycle (e.g., PPL, UL, or FB A/B)
            if ((i + 1) % cycleLength === 0 && days > cycleLength) {
                 // console.log(`Resetting used exercises after day ${i+1} (cycle length ${cycleLength})`); // Keep for debugging
                 usedExerciseNamesThisWeek.clear();
            }


            // Add Core work suggestion if not explicitly included often
            const hasCoreWork = selectedExercises.some(ex => ex.name.toLowerCase().includes('plank') || ex.name.toLowerCase().includes('crunch') || ex.name.toLowerCase().includes('core') || ex.name.toLowerCase().includes('windmill'));
            if (!hasCoreWork && level !== 'debutant' && selectedExercises.length < maxExercises) {
                 const coreEx = availableIsolation.find(ex => ex.target.includes('core'));
                 // Check against addedNames for the current day as well
                 if (coreEx && !addedNames.has(coreEx.name) && !selectedExercises.some(e => e.name === coreEx.name)) {
                     const coreParams = getSetsRepsRpe(goal, level, 'isolation');
                     // Reduce sets/reps slightly for core added at the end
                     selectedExercises.push({ name: coreEx.name, sets: Math.min(2, typeof coreParams.sets === 'number' ? coreParams.sets : 2), reps: "10-15", rpe: 8, rest: "30-45s" });
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
            autre: "Adapté" // Should not happen due to adjustment logic
        };


        this.program.title = `Programme ${goalMap[goal]} - ${levelMap[level]}`;
        this.program.description = `Format ${splitMap[effectiveSplit]} sur ${days} jours. Objectif: ${goalMap[goal]}. Durée max: ${duration} min.`;
        this.program.schedule = schedule;

        return this.program;
    }
}