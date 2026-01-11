const { Coach } = require('./models');

async function updateAvailability() {
  try {
    await Coach.update(
      { availability: '["morning", "afternoon", "evening"]' },
      { where: { id: 1 } }
    );

    await Coach.update(
      { availability: '["morning", "evening"]' },
      { where: { id: 2 } }
    );

    await Coach.update(
      { availability: '["afternoon", "evening"]' },
      { where: { id: 3 } }
    );

    console.log('✅ Availability updated successfully');
  } catch (error) {
    console.error('❌ Error updating availability:', error);
  }
}

updateAvailability();
