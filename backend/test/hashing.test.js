const { hashPassword, comparePassword } = require('../src/utils/hashing');

describe('Password hashing', () => {
  const plainPassword = 'Password123';

  it('Should hash password correctly', async () => {
    const hash = await hashPassword(plainPassword);
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(plainPassword);
  });

  it('Should validate correct password', async () => {
    const hash = await hashPassword(plainPassword);
    const match = await comparePassword(plainPassword, hash);
    expect(match).toBe(true);
  });

  it('Should reject incorrect password', async () => {
    const hash = await hashPassword(plainPassword);
    const match = await comparePassword('WrongPass123', hash);
    expect(match).toBe(false);
  });
});
