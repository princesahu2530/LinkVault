import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { Topic } from '../models/Topic.js';
import { Link } from '../models/Link.js';
import { Item } from '../models/Item.js';
import { Template } from '../models/Template.js';
import { Tag } from '../models/Tag.js';
import { UserSettings } from '../models/UserSettings.js';
import { generateFieldId } from '../services/item.service.js';

async function runMigration() {
  console.log('🚀 Starting LinkVault Multi-Tenancy & Workspace Migration...');

  try {
    await connectDatabase();

    const users = await User.find();
    console.log(`📊 Found ${users.length} users to check/migrate.`);

    let migratedUsers = 0;
    let migratedTopics = 0;
    let migratedItems = 0;

    for (const user of users) {
      // 1. Ensure personal workspace exists
      let personalWorkspace = await Workspace.findOne({ ownerId: user._id, isPersonal: true });
      if (!personalWorkspace) {
        personalWorkspace = await Workspace.create({
          name: `${user.name}'s Personal Vault`,
          description: 'Default personal workspace',
          icon: 'Folder',
          color: '#6366f1',
          ownerId: user._id,
          isPersonal: true,
          category: 'personal',
          settings: {
            defaultView: 'cards',
            allowMemberInvites: true,
            enableActivityTimeline: true,
            enableComments: true,
            enableTaskManagement: true,
            enableRelations: true
          }
        });
        migratedUsers++;
      }

      // 2. Ensure owner membership exists
      let membership = await WorkspaceMember.findOne({ workspaceId: personalWorkspace._id, userId: user._id });
      if (!membership) {
        await WorkspaceMember.create({
          workspaceId: personalWorkspace._id,
          userId: user._id,
          role: 'owner',
          status: 'active',
          joinedAt: new Date()
        });
      }

      // 3. Migrate Topics to this personal workspace
      const topicUpdateRes = await Topic.updateMany(
        { userId: user._id, $or: [{ workspaceId: null }, { workspaceId: { $exists: false } }] },
        { $set: { workspaceId: personalWorkspace._id, visibility: 'workspace' } }
      );
      migratedTopics += topicUpdateRes.modifiedCount;

      // 4. Migrate Items to this personal workspace
      const itemUpdateRes = await Item.updateMany(
        { userId: user._id, $or: [{ workspaceId: null }, { workspaceId: { $exists: false } }] },
        { $set: { workspaceId: personalWorkspace._id, visibility: 'workspace', versionNumber: 1 } }
      );
      migratedItems += itemUpdateRes.modifiedCount;

      // 5. Migrate Templates and Tags
      await Template.updateMany(
        { userId: user._id, $or: [{ workspaceId: null }, { workspaceId: { $exists: false } }] },
        { $set: { workspaceId: personalWorkspace._id } }
      );
      await Tag.updateMany(
        { userId: user._id, $or: [{ workspaceId: null }, { workspaceId: { $exists: false } }] },
        { $set: { workspaceId: personalWorkspace._id } }
      );

      // 6. Update UserSettings
      await UserSettings.updateOne(
        { userId: user._id },
        { $set: { activeWorkspaceId: personalWorkspace._id } },
        { upsert: true }
      );
    }

    // 7. Migrate any remaining legacy Links to Items
    const links = await Link.find().lean();
    let migratedLinksCount = 0;

    for (const link of links) {
      const existingItem = await Item.findById(link._id);
      if (existingItem) continue;

      const topic = await Topic.findById(link.topicId);
      const wsId = topic?.workspaceId;

      const fields: any[] = [
        {
          fieldId: generateFieldId(),
          name: 'URL',
          type: 'url',
          value: link.url,
          options: [],
          position: 0,
          required: false,
          visible: true
        }
      ];

      if (link.description && link.description.trim()) {
        fields.push({
          fieldId: generateFieldId(),
          name: 'Description',
          type: 'longText',
          value: link.description.trim(),
          options: [],
          position: 1,
          required: false,
          visible: true
        });
      }

      await Item.create({
        _id: link._id,
        userId: link.userId,
        workspaceId: wsId,
        topicId: link.topicId,
        title: link.title || '',
        content: link.notes || '',
        fields,
        tags: link.tags || [],
        isFavorite: Boolean(link.isFavorite),
        isArchived: Boolean(link.isArchived),
        position: link.position || 0,
        deletedAt: link.deletedAt || null,
        createdAt: link.createdAt || new Date(),
        updatedAt: link.updatedAt || new Date()
      });

      migratedLinksCount++;
    }

    console.log('\n=========================================');
    console.log('✅ Workspace Migration Completed Successfully!');
    console.log('=========================================');
    console.log(`   - Personal Workspaces Initialized: ${migratedUsers}`);
    console.log(`   - Topics Associated with Workspace: ${migratedTopics}`);
    console.log(`   - Items Associated with Workspace: ${migratedItems}`);
    console.log(`   - Legacy Links Converted to Items: ${migratedLinksCount}`);
    console.log('=========================================\n');

    await disconnectDatabase();
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Migration error:', err);
    await disconnectDatabase();
    process.exit(1);
  }
}

runMigration();
