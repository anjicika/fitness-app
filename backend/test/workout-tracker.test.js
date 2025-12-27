const request = require('supertest');
const { Sequelize, DataTypes } = require('sequelize');
const express = require('express');
const workoutModel = require('../src/models/workout');
const exerciseModel = require('../src/models/exercise');
const progressModel = require('../src/models/progress');

let sequelize;
let Workout, Exercise, Progress;
let app;

beforeAll(async () => {
  sequelize = new Sequelize('sqlite::memory:', { logging: false });
  Workout = workoutModel(sequelize, DataTypes);
  Exercise = exerciseModel(sequelize, DataTypes);
  Progress = progressModel(sequelize, DataTypes);
  await sequelize.sync();

  app = express();
  app.use(express.json());
  app.use('/api/v1/workouts', require('../src/routes/workouts'));
  app.use('/api/v1/exercises', require('../src/routes/exercises'));
  app.use('/api/v1/progress', require('../src/routes/progress'));
});

afterAll(async () => {
  if (sequelize) await sequelize.close();
});

describe('Workout Tracker API', () => {
  beforeEach(async () => {
    await Workout.destroy({ where: {} });
    await Exercise.destroy({ where: {} });
    await Progress.destroy({ where: {} });
  });

  describe('Workouts', () => {
    it('should create and get workouts', async () => {
      const res = await request(app)
        .post('/api/v1/workouts')
        .send({ type: 'Running', duration: 30, caloriesBurned: 300, date: '2025-12-20T00:00:00.000Z' });
      expect(res.status).toBe(201);

      const getRes = await request(app).get('/api/v1/workouts');
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.length).toBe(1);
    });
  });

  describe('Exercises', () => {
    it('should create and get exercises', async () => {
      const res = await request(app)
        .post('/api/v1/exercises')
        .send({ name: 'Push-up', description: 'Upper body', category: 'Strength', muscleGroups: ['chest'] });
      expect(res.status).toBe(201);

      const getRes = await request(app).get('/api/v1/exercises');
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.length).toBe(1);
    });
  });

  describe('Progress', () => {
    it('should create and get progress', async () => {
      const res = await request(app)
        .post('/api/v1/progress')
        .send({ date: '2025-12-20T00:00:00.000Z', weight: 70.5, notes: 'Test' });
      expect(res.status).toBe(201);

      const getRes = await request(app).get('/api/v1/progress');
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.length).toBe(1);
    });
  });
});