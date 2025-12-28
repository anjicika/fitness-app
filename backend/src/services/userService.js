const { User, UserProfile, UserPreferences } = require('../models');

class UserService {
  async getUserProfile(userId) {
    return await User.findByPk(userId, {
      include: [
        { model: UserProfile, as: 'profile' },
        { model: UserPreferences, as: 'preferences' }
      ],
      attributes: { exclude: ['password', 'emailVerificationToken'] }
    });
  }

  async updateUserProfile(userId, profileData) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const [profile] = await UserProfile.findOrCreate({
      where: { userId },
      defaults: profileData
    });

    if (!profile.isNewRecord) {
      await profile.update(profileData);
    }

    return await this.getUserProfile(userId);
  }

  async updateUserPreferences(userId, preferencesData) {
    const [preferences] = await UserPreferences.findOrCreate({
      where: { userId },
      defaults: preferencesData
    });

    if (!preferences.isNewRecord) {
      await preferences.update(preferencesData);
    }

    return preferences;
  }

  async uploadProfilePhoto(userId, photoUrl) {
    const [profile] = await UserProfile.findOrCreate({
      where: { userId },
      defaults: { profilePhoto: photoUrl }
    });

    if (!profile.isNewRecord) {
      await profile.update({ profilePhoto: photoUrl });
    }

    return profile;
  }

  async deleteUserAccount(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // Soft delete
    await user.update({ isActive: false });
    return true;
  }

  async getUserById(userId, requestingUserId) {
    const user = await User.findByPk(userId, {
      include: [
        { 
          model: UserProfile, 
          as: 'profile',
          attributes: ['firstName', 'lastName', 'profilePhoto', 'bio', 'location']
        }
      ],
      attributes: ['id', 'username', 'role', 'createdAt']
    });

    if (!user) throw new Error('User not found');

    // RBAC: Ако корисник гледа свој профил, врати више детаља
    if (userId === requestingUserId) {
      return await this.getUserProfile(userId);
    }

    return user;
  }
}

module.exports = new UserService();