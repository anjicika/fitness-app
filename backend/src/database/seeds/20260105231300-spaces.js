const { Space } = require('../../models');
const { sequelize } = require('../../models');

const spaces = [
  {
    name: 'Yoga Studio A',
    type: 'class_studio',
    capacity: 15,
    equipment: JSON.stringify(['yoga_mats', 'blocks', 'straps', 'bolsters']),
    hourly_rate: 20.0,
    is_active: true,
    amenities: JSON.stringify([
      'mirror_wall',
      'sound_system',
      'ac',
      'essential_oils',
    ]),
    description:
      'Peaceful yoga studio with natural lighting and calming atmosphere',
  },
  {
    name: 'Weight Room 1',
    type: 'open_area',
    capacity: 20,
    equipment: JSON.stringify([
      'dumbbells_5-50lb',
      'barbells',
      'bench_press',
      'squat_rack',
    ]),
    hourly_rate: 12.5,
    is_active: true,
    amenities: JSON.stringify(['mirrors', 'ac', 'water_fountain', 'tv_screen']),
    description: 'Fully equipped weight training area with premium equipment',
  },
  {
    name: 'Boxing Ring',
    type: 'boxing_ring',
    capacity: 5,
    equipment: JSON.stringify([
      'boxing_ring',
      'punching_bags',
      'gloves',
      'focus_mitts',
    ]),
    hourly_rate: 25.0,
    is_active: true,
    amenities: JSON.stringify(['mirrors', 'ac', 'timer']),
    description: 'Professional boxing ring for training and sparring',
  },
  {
    name: 'Cardio Zone 1',
    type: 'cardio_zone',
    capacity: 12,
    equipment: JSON.stringify([
      'treadmills',
      'ellipticals',
      'stationary_bikes',
      'rowers',
    ]),
    hourly_rate: 10.0,
    is_active: true,
    amenities: JSON.stringify(['tv_screens', 'ac', 'ventilation']),
    description:
      'Cardio area with panoramic views and individual entertainment systems',
  },
  {
    name: 'Private Room B',
    type: 'private_room',
    capacity: 4,
    equipment: JSON.stringify([
      'adjustable_bench',
      'dumbbell_set',
      'resistance_bands',
    ]),
    hourly_rate: 30.0,
    is_active: true,
    amenities: JSON.stringify([
      'mirror_wall',
      'ac',
      'privacy_curtain',
      'sound_system',
    ]),
    description: 'Private training room for personal sessions',
  },
  {
    name: 'Spin Studio',
    type: 'class_studio',
    capacity: 25,
    equipment: JSON.stringify(['spin_bikes', 'weights', 'towels']),
    hourly_rate: 18.0,
    is_active: false,
    amenities: JSON.stringify(['led_lights', 'sound_system', 'ac']),
    description:
      'High-energy spin studio with immersive lighting (Temporarily closed)',
  },
  {
    name: 'CrossFit Box',
    type: 'open_area',
    capacity: 30,
    equipment: JSON.stringify([
      'kettlebells',
      'battle_ropes',
      'pull_up_bars',
      'medicine_balls',
    ]),
    hourly_rate: 22.0,
    is_active: true,
    amenities: JSON.stringify([
      'sound_system',
      'ac',
      'chalk_bowls',
      'whiteboard',
    ]),
    description: 'Large open space for CrossFit and functional training',
  },
  {
    name: 'Pilates Studio',
    type: 'class_studio',
    capacity: 10,
    equipment: JSON.stringify(['reformers', 'cadillacs', 'chairs', 'barrels']),
    hourly_rate: 28.0,
    is_active: true,
    amenities: JSON.stringify(['mirrors', 'ac', 'calming_music']),
    description: 'Fully equipped Pilates studio with professional reformers',
  },
  {
    name: 'Basketball Court',
    type: 'open_area',
    capacity: 40,
    equipment: JSON.stringify(['basketball_hoops', 'balls', 'scoreboard']),
    hourly_rate: 35.0,
    is_active: true,
    amenities: JSON.stringify(['bleachers', 'ac', 'water_fountains']),
    description: 'Full-sized basketball court for games and training',
  },
  {
    name: 'Sauna Suite',
    type: 'private_room',
    capacity: 6,
    equipment: JSON.stringify([
      'sauna_bench',
      'temperature_control',
      'aromatherapy',
    ]),
    hourly_rate: 15.0,
    is_active: true,
    amenities: JSON.stringify(['shower', 'towels', 'relaxation_area']),
    description: 'Private sauna suite for post-workout recovery',
  },
];

const seedSpaces = async () => {
  try {
    await sequelize.authenticate();

    await Space.sync({ alter: true });

    console.log('🌱 Seeding gym spaces...');

    for (const space of spaces) {
      await Space.findOrCreate({
        where: { name: space.name },
        defaults: space,
      });
    }

    console.log('✅ Gym spaces seeded successfully');
    console.log(`📊 Total spaces created/updated: ${spaces.length}`);
  } catch (error) {
    console.error('❌ Error seeding spaces:', error);
  }
};

seedSpaces();
