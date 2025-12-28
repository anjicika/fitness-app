const { ForumCategory } = require('../../models');

const categories = [
  {
    name: 'General Discussion',
    slug: 'general',
    description: 'General fitness and health discussions',
    color: '#3B82F6',
    icon: '💬',
  },
  {
    name: 'Workout Tips',
    slug: 'workout-tips',
    description: 'Share and discuss workout routines',
    color: '#10B981',
    icon: '💪',
  },
  {
    name: 'Nutrition',
    slug: 'nutrition',
    description: 'Nutrition advice and meal planning',
    color: '#F59E0B',
    icon: '🥗',
  },
  {
    name: 'Success Stories',
    slug: 'success-stories',
    description: 'Share your fitness journey and achievements',
    color: '#8B5CF6',
    icon: '🏆',
  },
  {
    name: 'Questions & Answers',
    slug: 'q-and-a',
    description: 'Ask and answer fitness-related questions',
    color: '#EF4444',
    icon: '❓',
  },
  {
    name: 'Equipment Reviews',
    slug: 'equipment',
    description: 'Reviews and recommendations for fitness equipment',
    color: '#06B6D4',
    icon: '🏋️',
  },
];

const seedCategories = async () => {
  try {
    console.log('🌱 Seeding forum categories...');

    for (const category of categories) {
      await ForumCategory.findOrCreate({
        where: { slug: category.slug },
        defaults: category,
      });
    }

    console.log('✅ Forum categories seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  }
};

module.exports = seedCategories;
