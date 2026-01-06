require('dotenv').config();

const aiNutritionService = require('../src/services/aiNutritionService');

describe('AI Nutrition Service Tests', function () {
  this.timeout(20000);

  const mockUserProfile = {
    age: 25,
    weight: 75,
    height: 180,
    gender: 'male',
    fitnessGoal: 'weight_loss',
    activityLevel: 'moderate',
    dietaryRestrictions: null,
  };

  describe('calculateCalories()', function () {
    it('should calculate calories for male user', function () {
      const calories = aiNutritionService.calculateCalories(mockUserProfile);
      expect(calories).to.be.a('number');
      expect(calories).to.be.greaterThan(1500);
      expect(calories).to.be.lessThan(4000);
    });

    it('should calculate lower calories for weight loss', function () {
      const maintenanceProfile = { ...mockUserProfile, fitnessGoal: 'maintenance' };
      const weightLossProfile = { ...mockUserProfile, fitnessGoal: 'weight_loss' };

      const maintenanceCal = aiNutritionService.calculateCalories(maintenanceProfile);
      const weightLossCal = aiNutritionService.calculateCalories(weightLossProfile);

      expect(weightLossCal).to.be.lessThan(maintenanceCal);
      expect(maintenanceCal - weightLossCal).to.equal(500);
    });

    it('should calculate higher calories for muscle gain', function () {
      const maintenanceProfile = { ...mockUserProfile, fitnessGoal: 'maintenance' };
      const muscleGainProfile = { ...mockUserProfile, fitnessGoal: 'muscle_gain' };

      const maintenanceCal = aiNutritionService.calculateCalories(maintenanceProfile);
      const muscleGainCal = aiNutritionService.calculateCalories(muscleGainProfile);

      expect(muscleGainCal).to.be.greaterThan(maintenanceCal);
      expect(muscleGainCal - maintenanceCal).to.equal(300);
    });
  });

  describe('getMacroSplit()', function () {
    it('should return macro split for weight loss', function () {
      const split = aiNutritionService.getMacroSplit('weight_loss');
      expect(split).to.have.property('protein');
      expect(split).to.have.property('carbs');
      expect(split).to.have.property('fats');
      expect(split.protein + split.carbs + split.fats).to.equal(100);
    });

    it('should return higher protein for weight loss', function () {
      const weightLoss = aiNutritionService.getMacroSplit('weight_loss');
      const muscleGain = aiNutritionService.getMacroSplit('muscle_gain');
      expect(weightLoss.protein).to.be.greaterThan(muscleGain.protein);
    });

    it('should return default split for unknown goal', function () {
      const split = aiNutritionService.getMacroSplit('unknown_goal');
      const maintenance = aiNutritionService.getMacroSplit('maintenance');
      expect(split).to.deep.equal(maintenance);
    });
  });

  describe('calculateMacroGrams()', function () {
    it('should calculate macro grams correctly', function () {
      const calories = 2000;
      const split = { protein: 30, carbs: 40, fats: 30 };
      const grams = aiNutritionService.calculateMacroGrams(calories, split);
      expect(grams.protein).to.equal(150);
      expect(grams.carbs).to.equal(200);
      expect(grams.fats).to.equal(67);
    });

    it('should handle different calorie amounts', function () {
      const split = { protein: 30, carbs: 40, fats: 30 };
      const grams1500 = aiNutritionService.calculateMacroGrams(1500, split);
      const grams3000 = aiNutritionService.calculateMacroGrams(3000, split);
      expect(grams3000.protein).to.be.greaterThan(grams1500.protein);
      expect(grams3000.carbs).to.be.greaterThan(grams1500.carbs);
      expect(grams3000.fats).to.be.greaterThan(grams1500.fats);
    });
  });

  describe('getNutritionAdvice() - AI Integration', function () {
    it('should generate nutrition advice from AI', async function () {
      this.timeout(30000);
      try {
        const advice = await aiNutritionService.getNutritionAdvice(mockUserProfile);
        expect(advice).to.be.a('string');
        expect(advice.length).to.be.greaterThan(50);
        console.log('\n✅ AI Advice Sample:');
        console.log(advice.substring(0, 200) + '...\n');
      } catch (error) {
        if (error.message.includes('Gemini API key') || error.message.includes('not configured')) {
          this.skip();
        }
        throw error;
      }
    });
  });

  describe('generateMealPlan() - AI Integration', function () {
    it('should generate 3-day meal plan', async function () {
      this.timeout(40000);
      try {
        const mealPlan = await aiNutritionService.generateMealPlan(mockUserProfile, 3);
        expect(mealPlan).to.be.an('object');
        expect(mealPlan.days).to.be.an('array');
        expect(mealPlan.days).to.have.lengthOf(3);
        const firstDay = mealPlan.days[0];
        expect(firstDay).to.have.property('day');
        expect(firstDay).to.have.property('meals');
        expect(firstDay.meals).to.be.an('array');
        console.log('\n✅ Meal Plan Sample (Day 1):');
        console.log(JSON.stringify(firstDay.meals[0], null, 2));
        console.log('...\n');
      } catch (error) {
        if (error.message.includes('Gemini API key') || error.message.includes('not configured')) {
          this.skip();
        }
        throw error;
      }
    });
  });

  describe('analyzeMeal() - AI Integration', function () {
    it('should analyze a meal description', async function () {
      this.timeout(30000);
      try {
        const mealDescription = 'Grilled chicken breast 200g, brown rice 150g, steamed broccoli 100g';
        const analysis = await aiNutritionService.analyzeMeal(mealDescription);
        expect(analysis).to.be.an('object');
        expect(analysis).to.have.property('totalCalories');
        expect(analysis).to.have.property('protein');
        expect(analysis).to.have.property('carbs');
        expect(analysis).to.have.property('fats');
        expect(analysis.totalCalories).to.be.greaterThan(200);
        console.log('\n✅ Meal Analysis:');
        console.log(JSON.stringify(analysis, null, 2));
        console.log('\n');
      } catch (error) {
        if (error.message.includes('Gemini API key') || error.message.includes('not configured')) {
          this.skip();
        }
        throw error;
      }
    });
  });
});