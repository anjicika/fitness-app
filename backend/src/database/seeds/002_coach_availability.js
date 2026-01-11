const { Coach } = require('../../models');

async function seedCoaches() {
  try {
    // Update availability for existing coaches
    await Coach.update(
      { availability: JSON.stringify(['morning', 'afternoon', 'evening']) },
      { where: { id: 1 } }
    );
    
    await Coach.update(
      { availability: JSON.stringify(['morning', 'evening']) },
      { where: { id: 2 } }
    );
    
    await Coach.update(
      { availability: JSON.stringify(['afternoon', 'evening']) },
      { where: { id: 3 } }
    );

    console.log('✅ Coach availability seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding coach availability:', error);
  }
}

module.exports = { seedCoaches };
