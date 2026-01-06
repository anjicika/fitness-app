require('dotenv').config();

const aiNutritionService = require('../src/services/aiNutritionService');

describe('AI Nutrition Service Tests', () => {
  jest.setTimeout(20000);

  const mockUserProfile = {
    age: 25,
    weight: 75,
    height: 180,
    gender: 'male',
    fitnessGoal: 'weight_loss',
    activityLevel: 'moderate',
    dietaryRestrictions: null,
  };

  describe('calculateCalories()', () => {
    it('should calculate calories for male user', () => {
      const calories = aiNutritionService.calculateCalories(mockUserProfile);
      expect(typeof calories).toBe('number');
      expect(calories).toBeGreaterThan(1500);
      expect(calories).toBeLessThan(4000);
    });

    it('should calculate lower calories for weight loss', () => {
      const maintenanceProfile = {
        ...mockUserProfile,
        fitnessGoal: 'maintenance',
      };
      const weightLossProfile = {
        ...mockUserProfile,
        fitnessGoal: 'weight_loss',
      };

      const maintenanceCal =
        aiNutritionService.calculateCalories(maintenanceProfile);
      const weightLossCal =
        aiNutritionService.calculateCalories(weightLossProfile);

      expect(weightLossCal).toBeLessThan(maintenanceCal);
      expect(maintenanceCal - weightLossCal).toBe(500);
    });

    it('should calculate higher calories for muscle gain', () => {
      const maintenanceProfile = {
        ...mockUserProfile,
        fitnessGoal: 'maintenance',
      };
      const muscleGainProfile = {
        ...mockUserProfile,
        fitnessGoal: 'muscle_gain',
      };

      const maintenanceCal =
        aiNutritionService.calculateCalories(maintenanceProfile);
      const muscleGainCal =
        aiNutritionService.calculateCalories(muscleGainProfile);

      expect(muscleGainCal).toBeGreaterThan(maintenanceCal);
      expect(muscleGainCal - maintenanceCal).toBe(300);
    });
  });

  describe('getMacroSplit()', () => {
    it('should return macro split for weight loss', () => {
      const split = aiNutritionService.getMacroSplit('weight_loss');
      expect(split).toHaveProperty('protein');
      expect(split).toHaveProperty('carbs');
      expect(split).toHaveProperty('fats');
      expect(split.protein + split.carbs + split.fats).toBe(100);
    });

    it('should return higher protein for weight loss', () => {
      const weightLoss = aiNutritionService.getMacroSplit('weight_loss');
      const muscleGain = aiNutritionService.getMacroSplit('muscle_gain');
      expect(weightLoss.protein).toBeGreaterThan(muscleGain.protein);
    });

    it('should return default split for unknown goal', () => {
      const split = aiNutritionService.getMacroSplit('unknown_goal');
      const maintenance = aiNutritionService.getMacroSplit('maintenance');
      expect(split).toEqual(maintenance);
    });
  });

  describe('calculateMacroGrams()', () => {
    it('should calculate macro grams correctly', () => {
      const calories = 2000;
      const split = { protein: 30, carbs: 40, fats: 30 };
      const grams = aiNutritionService.calculateMacroGrams(calories, split);
      expect(grams.protein).toBe(150);
      expect(grams.carbs).toBe(200);
      expect(grams.fats).toBe(67);
    });

    it('should handle different calorie amounts', () => {
      const split = { protein: 30, carbs: 40, fats: 30 };
      const grams1500 = aiNutritionService.calculateMacroGrams(1500, split);
      const grams3000 = aiNutritionService.calculateMacroGrams(3000, split);
      expect(grams3000.protein).toBeGreaterThan(grams1500.protein);
      expect(grams3000.carbs).toBeGreaterThan(grams1500.carbs);
      expect(grams3000.fats).toBeGreaterThan(grams1500.fats);
    });
  });

  describe('getNutritionAdvice() - AI Integration', () => {
    it('should generate nutrition advice from AI', async () => {
      try {
        const advice =
          await aiNutritionService.getNutritionAdvice(mockUserProfile);
        expect(typeof advice).toBe('string');
        expect(advice.length).toBeGreaterThan(50);
        console.log('\n✅ AI Advice Sample:');
        console.log(advice.substring(0, 200) + '...\n');
      } catch (error) {
        if (
          error.message.includes('Gemini API key') ||
          error.message.includes('not configured')
        ) {
          console.log('⏭️  Skipping test - Gemini API key not configured');
          return;
        }
        throw error;
      }
    }, 30000);
  });

  describe('generateMealPlan() - AI Integration', () => {
    it('should generate 3-day meal plan', async () => {
      try {
        const mealPlan = await aiNutritionService.generateMealPlan(
          mockUserProfile,
          3
        );
        expect(mealPlan).toBeInstanceOf(Object);
        expect(mealPlan.days).toBeInstanceOf(Array);
        expect(mealPlan.days).toHaveLength(3);
        const firstDay = mealPlan.days[0];
        expect(firstDay).toHaveProperty('day');
        expect(firstDay).toHaveProperty('meals');
        expect(firstDay.meals).toBeInstanceOf(Array);
        console.log('\n✅ Meal Plan Sample (Day 1):');
        console.log(JSON.stringify(firstDay.meals[0], null, 2));
        console.log('...\n');
      } catch (error) {
        if (
          error.message.includes('Gemini API key') ||
          error.message.includes('not configured')
        ) {
          console.log('⏭️  Skipping test - Gemini API key not configured');
          return;
        }
        throw error;
      }
    }, 40000);
  });

  describe('analyzeMeal() - AI Integration', () => {
    it('should analyze a meal description', async () => {
      try {
        const mealDescription =
          'Grilled chicken breast 200g, brown rice 150g, steamed broccoli 100g';
        const analysis = await aiNutritionService.analyzeMeal(mealDescription);
        expect(analysis).toBeInstanceOf(Object);
        expect(analysis).toHaveProperty('totalCalories');
        expect(analysis).toHaveProperty('protein');
        expect(analysis).toHaveProperty('carbs');
        expect(analysis).toHaveProperty('fats');
        expect(analysis.totalCalories).toBeGreaterThan(200);
        console.log('\n✅ Meal Analysis:');
        console.log(JSON.stringify(analysis, null, 2));
        console.log('\n');
      } catch (error) {
        if (
          error.message.includes('Gemini API key') ||
          error.message.includes('not configured')
        ) {
          console.log('⏭️  Skipping test - Gemini API key not configured');
          return;
        }
        throw error;
      }
    }, 30000);
  });
});
