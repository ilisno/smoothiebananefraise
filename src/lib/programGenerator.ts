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
            { name: "Lunges", target: ["legs", "glutes", "quads", "hamstrings"] },
            { name: "Tractions Australiennes", target: ["back", "biceps"] },
            { name: "Pistol Squat", target: ["legs", "glutes", "quads", "core"] }, // Added Pistol Squat
            { name: "Pause Squat", target: ["legs", "glutes", "quads"] },      // Added Pause Squat
        ],
        machine: [
            { name: "Leg Press", target: ["legs", "glutes", "quads"] },
            { name: "Lat Pulldown", target: ["back", "biceps"] },
            { name: "Chest Press Machine", target: ["chest", "shoulders", "triceps"] },
            { name: "Seated Cable Row", target: ["back", "biceps"] },
            { name: "Shoulder Press Machine", target: ["shoulders", "triceps"] },
            { name: "Hack Squat", target: ["legs", "quads", "glutes"] },
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
             { name: "Crunchs", target: ["core"] },             // Kept Crunchs
             { name: "Relevés de Jambes", target: ["core"] }, // Kept Relevés de Jambes
             // Removed Glute Bridge and Plank
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
            { name: "Banded Reverse Curl", target: ["biceps", "forearms"] },
            { name: "Banded Lateral Walk", target: ["glutes", "hips"] },
            { name: "Banded Glute Bridge", target: ["glutes"] }, // Note: Glute Bridge with bands is still here
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
        available = available.concat(db.barbell || [], db.dumbbell || []);
    }
    if (equipment.machines_guidees) {
        available = available.concat(db.machine || []);
    }
     if (equipment.elastiques) {
        available = available.concat(db.elastiques || []);
    }
    // Always include bodyweight if selected or as a fallback foundation
    if (equipment.poids_corp || available.length === 0 || type === 'isolation') { // Ensure bodyweight isolation is always considered for core
         available = available.concat(db.bodyweight || []);
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

    // Specific exercise parameters
    if (exercise.name === "Pistol Squat") {
        sets = (level === 'intermediaire' ? 3 : '3-4');
        reps = (level === 'intermediaire' ? '3-6' : '5-8'); // Per leg
        rpe = '8-9';
        rest = "90-120s";
    } else if (exercise.name === "Pause Squat") {
        sets = 3;
        reps = '8-12'; // Focus on control
        rpe = '6-7';
        rest = "60-90s";
    } else if (exercise.name === "Relevés de Jambes" || exercise.name === "Crunchs") {
        sets = (level === 'debutant' ? 2 : '2-3');
        reps = (level === 'debutant' ? '10-15' : '15-25');
        rpe = '8-10';
        rest = "30-60s";
    } else {
        // --- Adjust based on Goal ---
        if (goal === 'force') {
            if (type === 'compound') {
                sets = level === 'debutant' ? 3 : (level === 'intermediaire' ? '3-4' : 5);
                reps = level === 'debutant' ? 5 : (level === 'intermediaire' ? '3-5' : '1-5');
                rpe = level === 'debutant' ? "6-7" : (level === 'intermediaire' ? '7-8' : '8-9');
                rest = "120-180s";
            } else {
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
                 reps = type === 'compound' ? "8-15" : "12-20";
                 rpe = '8-10';
                 rest = type === 'compound' ? "75-100s" : "30-60s";
            }
        } else if (goal === 'powerbuilding') {
            if (type === 'compound') {
                sets = level === 'debutant' ? 3 : (level === 'intermediaire' ? '3-4' : 4);
                reps = level === 'debutant' ? 5 : (level === 'intermediaire' ? '3-6' : 'Top 1-5 + Backoff 6-10');
                rpe = level === 'debutant' ? "7" : (level === 'intermediaire' ? '7-8' : '8-9');
                rest = "120-180s";
            } else {
                sets = level === 'debutant' ? 2 : 3;
                reps = "10-15";
                rpe = '9-10';
                rest = "60-90s";
            }
        }

        // --- Adjust based on Level (General Volume) ---
         if (level === 'debutant' && type !== 'isolation') { // Don't reduce sets for beginner isolation core work
             sets = Math.min(typeof sets === 'number' ? sets : parseInt(String(sets).split('-')[0]), 3);
         } else if (level === 'avance' && type !== 'isolation') {
             if (typeof sets === 'number' && sets < 5) sets++;
             else if (typeof sets === 'string' && sets.includes('-')) {
                 const parts = sets.split('-').map(Number);
                 sets = `${parts[0]}-${parts[1]+1}`;
             } else if (typeof sets === 'string' && !sets.includes('-')) {
                 sets = `${sets}-${parseInt(sets)+1}`;
             }
         }
    }


    // --- Enforce minimum reps based on equipment type ---
    const equipmentType = getExerciseEquipmentType(exercise.name);
    let minReps = 1;

    if (equipmentType === 'machine' || equipmentType === 'bodyweight' || equipmentType === 'elastiques') {
        minReps = 6;
    }
    if (exercise.name === "Relevés de Jambes" || exercise.name === "Crunchs") {
        minReps = 10; // Core exercises often higher rep
    }


    const eightRepMinExercises = ["Dumbbell Bench Press", "Dumbbell Row", "Romanian Deadlift (RDL)", "Goblet Squat"];
    if (eightRepMinExercises.includes(exercise.name)) {
        minReps = Math.max(minReps, 8);
    }


    let currentMinReps = 0;
    if (typeof reps === 'number') {
        currentMinReps = reps;
    } else if (typeof reps === 'string' && reps.includes('-')) {
        currentMinReps = parseInt(reps.split('-')[0]);
    } else if (typeof reps === 'string' && !isNaN(parseInt(reps))) {
         currentMinReps = parseInt(reps);
    } else if (typeof reps === 'string' && reps.toUpperCase() === 'AMRAP') {
        currentMinReps = minReps; // Assume AMRAP meets minReps
    }


    if (reps !== 'AMRAP' && currentMinReps < minReps) {
        if (typeof reps === 'number') {
             reps = minReps;
        } else if (typeof reps === 'string' && reps.includes('-')) {
             const parts = reps.split('-').map(Number);
             reps = `${Math.max(minReps, parts[0])}-${Math.max(minReps, parts[1])}`;
        } else {
             reps = `${minReps}-${minReps + 4}`;
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

function selectExercisesForDay(
    dayType: 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'full_body',
    availableCompound: { name: string, target: string[] }[],
    availableIsolation: { name: string, target: string[] }[],
    maxExercises: number,
    goal: FormData['goal'],
    level: FormData['level'],
    addedCoreLifts: Set<string>
): Exercise[] {
    let selectedExercises: Exercise[] = [];
    const addedNames = new Set<string>();

    const addExercise = (exercise: { name: string, target: string[] }, type: 'compound' | 'isolation') => {
        if (selectedExercises.length < maxExercises && !addedNames.has(exercise.name)) {
            const params = getSetsRepsRpe(exercise, goal, level, type);
            selectedExercises.push({ name: exercise.name, ...params });
            addedNames.add(exercise.name);
            return true;
        }
        return false;
    };

    const dayTargetsMap: Record<typeof dayType, string[]> = {
        push: ['chest', 'shoulders', 'triceps'],
        pull: ['back', 'biceps', 'forearms'],
        legs: ['quads', 'hamstrings', 'glutes', 'calves', 'legs', 'core'], // Added core for pistol squat
        upper: ['chest', 'shoulders', 'triceps', 'back', 'biceps', 'forearms'],
        lower: ['quads', 'hamstrings', 'glutes', 'calves', 'legs', 'core'], // Added core for pistol squat
        full_body: ['chest', 'shoulders', 'triceps', 'back', 'biceps', 'quads', 'hamstrings', 'glutes', 'legs', 'core']
    };
    const dayTargets = dayTargetsMap[dayType];

    // --- Add level-specific squats at the beginning for relevant days ---
    if (dayType === 'legs' || dayType === 'lower' || dayType === 'full_body') {
        if (level === 'debutant') {
            const pauseSquat = availableCompound.find(ex => ex.name === "Pause Squat");
            if (pauseSquat) addExercise(pauseSquat, 'compound');
        } else if (level === 'intermediaire' || level === 'avance') {
            const pistolSquat = availableCompound.find(ex => ex.name === "Pistol Squat");
            if (pistolSquat) addExercise(pistolSquat, 'compound');
        }
    }

    // --- Powerlifting (Force) & Powerbuilding Specific Prioritization (after special squats) ---
    if (goal === 'force' || goal === 'powerbuilding') {
        const coreLifts: { name: string, dayTypes: (typeof dayType)[] }[] = [
            { name: "Squat", dayTypes: ['legs', 'full_body', 'lower'] },
            { name: "Bench Press", dayTypes: ['push', 'upper', 'full_body'] },
            { name: "Deadlift", dayTypes: ['legs', 'pull', 'full_body', 'lower'] },
        ];

        for (const lift of coreLifts) {
            if (lift.dayTypes.includes(dayType) && !addedCoreLifts.has(lift.name) && !addedNames.has(lift.name)) {
                const compoundExercise = availableCompound.find(ex => ex.name === lift.name);
                if (compoundExercise) {
                    if (addExercise(compoundExercise, 'compound')) {
                         addedCoreLifts.add(lift.name);
                    }
                } else {
                    console.warn(`${goal} goal selected, but required lift "${lift.name}" is not available for day type "${dayType}".`);
                }
            }
        }
    }

    // Filter available exercises for the current day type (excluding already added special squats/core lifts)
    const dayCompounds = shuffleArray(availableCompound.filter(ex => ex.target.some(t => dayTargets.includes(t)) && !addedNames.has(ex.name)));
    const dayIsolations = shuffleArray(availableIsolation.filter(ex => ex.target.some(t => dayTargets.includes(t)) && !addedNames.has(ex.name) && !ex.target.includes('core'))); // Exclude core initially

    let compoundCount = selectedExercises.filter(ex => availableCompound.some(c => c.name === ex.name)).length;
    const targetCompoundCount = dayType === 'full_body' ? Math.max(1, Math.min(3, Math.floor(maxExercises * 0.5)))
                             : Math.max(1, Math.floor(maxExercises * (goal === 'force' || goal === 'powerbuilding' ? 0.6 : 0.5)));

    for (const ex of dayCompounds) {
        if (compoundCount < targetCompoundCount) {
            if(addExercise(ex, 'compound')) compoundCount++;
        }
    }

    const currentTargets = new Set(selectedExercises.flatMap(ex =>
        (availableCompound.find(c => c.name === ex.name) || availableIsolation.find(i => i.name === ex.name))?.target ?? []
    ));

    for (const ex of dayIsolations) {
        if (selectedExercises.length < maxExercises) {
             const targetsNewMuscle = !ex.target.every(t => currentTargets.has(t));
             if (targetsNewMuscle || selectedExercises.length < maxExercises -1 ) {
                 if(addExercise(ex, 'isolation')) {
                    ex.target.forEach(t => currentTargets.add(t));
                 }
             }
        }
    }

     if (selectedExercises.length < maxExercises) {
         for (const ex of dayCompounds) { // Try adding more relevant compounds if space
             if (addExercise(ex, 'compound')) {}
         }
     }
     if (selectedExercises.length < maxExercises) { // Try adding more relevant isolations if space
         for (const ex of dayIsolations) {
             if (addExercise(ex, 'isolation')) {}
         }
     }

    // Add Core Work (Relevés de Jambes, Crunchs) for all levels if space allows
    const coreExerciseNames = ["Relevés de Jambes", "Crunchs"];
    for (const coreName of coreExerciseNames) {
        if (selectedExercises.length < maxExercises && !addedNames.has(coreName)) {
            const coreEx = availableIsolation.find(ex => ex.name === coreName && ex.target.includes('core')); // Ensure it's from isolation pool
            if (coreEx) {
                addExercise(coreEx, 'isolation');
            }
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

        let effectiveSplit = split;
        if (split === 'autre' || (split === 'full_body' && days > 4) || (split === 'half_body' && days > 5) || (split === 'ppl' && days < 3)) {
             console.log(`Adjusting split from ${split} for ${days} days...`);
            if (days <= 2) effectiveSplit = 'full_body';
            else if (days === 3) effectiveSplit = level === 'debutant' ? 'full_body' : 'ppl';
            else if (days === 4) effectiveSplit = 'half_body';
            else if (days === 5) effectiveSplit = 'ppl';
            else effectiveSplit = 'ppl';
             console.log(`Adjusted split to ${effectiveSplit}`);
        } else if ((goal === 'force' || goal === 'powerbuilding') && effectiveSplit !== 'ppl' && days >= 3) {
             console.log(`Adjusting split to PPL for ${goal} goal with ${days} days.`);
             effectiveSplit = 'ppl';
        }

        const availableCompoundExercises = getAvailableExercises(equipment, 'compound');
        const hasSquat = availableCompoundExercises.some(ex => ex.name === 'Squat');
        const hasBench = availableCompoundExercises.some(ex => ex.name === 'Bench Press');
        const hasDeadlift = availableCompoundExercises.some(ex => ex.name === 'Deadlift');

        if ((goal === 'force' || goal === 'powerbuilding') && (!hasSquat || !hasBench || !hasDeadlift)) {
             let missing = [];
             if (!hasSquat) missing.push('Squat');
             if (!hasBench) missing.push('Bench Press');
             if (!hasDeadlift) missing.push('Deadlift');
             throw new Error(`Pour un objectif ${goal === 'force' ? 'Powerlifting' : 'Powerbuilding'}, vous devez avoir l'équipement nécessaire pour le ${missing.join(', la ')}${missing.length > 1 ? ' et le Deadlift' : ' et le Deadlift'}.`);
        }


        const dayTypesSequence: ('push' | 'pull' | 'legs' | 'upper' | 'lower' | 'full_body')[] = [];
        if (effectiveSplit === 'full_body') {
            for (let i = 0; i < days; i++) dayTypesSequence.push('full_body');
        } else if (effectiveSplit === 'half_body') {
            for (let i = 0; i < days; i++) dayTypesSequence.push(i % 2 === 0 ? 'upper' : 'lower');
        } else if (effectiveSplit === 'ppl') {
            const pplCycle: ('push' | 'pull' | 'legs')[] = ['push', 'pull', 'legs'];
            for (let i = 0; i < days; i++) dayTypesSequence.push(pplCycle[i % 3]);
        }

        const avgTimePerExercise = level === 'debutant' ? 12 : (level === 'intermediaire' ? 9 : 7);
        const maxExercisesPerSession = Math.max(3, Math.min(8, Math.floor(duration / avgTimePerExercise)));
        console.log(`Estimated max exercises per session: ${maxExercisesPerSession} (duration: ${duration}, level: ${level})`);

        const availableIsolationExercises = getAvailableExercises(equipment, 'isolation');
        const schedule: WorkoutDay[] = [];
        const weeklyAddedCoreLifts = new Set<string>();

        for (let i = 0; i < days; i++) {
            const currentDayType = dayTypesSequence[i];
            let dayTitle = "";
            const cycleLength = effectiveSplit === 'ppl' ? 3 : (effectiveSplit === 'half_body' ? 2 : (days > 1 ? 2 : 1));
            const dayLetter = String.fromCharCode(65 + (i % cycleLength));

            if (effectiveSplit === 'full_body') dayTitle = `Full Body ${dayLetter}`;
            else if (effectiveSplit === 'half_body') dayTitle = currentDayType === 'upper' ? `Haut du Corps ${dayLetter}` : `Bas du Corps ${dayLetter}`;
            else if (effectiveSplit === 'ppl') dayTitle = `${currentDayType.charAt(0).toUpperCase() + currentDayType.slice(1)} ${dayLetter}`;


            let exercisesForThisDay = selectExercisesForDay(
                currentDayType,
                availableCompoundExercises,
                availableIsolationExercises,
                maxExercisesPerSession,
                goal,
                level,
                weeklyAddedCoreLifts
            );

            if ((i + 1) % (effectiveSplit === 'ppl' ? 3 : (effectiveSplit === 'half_body' ? 2 : 7)) === 0) { // Reset core lifts weekly or per cycle
                 weeklyAddedCoreLifts.clear();
            }

            schedule.push({
                day: i + 1,
                title: dayTitle,
                exercises: exercisesForThisDay,
            });
        }

        const goalMap: Record<FormData['goal'], string> = {
            prise_masse: "Prise de Masse",
            seche: "Sèche / Perte de Gras",
            force: "Powerlifting",
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