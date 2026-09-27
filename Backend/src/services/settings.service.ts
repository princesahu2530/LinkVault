import mongoose from 'mongoose';
import { UserSettings, IUserSettings } from '../models/UserSettings.js';

export class SettingsService {
  async getSettings(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    let settings = await UserSettings.findOne({ userId: userObjectId });

    if (!settings) {
      settings = await UserSettings.create({
        userId: userObjectId,
        theme: 'dark',
        compactMode: false,
        defaultTopicState: 'remember',
        showDescriptions: true,
        showUrls: true,
        appName: 'LinkVault'
      });
    }

    return settings;
  }

  async updateSettings(userId: string, updates: Partial<IUserSettings>) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    let settings = await UserSettings.findOne({ userId: userObjectId });

    if (!settings) {
      settings = new UserSettings({ userId: userObjectId });
    }

    if (updates.theme !== undefined) settings.theme = updates.theme;
    if (updates.compactMode !== undefined) settings.compactMode = updates.compactMode;
    if (updates.defaultTopicState !== undefined) settings.defaultTopicState = updates.defaultTopicState;
    if (updates.showDescriptions !== undefined) settings.showDescriptions = updates.showDescriptions;
    if (updates.showUrls !== undefined) settings.showUrls = updates.showUrls;
    if (updates.appName !== undefined) settings.appName = updates.appName;
    if (updates.keyboardShortcutsEnabled !== undefined) settings.keyboardShortcutsEnabled = updates.keyboardShortcutsEnabled;
    if (updates.enableFavicons !== undefined) settings.enableFavicons = updates.enableFavicons;

    await settings.save();
    return settings;
  }
}

export const settingsService = new SettingsService();
