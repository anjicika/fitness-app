const models = require('../models');
const { Workout, Exercise, Progress } = models;

async function seedWorkouts() {
  try {
    console.log('Seeding workouts...');
    const sampleWorkouts = [
      { type: 'Running', duration: 30, caloriesBurned: 300, date: new Date('2025-12-20') },
      { type: 'Cycling', duration: 45, caloriesBurned: 400, date: new Date('2025-12-21') },
      { type: 'Weightlifting', duration: 60, caloriesBurned: 250, date: new Date('2025-12-22') },
    ];
    for (const w of sampleWorkouts) await Workout.create(w);
    console.log('Workouts seeded');
  } catch (error) {
    console.error('Error seeding workouts:', error);
    throw error;
  }
}

async function seedExercises() {
  try {
    console.log('Seeding exercises...');
    const sampleExercises = [
      { name: 'Push-up', description: 'Basic upper body exercise', category: 'Strength', muscleGroups: ['chest', 'triceps'] },
      { name: 'Squat', description: 'Lower body exercise', category: 'Strength', muscleGroups: ['quads', 'glutes'] },
      { name: 'Plank', description: 'Core stability exercise', category: 'Core', muscleGroups: ['abs', 'back'] },
    ];
    for (const e of sampleExercises) await Exercise.create(e);
    console.log('Exercises seeded');
  } catch (error) {
    console.error('Error seeding exercises:', error);
    throw error;
  }
}

async function seedProgress() {
  try {
    console.log('Seeding progress...');
    const sampleProgress = [
      { date: new Date('2025-12-20'), weight: 70.5, bodyFat: 15.2, measurements: { chest: 95, waist: 80 }, notes: 'Starting point' },
      { date: new Date('2025-12-27'), weight: 69.8, bodyFat: 14.8, measurements: { chest: 96, waist: 79 }, notes: 'Week 1 progress' },
    ];
    for (const p of sampleProgress) await Progress.create(p);
    console.log('Progress seeded');
  } catch (error) {
    console.error('Error seeding progress:', error);
    throw error;
  }
}

async function runSeeds() {
  await seedWorkouts();
  await seedExercises();
  await seedProgress();
}

module.exports = { seedWorkouts, seedExercises, seedProgress, runSeeds };