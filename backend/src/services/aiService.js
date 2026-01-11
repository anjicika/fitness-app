const { GoogleGenerativeAI } = require('@google/generative-ai');
const nutritionService = require('./aiNutritionService'); 

let genAI = null;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

class AITrainerService {
    getModel() {
        if (!genAI) throw new Error('Gemini API key not configured');
        return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    async generatePersonalizedPlan(userProfile, recentMetrics) {
        const model = this.getModel();
        
        const calories = nutritionService.calculateCalories(userProfile);
        
        const prompt = `
            Ti si profesionalni fitnes trener. Ustvari načrt treninga za uporabnika:
            Cilj: ${userProfile.fitnessGoal}
            Zadnja teža: ${recentMetrics.weight}kg
            Dnevni kalorijski cilj: ${calories} kcal.
            
            Vrni načrt v obliki JSON:
            {
                "planName": "Ime načrta",
                "exercises": [
                    { "name": "Vaja", "sets": 3, "reps": "10-12", "notes": "Nasvet" }
                ]
            }
        `;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text().trim());
    }
}

module.exports = new AITrainerService();
