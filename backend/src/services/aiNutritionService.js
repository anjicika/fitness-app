const { GoogleGenerativeAI } = require('@google/generative-ai');

// Lazy inicializacija – genAI ustvarimo samo, če key obstaja
let genAI = null;

if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (error) {
    console.warn('Invalid GEMINI_API_KEY – AI features disabled:', error.message);
    genAI = null;
  }
} else {
  console.warn('GEMINI_API_KEY is not set – AI nutrition features will use fallback');
}

class AINutritionService {
  // Pomocna metoda za generiranje modela (samo če genAI obstaja)
  getModel(config = {}) {
    if (!genAI) {
      throw new Error('Gemini API key not configured – using fallback');
    }
    return genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: config.temperature || 0.7,
        maxOutputTokens: config.maxOutputTokens || 1000,
        responseMimeType: config.responseMimeType || 'text/plain',
      },
    });
  }

  async getNutritionAdvice(userProfile) {
    try {
      const model = this.getModel({ temperature: 0.7, maxOutputTokens: 500 });
      const prompt = `You are a professional nutritionist. Provide concise advice for this user:
Age: ${userProfile.age}, Weight: ${userProfile.weight}kg, Height: ${userProfile.height}cm, Gender: ${userProfile.gender}
Goal: ${userProfile.fitnessGoal}, Activity: ${userProfile.activityLevel}
Restrictions: ${userProfile.dietaryRestrictions || 'None'}
Focus on calories, macros, timing, foods. Max 200 words. Plain text only.`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Gemini API Error for nutrition advice:', error.message);
      return this.generateFallbackNutritionAdvice(userProfile);
    }
  }

  async generateMealPlan(userProfile, days = 3) {
    try {
      const model = this.getModel({
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 8000,
      });

      const dailyCalories = this.calculateCalories(userProfile);
      const macros = this.getMacroSplit(userProfile.fitnessGoal);

      const prompt = `Generate a realistic ${days}-day meal plan.
Daily calories: ${dailyCalories}
Macro split: ${macros.protein}% protein, ${macros.carbs}% carbs, ${macros.fats}% fats
Goal: ${userProfile.fitnessGoal}
Restrictions: ${userProfile.dietaryRestrictions || 'None'}

Return ONLY valid JSON with this exact structure:
{
  "totalDays": ${days},
  "dailyCalorieTarget": ${dailyCalories},
  "macroSplit": { "protein": ${macros.protein}, "carbs": ${macros.carbs}, "fats": ${macros.fats} },
  "days": [
    {
      "day": 1,
      "meals": [
        { "meal": "Breakfast", "description": "short description", "calories": number, "protein": number, "carbs": number, "fats": number },
        { "meal": "Lunch", "description": "short description", "calories": number, "protein": number, "carbs": number, "fats": number },
        { "meal": "Dinner", "description": "short description", "calories": number, "protein": number, "carbs": number, "fats": number }
      ]
    }
  ]
}
Use double quotes. Ensure complete and valid JSON.`;

      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();

      const jsonStr = this.cleanJSONResponse(text);
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Meal plan generation failed:', error.message);
      return this.generateFallbackMealPlan(userProfile, days);
    }
  }

  async analyzeMeal(mealDescription) {
    try {
      const model = this.getModel({
        responseMimeType: 'application/json',
        temperature: 0.4,
        maxOutputTokens: 1000,
      });

      const prompt = `Analyze this meal: "${mealDescription}"
Estimate nutrition with typical portions.
Return ONLY valid JSON:
{
  "mealName": "short name",
  "totalCalories": number,
  "protein": number,
  "carbs": number,
  "fats": number,
  "fiber": number,
  "foods": [{ "name": "food", "portion": "size", "calories": number }],
  "healthScore": number (1-10),
  "suggestions": "short suggestion"
}`;

      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();

      const jsonStr = this.cleanJSONResponse(text);
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Meal analysis failed:', error.message);
      return this.generateFallbackMealAnalysis(mealDescription);
    }
  }

  validateJSONCompletion(jsonStr) {
    const trimmed = jsonStr.trim();

    let braceCount = 0;
    let bracketCount = 0;

    for (let char of trimmed) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      if (char === '[') bracketCount++;
      if (char === ']') bracketCount--;
    }

    if (braceCount !== 0) {
      throw new Error(`Unbalanced braces: ${braceCount}`);
    }
    if (bracketCount !== 0) {
      throw new Error(`Unbalanced brackets: ${bracketCount}`);
    }
  }

  cleanJSONResponse(text) {
    if (!text || text.trim() === '') {
      throw new Error('No response text received');
    }

    let cleaned = text;

    cleaned = cleaned.replace(/```json\s*/gi, '');
    cleaned = cleaned.replace(/```\s*/gi, '');

    if (cleaned.toLowerCase().startsWith('json')) {
      cleaned = cleaned.substring(4).trim();
    }

    const firstBrace = cleaned.indexOf('{');
    if (firstBrace === -1) {
      throw new Error('No JSON object found');
    }

    let lastBrace = cleaned.lastIndexOf('}');

    if (lastBrace === -1) {
      const lastValidChars = ['}', ']', '"'];
      let lastValidIndex = -1;

      for (let i = cleaned.length - 1; i >= 0; i--) {
        if (lastValidChars.includes(cleaned[i])) {
          lastValidIndex = i;
          break;
        }
      }

      if (lastValidIndex > firstBrace) {
        cleaned = cleaned.substring(0, lastValidIndex + 1) + '}';
        lastBrace = cleaned.length - 1;
      } else {
        cleaned += '}';
        lastBrace = cleaned.length - 1;
      }
    }

    if (lastBrace <= firstBrace) {
      throw new Error('Invalid JSON boundaries');
    }

    let jsonContent = cleaned.substring(firstBrace, lastBrace + 1);

    jsonContent = this.fixTruncatedStrings(jsonContent);

    let fixed = jsonContent
      .replace(/'/g, '"')
      .replace(/(\w+):/g, '"$1":')
      .replace(/,(\s*[\]}])/g, '$1')
      .replace(/:\s*true\b/g, ': true')
      .replace(/:\s*false\b/g, ': false')
      .replace(/:\s*null\b/g, ': null')
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    fixed = this.fixStringValues(fixed);

    return fixed;
  }

  fixTruncatedStrings(jsonContent) {
    const commonKeys = {
      car: 'carbs',
      prote: 'protein',
      descrip: 'description',
      calori: 'calories',
      healt: 'healthScore',
      suggestio: 'suggestions',
      totalCalori: 'totalCalories',
    };

    let fixed = jsonContent;

    for (const [bad, good] of Object.entries(commonKeys)) {
      const regex = new RegExp(`"${bad}"\\s*:`, 'g');
      fixed = fixed.replace(regex, `"${good}":`);
    }

    fixed = fixed.replace(/"([^"]*?)(?=\s*"|,|\]|\})/g, (match, content) => {
      if (match.endsWith('"')) {
        return match;
      }
      return `"${content}..."`;
    });

    return fixed;
  }

  fixStringValues(jsonStr) {
    let result = '';
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr[i];

      if (escapeNext) {
        result += char;
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        result += char;
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        result += char;
        continue;
      }

      if (!inString && char === ':' && i + 1 < jsonStr.length) {
        let nextIndex = i + 1;
        while (nextIndex < jsonStr.length && jsonStr[nextIndex] === ' ') {
          nextIndex++;
        }

        if (nextIndex < jsonStr.length) {
          const nextChar = jsonStr[nextIndex];
          if (
            nextChar !== '"' &&
            nextChar !== '[' &&
            nextChar !== '{' &&
            nextChar !== 't' &&
            nextChar !== 'f' &&
            nextChar !== 'n' &&
            !/[\d-]/.test(nextChar)
          ) {
            result += ': "';
            let endIndex = nextIndex;
            while (
              endIndex < jsonStr.length &&
              jsonStr[endIndex] !== ',' &&
              jsonStr[endIndex] !== '}' &&
              jsonStr[endIndex] !== ']'
            ) {
              endIndex++;
            }

            result += jsonStr.substring(nextIndex, endIndex).trim();
            result += '"';

            if (endIndex < jsonStr.length) {
              result += jsonStr[endIndex];
            }

            i = endIndex;
            continue;
          }
        }
      }

      result += char;
    }

    return result;
  }

  generateFallbackNutritionAdvice(userProfile) {
    const dailyCalories = this.calculateCalories(userProfile);
    const macros = this.getMacroSplit(userProfile.fitnessGoal);

    let advice = `Nutrition advice for your ${userProfile.fitnessGoal.replace('_', ' ')} goal:\n\n`;

    advice += `Daily calorie target: ${dailyCalories} calories\n`;
    advice += `Macro split: Protein ${macros.protein}%, Carbs ${macros.carbs}%, Fats ${macros.fats}%\n\n`;

    if (userProfile.fitnessGoal === 'weight_loss') {
      advice += `1. Eat at a calorie deficit of 300-500 calories below maintenance\n`;
      advice += `2. Focus on high-protein foods to preserve muscle mass\n`;
      advice += `3. Include plenty of vegetables for fiber and nutrients\n`;
      advice += `4. Drink water before meals to help with satiety\n`;
      advice += `5. Avoid sugary drinks and processed snacks\n`;
    } else if (userProfile.fitnessGoal === 'muscle_gain') {
      advice += `1. Eat at a calorie surplus of 300-500 calories above maintenance\n`;
      advice += `2. Consume 1.6-2.2g of protein per kg of body weight\n`;
      advice += `3. Time protein intake around workouts for optimal muscle synthesis\n`;
      advice += `4. Include complex carbs for sustained energy\n`;
      advice += `5. Stay hydrated and get adequate sleep for recovery\n`;
    } else {
      advice += `1. Maintain your current calorie intake for weight maintenance\n`;
      advice += `2. Focus on balanced meals with all three macronutrients\n`;
      advice += `3. Include a variety of colorful fruits and vegetables\n`;
      advice += `4. Stay hydrated throughout the day\n`;
      advice += `5. Practice mindful eating and listen to your body's hunger cues\n`;
    }

    return advice;
  }

  generateFallbackMealPlan(userProfile, days) {
    const dailyCalories = this.calculateCalories(userProfile);
    const macros = this.getMacroSplit(userProfile.fitnessGoal);

    const mealPlan = {
      totalDays: days,
      dailyCalorieTarget: dailyCalories,
      macroSplit: macros,
      days: [],
    };

    for (let i = 1; i <= days; i++) {
      mealPlan.days.push({
        day: i,
        meals: [
          {
            meal: 'Breakfast',
            description: 'Scrambled eggs with whole wheat toast and vegetables',
            calories: Math.round(dailyCalories * 0.25),
            protein: Math.round(
              (dailyCalories * 0.25 * macros.protein) / 100 / 4
            ),
            carbs: Math.round((dailyCalories * 0.25 * macros.carbs) / 100 / 4),
            fats: Math.round((dailyCalories * 0.25 * macros.fats) / 100 / 9),
          },
          {
            meal: 'Lunch',
            description: 'Grilled chicken with quinoa and mixed salad',
            calories: Math.round(dailyCalories * 0.35),
            protein: Math.round(
              (dailyCalories * 0.35 * macros.protein) / 100 / 4
            ),
            carbs: Math.round((dailyCalories * 0.35 * macros.carbs) / 100 / 4),
            fats: Math.round((dailyCalories * 0.35 * macros.fats) / 100 / 9),
          },
          {
            meal: 'Dinner',
            description: 'Baked salmon with sweet potato and steamed broccoli',
            calories: Math.round(dailyCalories * 0.3),
            protein: Math.round(
              (dailyCalories * 0.3 * macros.protein) / 100 / 4
            ),
            carbs: Math.round((dailyCalories * 0.3 * macros.carbs) / 100 / 4),
            fats: Math.round((dailyCalories * 0.3 * macros.fats) / 100 / 9),
          },
        ],
      });
    }

    return mealPlan;
  }

  generateFallbackMealAnalysis(mealDescription) {
    return {
      mealName: mealDescription.substring(0, 50),
      totalCalories: 600,
      protein: 35,
      carbs: 45,
      fats: 20,
      fiber: 8,
      foods: [
        {
          name: 'Estimated components',
          portion: 'Typical serving',
          calories: 600,
        },
      ],
      healthScore: 7,
      suggestions:
        'This appears to be a balanced meal. Consider adding more vegetables for fiber.',
    };
  }

  calculateCalories(userProfile) {
    let bmr;
    if (userProfile.gender === 'male') {
      bmr =
        10 * userProfile.weight +
        6.25 * userProfile.height -
        5 * userProfile.age +
        5;
    } else {
      bmr =
        10 * userProfile.weight +
        6.25 * userProfile.height -
        5 * userProfile.age -
        161;
    }

    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };

    const tdee = bmr * (multipliers[userProfile.activityLevel] || 1.2);
    let target = tdee;

    if (userProfile.fitnessGoal === 'weight_loss') target -= 500;
    else if (userProfile.fitnessGoal === 'muscle_gain') target += 300;

    return Math.round(target);
  }

  getMacroSplit(fitnessGoal) {
    const splits = {
      weight_loss: { protein: 40, carbs: 30, fats: 30 },
      muscle_gain: { protein: 30, carbs: 50, fats: 20 },
      maintenance: { protein: 30, carbs: 40, fats: 30 },
    };
    return splits[fitnessGoal] || splits.maintenance;
  }

  calculateMacroGrams(totalCalories, macroSplit) {
    return {
      protein: Math.round((totalCalories * macroSplit.protein) / 100 / 4),
      carbs: Math.round((totalCalories * macroSplit.carbs) / 100 / 4),
      fats: Math.round((totalCalories * macroSplit.fats) / 100 / 9),
    };
  }
}

module.exports = new AINutritionService();
