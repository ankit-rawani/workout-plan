import { data } from "./workoutData.data.js";

// Configuration from the data loader
export const workoutConfig = {
  startDate: data.startDate,
  maxCycles: data.availableCycles.length,
  weeksPerCycle: data.weeksPerCycle,
};

// Get available cycles from pre-loaded data
export function getAvailableCycles() {
  return data.availableCycles;
}

// Get pre-loaded workout data
function getWorkoutData(cycle, week) {
  return data.workoutData[cycle]?.[week] || null;
}

export function calculateCurrentPlan(date = new Date()) {
  const startDate = new Date(workoutConfig.startDate);
  const diffInMs = date.getTime() - startDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Calculate current week (starting from week 1)
  const currentWeek = Math.floor(diffInDays / 7) + 1;

  // Calculate cycle (every 4 weeks is a new cycle)
  const cycle = Math.ceil(currentWeek / 4);

  // Calculate week within the cycle (1-4)
  const weekOfCycle = ((currentWeek - 1) % 4) + 1;

  // Get day of week (1 = Monday, 7 = Sunday)
  const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();

  return {
    cycle,
    weekOfCycle,
    dayOfWeek,
    currentWeek,
    diffInDays,
  };
}

export async function getWorkoutForDate(date = new Date()) {
  const plan = calculateCurrentPlan(date);

  // Check if the requested cycle exists
  if (plan.cycle > data.availableCycles.length) {
    return {
      ...plan,
      error: `Cycle ${plan.cycle} not available yet. Only cycles 1-${data.availableCycles.length} are currently available.`,
      dayContent: null,
      generalInstructions: null,
    };
  }

  // Get the pre-loaded workout data
  const workoutData = getWorkoutData(plan.cycle, plan.weekOfCycle);

  if (!workoutData) {
    return {
      ...plan,
      error: `Unable to load workout plan for Cycle ${plan.cycle}, Week ${plan.weekOfCycle}`,
      dayContent: null,
      generalInstructions: null,
    };
  }

  // Get the specific day's content
  const dayContent = workoutData.days[plan.dayOfWeek];

  // Get general instructions
  const generalInstructions = workoutData.generalInstructions;

  return {
    ...plan,
    dayContent,
    generalInstructions,
    error: null,
  };
}

// Utility functions for navigation
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getNextWorkoutDate(currentDate = new Date()) {
  return addDays(currentDate, 1);
}

export function getPreviousWorkoutDate(currentDate = new Date()) {
  return addDays(currentDate, -1);
}

export async function getWorkoutForNextDay(currentDate = new Date()) {
  const nextDate = getNextWorkoutDate(currentDate);
  return await getWorkoutForDate(nextDate);
}

export async function getWorkoutForPreviousDay(currentDate = new Date()) {
  const prevDate = getPreviousWorkoutDate(currentDate);
  return await getWorkoutForDate(prevDate);
}

// Development helper function to debug workout extraction
export async function debugWorkoutExtraction(cycle = 2, week = 1, day = 1) {
  console.log(`=== Debug: Cycle ${cycle}, Week ${week}, Day ${day} ===`);

  const workoutData = getWorkoutData(cycle, week);
  if (!workoutData) {
    console.log("❌ No workout data loaded");
    return;
  }

  console.log(`✅ Workout data loaded`);

  // Show available days
  const availableDays = Object.keys(workoutData.days).filter(
    (day) => workoutData.days[day],
  );
  console.log("📋 Available days:", availableDays);

  // Test day extraction
  const dayContent = workoutData.days[day];
  console.log(
    `🏋️ Day ${day} content:`,
    dayContent ? `Found (${dayContent.length} chars)` : "Not found",
  );

  // Test general instructions
  const generalInstructions = workoutData.generalInstructions;
  console.log(
    "📖 General instructions:",
    generalInstructions
      ? `Found (${generalInstructions.length} chars)`
      : "Not found",
  );

  return {
    workoutData,
    dayContent,
    generalInstructions,
    availableDays,
  };
}
