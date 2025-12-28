const userService = require('../../src/services/userService');
const { User, UserProfile, UserPreferences } = require('../../src/models');

jest.mock('../../src/models');

describe('UserService', () => {
  describe('getUserProfile', () => {
    it('should return user profile with associations', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        profile: { firstName: 'John' },
        preferences: { theme: 'dark' }
      };

      User.findByPk.mockResolvedValue(mockUser);

      const result = await userService.getUserProfile(1);
      
      expect(result).toEqual(mockUser);
      expect(User.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    });
  });
});