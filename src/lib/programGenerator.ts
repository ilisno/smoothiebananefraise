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
            { name: "Squat", target: ["legs", "glutes", "quads"] },
            { name: "Bench Press", target: ["chest", "shoulders", "triceps"] },
            { name: "Deadlift", target: ["back", "legs", "glutes", "hamstrings"] },
            { name: "Overhead Press (OHP)", target: ["shoulders", "triceps"] },
            { name: "Barbell Row", target: ["back", "biceps"] },
        ],
        dumbbell: [
            { name: "Dumbbell Bench Press", target: ["chest", "shoulders", "triceps"] },
            { name: "Dumbbell Row", target: ["back", "biceps"] },
            { name: "Goblet Squat", target: ["legs", "glutes", "quads"] },
            { name: "Romanian Deadlift (RDL)", target: ["hamstrings", "glutes", "back"] },
            { name: "Dumbbell Shoulder Press", target: ["shoulders", "triceps"] },
        ],
        bodyweight: [
            { name: "Pull-ups / Chin-ups", target: ["back", "biceps"] },
            { name: "Dips", target: ["chest", "shoulders", "triceps"] },
            { name: "Push-ups", target: ["chest", "shoulders", "triceps"] },
            // Removed Bodyweight Squat
            { name: "Lunges", target: ["legs", "glutes", "quads", "hamstrings"] },
            { name: "Tractions Australiennes", target: ["back", "biceps"] },
        ],
        machine: [
            { name: "Leg Press", target: ["legs", "glutes", "quads"] },
            { name: "Lat Pulldown", target: ["back", "biceps"] },
            { name: "Chest Press Machine", target: ["chest", "shoulders", "triceps"] },
            { name: "Seated Cable Row", target: ["back", "biceps"] },
            { name: "Shoulder Press Machine", target: ["shoulders", "triceps"] },
            { name: "Hack Squat", target: ["legs", "quads", "glutes"] }, // Added Hack Squat
        ],
        elastiques: [
             { name: "Banded Squat", target: ["legs", "glutes", "quads"] },
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
            { name: "Front Raise", target: ["shoulders"] },
            { name: "Rear Delt Fly", target: ["shoulders", "upper back"] },
        ],
        bodyweight: [
             { name: "Calf Raises", target: ["calves"] },
             { name: "Glute Bridge", target: ["glutes"] },
             { name: "Plank", target: ["core"] },
             { name: "Crunchs", target: ["core"] },
             { name: "Relevés de Jambes", target: ["core"] },
        ],
        machine: [
            { name: "Leg Extension", target: ["quads"] },
            { name: "Leg Curl", target: ["hamstrings"] },
            { name: "Triceps Pushdown", target: ["triceps"] },
            { name: "Bicep Curl Machine", target: ["biceps"] },
            { name: "Pec Deck Fly / Cable Fly", target: ["chest"] },
            { name: "Lateral Raise Machine", target: ["shoulders"] },
            { name: "Calf Raise Machine", target: ["calves"] },
        ],
         elastiques: [
            { name: "Banded Pull-Apart", target: ["upper back", "shoulders"] },
            { name: "Banded Triceps Extension", target: ["triceps"] },
            // Changed Banded Bicep Curl to Banded Reverse Curl
            { name: "Banded Reverse Curl", target: ["biceps", "forearms"] },
            { name: "Banded Lateral Walk", target: ["glutes", "hips"] },
            { name: "Banded Glute Bridge", target: ["glutes"] },
        ],
    }
};

// Helper to find the equipment type for a given exercise name
function getExerciseEquipmentType(exerciseName: string): string | undefined {
    for (const type of Object.values(exerciseDB)) {
        for (const [equipType, exercises] of Object.entries(type)) {
            if (exercises.some(ex => ex.name === exerciseName)) {
                return equipType;
            }
        }
    }
    return undefined;
}


// --- Helper Functions ---

function getAvailableExercises(equipment: FormData['equipment'], type: 'compound' | 'isolation'): { name: string, target: string[] }[] {
    let available: { name: string, target: string[] }[] = [];
    const db = exerciseDB[type];

    if (equipment.barre_halteres) {
        available = available.concat(db.barbell, db.dumbbell);
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
    console.log(`Available ${type} exercises:`, uniqueAvailable.map(e => e.name));
    return uniqueAvailable;
}

// Modified to accept the exercise object
function getSetsRepsRpe(exercise: { name: string, target: string[] }, goal: FormData['goal'], level: FormData['level'], type: 'compound' | 'isolation'): Pick<Exercise, 'sets' | 'reps' | 'rpe' | 'rest'> {
    let sets: number | string = 3;
    let reps: number | string = "8-12";
    let rpe: number | string = "8-9";
    let rest = "60-90s";

    // --- Adjust based on Goal ---
    if (goal === 'force') { // Note: 'force' is the internal value for Powerlifting
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

    // --- Enforce minimum reps based on equipment type ---
    const equipmentType = getExerciseEquipmentType(exercise.name);
    let minReps = 1; // Default minimum

    if (equipmentType === 'machine' || equipmentType === 'bodyweight' || equipmentType === 'elastiques') {
        minReps = 6;
    }

    // Specific exercises requiring minimum 8 reps
    const eightRepMinExercises = ["Dumbbell Bench Press", "Dumbbell Row", "Romanian Deadlift (RDL)", "Goblet Squat"];
    if (eightRepMinExercises.includes(exercise.name)) {
        minReps = Math.max(minReps, 8); // Ensure it's at least 8, but also respects the 6+ rule if applicable
    }


    let currentMinReps = 0;
    if (typeof reps === 'number') {
        currentMinReps = reps;
    } else if (typeof reps === 'string' && reps.includes('-')) {
        currentMinReps = parseInt(reps.split('-')[0]);
    } else if (typeof reps === 'string' && !isNaN(parseInt(reps))) {
         currentMinReps = parseInt(reps);
    }

    if (currentMinReps < minReps) {
        // Adjust reps to be at least minReps
        if (typeof reps === 'number') {
             reps = minReps;
        } else if (typeof reps === 'string' && reps.includes('-')) {
             const parts = reps.split('-').map(Number);
             reps = `${Math.max(minReps, parts[0])}-${Math.max(minReps, parts[1])}`;
        } else { // Single number string or other format
             reps = `${minReps}-${minReps + 4}`; // Default to a common range like 8-12 or 6-10
        }
         console.log(`Adjusted reps for ${exercise.name} (${equipmentType}) to ${reps} (min ${minReps})`);
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

// Function to get exercise details (targets) from the DB - Kept for potential future use but not strictly needed for getSetsRepsRpe anymore
// function getExerciseDetails(name: string): { name: string, target: string[] } | undefined {
//     for (const type of Object.values(exerciseDB)) {
//         for (const equip of Object.values(type)) {
//             const exercise = equip.find(ex => ex.name === name);
//             if (exercise) return exercise;
//         }
//     }
//     return undefined;
// }


function selectExercisesForDay(
    dayType: 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'full_body',
    availableCompound: { name: string, target: string[] }[],
    availableIsolation: { name: string, target: string[] }[],
    maxExercises: number,
    goal: FormData['goal'],
    level: FormData['level'],
    addedCoreLifts: Set<string> // Pass the set of core lifts already added this week
): Exercise[] {
    let selectedExercises: Exercise[] = [];
    const addedNames = new Set<string>();

    // Modified to pass the full exercise object to getSetsRepsRpe
    const addExercise = (exercise: { name: string, target: string[] }, type: 'compound' | 'isolation') => {
        if (selectedExercises.length < maxExercises && !addedNames.has(exercise.name)) {
            const params = getSetsRepsRpe(exercise, goal, level, type); // Pass exercise object
            selectedExercises.push({ name: exercise.name, ...params });
            addedNames.add(exercise.name);
            return true; // Indicate success
        }
        return false; // Indicate failure (max exercises reached or already added)
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

    // --- Powerlifting (Force) Specific Prioritization ---
    if (goal === 'force') {
        const coreLifts: { name: string, dayTypes: typeof dayType[] }[] = [
            { name: "Squat", dayTypes: ['legs', 'full_body'] },
            { name: "Bench Press", dayTypes: ['push', 'upper', 'full_body'] },
            { name: "Deadlift", dayTypes: ['legs', 'pull', 'full_body'] }, // Deadlift can be on Legs or Pull day
        ];

        for (const lift of coreLifts) {
            // Check if the lift is appropriate for this day type AND hasn't been added this week yet
            if (lift.dayTypes.includes(dayType) && !addedCoreLifts.has(lift.name)) {
                const compoundExercise = availableCompound.find(ex => ex.name === lift.name);
                // Check if the exercise is available with the selected equipment
                if (compoundExercise) {
                    // Attempt to add the core lift
                    if (addExercise(compoundExercise, 'compound')) {
                         addedCoreLifts.add(lift.name); // Mark as added for the week
                    }
                } else {
                    console.warn(`Powerlifting goal selected, but required lift "${lift.name}" is not available with selected equipment for day type "${dayType}".`);
                }
            }
        }
    }
    // --- End Powerlifting Prioritization ---


    // Prioritize compound exercises (after potential core lifts for force)
    let compoundCount = selectedExercises.length; // Count already added core lifts
    const targetCompoundCount = dayType === 'full_body' ? Math.max(1, Math.min(3, Math.floor(maxExercises * 0.5)))
                             : Math.max(1, Math.floor(maxExercises * (goal === 'force' || goal === 'powerbuilding' ? 0.6 : 0.5)));

    // Add more compounds if needed, excluding those already added (like core lifts)
    for (const ex of dayCompounds) {
        if (compoundCount < targetCompoundCount && !addedNames.has(ex.name)) {
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

    // Add Core work suggestion if not explicitly included often
    const hasCoreWork = selectedExercises.some(ex => ex.name.toLowerCase().includes('plank') || ex.name.toLowerCase().includes('crunch') || ex.name.toLowerCase().includes('core') || ex.name.toLowerCase().includes('jambes')); // Added jambes for relevés de jambes
    if (!hasCoreWork && level !== 'debutant' && selectedExercises.length < maxExercises) {
         const coreEx = availableIsolation.find(ex => ex.target.includes('core'));
         if (coreEx && !selectedExercises.some(e => e.name === coreEx.name)) { // Check if not already added
             // Need to get params using the coreEx object
             const coreParams = getSetsRepsRpe(coreEx, goal, level, 'isolation'); // Pass coreEx object
             addExercise(coreEx, 'isolation'); // Use addExercise helper
         }
    }


    console.log(`Selected exercises for ${dayType}:`, selectedExercises.map(e => e.name));
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
        // Adjust split if 'autre' or incompatible days/split
        if (split === 'autre' || (split === 'full_body' && days > 4) || (split === 'half_body' && days > 5) || (split === 'ppl' && days < 3)) {
             console.log(`Adjusting split from ${split} for ${days} days...`);
            if (days <= 2) effectiveSplit = 'full_body';
            else if (days === 3) effectiveSplit = level === 'debutant' ? 'full_body' : 'ppl'; // PPL often better for 3 days intermediate+
            else if (days === 4) effectiveSplit = 'half_body'; // Common 4-day split
            else if (days === 5) effectiveSplit = 'ppl'; // PPL variation (PPLPP, PPLUL etc.) - simplified to PPL cycle
            else effectiveSplit = 'ppl'; // PPL variation for 6 days (PPLPPL) - simplified
             console.log(`Adjusted split to ${effectiveSplit}`);
        } else if (goal === 'force' && effectiveSplit !== 'ppl' && days >= 3) {
             // For Powerlifting, PPL is often preferred if enough days
             console.log(`Adjusting split to PPL for Powerlifting goal with ${days} days.`);
             effectiveSplit = 'ppl';
        }

        // If Powerlifting is selected but no barbell/dumbbells, throw an error early
        // Check for specific lifts availability instead of just equipment type
        const availableCompound = getAvailableExercises(equipment, 'compound');
        const hasSquat = availableCompound.some(ex => ex.name === 'Squat');
        const hasBench = availableCompound.some(ex => ex.name === 'Bench Press');
        const hasDeadlift = availableCompound.some(ex => ex.name === 'Deadlift');

        if (goal === 'force' && (!hasSquat || !hasBench || !hasDeadlift)) {
             let missing = [];
             if (!hasSquat) missing.push('Squat');
             if (!hasBench) missing.push('Bench Press');
             if (!hasDeadlift) missing.push('Deadlift');
             throw new Error(`Pour un objectif Powerlifting, vous devez avoir l'équipement nécessaire pour le ${missing.join(', la ')} et le Deadlift.`);
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
        console.log(`Estimated max exercises per session: ${maxExercises} (duration: ${duration}, level: ${level})`);

        // 3. Get available exercises based on equipment (already done above for the check)
        const availableIsolation = getAvailableExercises(equipment, 'isolation');


        // 4. Build schedule day by day
        const schedule: WorkoutDay[] = [];
        const addedCoreLiftsThisWeek = new Set<string>(); // Track core lifts added this week

        for (let i = 0; i < days; i++) {
            const dayType = dayTypes[i];
            let dayTitle = "";
            // Simple A/B/C or 1/2/3 suffix logic
            const cycleLength = effectiveSplit === 'ppl' ? 3 : (effectiveSplit === 'half_body' ? 2 : (days > 1 ? 2 : 1)); // Assume A/B for FB unless 1 day
            const dayLetter = String.fromCharCode(65 + (i % cycleLength)); // A, B, C...

            if (effectiveSplit === 'full_body') dayTitle = `Full Body ${dayLetter}`;
            else if (effectiveSplit === 'half_body') dayTitle = dayType === 'upper' ? `Haut du Corps ${Math.ceil((i+1)/2)}` : `Bas du Corps ${Math.ceil((i+1)/2)}`; // Use number for half body
            else if (effectiveSplit === 'ppl') dayTitle = `${dayType.charAt(0).toUpperCase() + dayType.slice(1)} ${Math.ceil((i+1)/3)}`; // Use number for ppl


            // Filter out exercises used recently if possible, to add variety
            // Note: This filtering might conflict with core lift prioritization if not careful.
            // Let's pass the full available lists to selectExercisesForDay and let it handle filtering/prioritization.


            let selectedExercises = selectExercisesForDay(
                dayType,
                availableCompound, // Pass full list
                availableIsolation, // Pass full list
                maxExercises,
                goal,
                level,
                addedCoreLiftsThisWeek // Pass the set to track core lifts
            );

            // Basic reset for next week simulation if days > cycleLength (simplistic)
            if ((i + 1) % cycleLength === 0) {
                 addedCoreLiftsThisWeek.clear(); // Reset core lifts tracking at the start of a new cycle
            }


            schedule.push({
                day: i + 1,
                title: dayTitle,
                exercises: selectedExercises,
            });
        }

        // 5. Finalize Program Details
        const goalMap: Record<FormData['goal'], string> = {
            prise_masse: "Prise de Masse",
            seche: "Sèche / Perte de Gras",
            force: "Powerlifting", // Changed label here for description
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