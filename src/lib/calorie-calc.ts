/**
 * Calculate calories burned during exercise using MET formula.
 * 
 * Formula: Calories burned = MET × weight(kg) × duration(hours)
 * 
 * Duration is estimated based on set count and rest times.
 * ~45-60 seconds per set + ~90-120 seconds rest between sets.
 */
export function calculateExerciseCalories(
  met: number,
  weightKg: number,
  sets: number,
  _repsPerSet: number = 10
): number {
  // Estimate duration: each set takes ~30s of work + 90s of rest
  // First set might have longer setup time
  const minutesPerSet = 2.0; // ~2 min per set including rest
  const totalMinutes = sets * minutesPerSet;
  const hours = totalMinutes / 60;

  const calories = met * weightKg * hours;
  return Math.round(calories * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate total daily energy expenditure (TDEE).
 * 
 * Using BMR + activity factor + exercise calories.
 * Activity factor for sedentary = 1.2
 * (We add exercise calories separately)
 */
export function calculateTDEE(bmr: number, exerciseCalories: number): number {
  return bmr + exerciseCalories;
}

/**
 * Calculate calorie deficit for the day.
 * Negative = deficit (good for fat loss)
 */
export function calculateDeficit(
  intakeCalories: number,
  bmr: number,
  exerciseCalories: number
): number {
  const tdee = calculateTDEE(bmr, exerciseCalories);
  return Math.round((intakeCalories - tdee) * 10) / 10;
}

/**
 * Estimate weight loss from cumulative deficit.
 * 1 kg of fat ≈ 7700 kcal
 */
export function estimateFatLoss(totalDeficit: number): number {
  return Math.round((totalDeficit / 7700) * 100) / 100; // kg
}

/**
 * Estimate time to reach body fat goal based on daily deficit.
 */
export function estimateTimeToGoal(
  currentWeightKg: number,
  currentBodyFatPercent: number,
  targetBodyFatPercent: number,
  dailyDeficit: number
): { days: number; weeks: number; fatToLoseKg: number } {
  // Current fat mass
  const currentFatMass = currentWeightKg * (currentBodyFatPercent / 100);
  // Lean body mass
  const leanMass = currentWeightKg - currentFatMass;
  // Target weight at 12% body fat
  const targetWeight = leanMass / (1 - targetBodyFatPercent / 100);
  // Fat to lose
  const fatToLose = currentFatMass - targetWeight * (targetBodyFatPercent / 100);

  // Days needed at the given deficit
  const totalCaloriesToLose = fatToLose * 7700;
  const daysNeeded = Math.ceil(totalCaloriesToLose / Math.abs(dailyDeficit));

  return {
    days: daysNeeded,
    weeks: Math.round(daysNeeded / 7 * 10) / 10,
    fatToLoseKg: Math.round(fatToLose * 100) / 100,
  };
}
