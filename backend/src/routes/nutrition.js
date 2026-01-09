// src/routes/nutrition.js
const express = require('express');
const aiNutritionService = require('../services/aiNutritionService');
const { authenticate } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @route   POST /api/v1/nutrition/advice
 * @desc    Get personalized nutrition advice from AI
 * @access  Private (requires authentication)
 * @limit   10 requests per 15 minutes
 */
router.post('/advice', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const userProfile = {
      age: req.user.age,
      weight: req.user.weight,
      height: req.user.height,
      gender: req.user.gender,
      fitnessGoal: req.body.fitnessGoal || req.user.fitnessGoal,
      activityLevel: req.body.activityLevel || req.user.activityLevel,
      dietaryRestrictions:
        req.body.dietaryRestrictions || req.user.dietaryRestrictions,
    };

    if (!userProfile.age || !userProfile.weight || !userProfile.height) {
      return res.status(400).json({
        success: false,
        error: 'Missing required profile information (age, weight, height)',
      });
    }

    const advice = await aiNutritionService.getNutritionAdvice(userProfile);

    res.json({
      success: true,
      data: {
        advice,
        userProfile: {
          fitnessGoal: userProfile.fitnessGoal,
          activityLevel: userProfile.activityLevel,
          dailyCalories: aiNutritionService.calculateCalories(userProfile),
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Nutrition advice error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate nutrition advice. Please try again.',
      details:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/v1/nutrition/meal-plan
 * @desc    Generate AI meal plan for specified days
 * @access  Private
 * @limit   10 requests per 15 minutes
 */
router.post('/meal-plan', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const { days = 7, dietaryRestrictions } = req.body;

    if (days < 1 || days > 30) {
      return res.status(400).json({
        success: false,
        error: 'Days must be between 1 and 30',
      });
    }

    const userProfile = {
      weight: req.user.weight,
      height: req.user.height,
      age: req.user.age,
      gender: req.user.gender,
      fitnessGoal: req.user.fitnessGoal,
      activityLevel: req.user.activityLevel,
      dietaryRestrictions: dietaryRestrictions || req.user.dietaryRestrictions,
    };

    const mealPlan = await aiNutritionService.generateMealPlan(
      userProfile,
      days
    );

    res.json({
      success: true,
      data: {
        mealPlan,
        metadata: {
          days,
          dailyCalorieTarget: aiNutritionService.calculateCalories(userProfile),
          macroSplit: aiNutritionService.getMacroSplit(userProfile.fitnessGoal),
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Meal plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate meal plan. Please try again.',
      details:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   GET /api/v1/nutrition/calories
 * @desc    Calculate user's daily calorie needs
 * @access  Private
 */
router.get('/calories', authenticate, async (req, res) => {
  try {
    const userProfile = {
      weight: req.user.weight,
      height: req.user.height,
      age: req.user.age,
      gender: req.user.gender,
      activityLevel: req.user.activityLevel,
      fitnessGoal: req.user.fitnessGoal,
    };

    const dailyCalories = aiNutritionService.calculateCalories(userProfile);
    const macroSplit = aiNutritionService.getMacroSplit(
      userProfile.fitnessGoal
    );
    const macroGrams = aiNutritionService.calculateMacroGrams(
      dailyCalories,
      macroSplit
    );

    let bmr;
    if (userProfile.gender === 'male') {
      bmr = Math.round(
        10 * userProfile.weight +
          6.25 * userProfile.height -
          5 * userProfile.age +
          5
      );
    } else {
      bmr = Math.round(
        10 * userProfile.weight +
          6.25 * userProfile.height -
          5 * userProfile.age -
          161
      );
    }

    res.json({
      success: true,
      data: {
        dailyCalories,
        bmr,
        activityLevel: userProfile.activityLevel,
        fitnessGoal: userProfile.fitnessGoal,
        macros: {
          percentages: macroSplit,
          grams: macroGrams,
          calories: {
            protein: macroGrams.protein * 4,
            carbs: macroGrams.carbs * 4,
            fats: macroGrams.fats * 9,
          },
        },
      },
    });
  } catch (error) {
    console.error('Calorie calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate calories',
      details:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/v1/nutrition/analyze-meal
 * @desc    Analyze meal from natural language description
 * @access  Private
 * @limit   10 requests per 15 minutes
 */
router.post('/analyze-meal', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const { mealDescription } = req.body;

    if (!mealDescription || mealDescription.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Meal description required (min 3 characters)',
      });
    }

    const analysis = await aiNutritionService.analyzeMeal(mealDescription);

    res.json({
      success: true,
      data: {
        analysis,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Meal analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze meal. Please try again.',
      details:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   GET /api/v1/nutrition/macro-recommendations
 * @desc    Get macro split recommendations based on goal
 * @access  Private
 */
router.get('/macro-recommendations', authenticate, async (req, res) => {
  try {
    const { fitnessGoal } = req.query;
    const goal = fitnessGoal || req.user.fitnessGoal;

    const macroSplit = aiNutritionService.getMacroSplit(goal);
    const dailyCalories = aiNutritionService.calculateCalories({
      weight: req.user.weight,
      height: req.user.height,
      age: req.user.age,
      gender: req.user.gender,
      activityLevel: req.user.activityLevel,
      fitnessGoal: goal,
    });

    const macroGrams = aiNutritionService.calculateMacroGrams(
      dailyCalories,
      macroSplit
    );

    res.json({
      success: true,
      data: {
        fitnessGoal: goal,
        dailyCalories,
        macros: {
          percentages: macroSplit,
          grams: macroGrams,
        },
        recommendations: {
          weight_loss:
            'Higher protein to preserve muscle, moderate carbs and fats',
          muscle_gain: 'Higher carbs for energy, adequate protein for growth',
          maintenance: 'Balanced approach for overall health',
          endurance: 'Higher carbs for sustained energy during long activities',
        }[goal],
      },
    });
  } catch (error) {
    console.error('Macro recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations',
    });
  }
});

module.exports = router;
