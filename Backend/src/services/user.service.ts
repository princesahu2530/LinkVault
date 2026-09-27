import { User } from '../models/User.js';
import { Topic } from '../models/Topic.js';
import { Link } from '../models/Link.js';
import { Tag } from '../models/Tag.js';
import { UserSettings } from '../models/UserSettings.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { NotFoundError } from '../utils/errors.js';

export class UserService {
  async getProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    if (data.name !== undefined) user.name = data.name.trim();
    if (data.avatar !== undefined) user.avatar = data.avatar.trim();

    await user.save();
    return user;
  }

  async deleteAccount(userId: string) {
    // Cascade delete all user-owned data
    await Topic.deleteMany({ userId });
    await Link.deleteMany({ userId });
    await Tag.deleteMany({ userId });
    await UserSettings.deleteMany({ userId });
    await RefreshToken.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    return { success: true };
  }
}

export const userService = new UserService();
