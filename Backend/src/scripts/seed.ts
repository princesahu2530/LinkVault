import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Topic } from '../models/Topic.js';
import { Link } from '../models/Link.js';
import { Tag } from '../models/Tag.js';
import { UserSettings } from '../models/UserSettings.js';
import { hashPassword } from '../utils/password.js';
import { logger } from '../utils/logger.js';

async function seed() {
  try {
    await connectDatabase();
    logger.info('🌱 Starting database seeding...');

    const demoEmail = 'demo@linkvault.app';
    await User.deleteOne({ email: demoEmail });

    const passwordHash = await hashPassword('password123');
    const demoUser = await User.create({
      name: 'Demo Explorer',
      email: demoEmail,
      passwordHash,
      isEmailVerified: true,
      isActive: true,
      lastLoginAt: new Date()
    });

    await UserSettings.create({
      userId: demoUser._id,
      theme: 'dark',
      compactMode: false,
      defaultTopicState: 'remember',
      showDescriptions: true,
      showUrls: true,
      appName: 'LinkVault'
    });

    const topicAi = await Topic.create({
      userId: demoUser._id,
      name: 'AI & Machine Learning',
      description: 'Generative AI models, prompt engineering, and research tools',
      icon: 'Bot',
      color: '#6366f1',
      isPinned: true,
      isFavorite: true,
      position: 0
    });

    const topicDev = await Topic.create({
      userId: demoUser._id,
      name: 'Developer Resources',
      description: 'Documentation, cloud databases, frameworks and libraries',
      icon: 'Code',
      color: '#10b981',
      isPinned: true,
      isFavorite: true,
      position: 1
    });

    const topicDesign = await Topic.create({
      userId: demoUser._id,
      name: 'Design & UI/UX',
      description: 'Inspiration boards, icon sets, color palettes and typography references',
      icon: 'Palette',
      color: '#d946ef',
      position: 2
    });

    await Link.create([
      {
        userId: demoUser._id,
        topicId: topicAi._id,
        title: 'ChatGPT',
        url: 'https://chatgpt.com',
        description: 'Leading conversational AI model by OpenAI with GPT-4o capabilities',
        notes: 'Use GPT-4o for complex reasoning and multimodal analysis.',
        tags: ['AI', 'LLM', 'OpenAI'],
        isFavorite: true,
        position: 0
      },
      {
        userId: demoUser._id,
        topicId: topicAi._id,
        title: 'Claude AI',
        url: 'https://claude.ai',
        description: 'Anthropic’s frontier AI assistant with 200k context window and Artifacts workspace',
        notes: 'Artifacts feature is great for interactive code generation.',
        tags: ['AI', 'Anthropic', 'Research'],
        isFavorite: true,
        position: 1
      },
      {
        userId: demoUser._id,
        topicId: topicDev._id,
        title: 'React Documentation',
        url: 'https://react.dev',
        description: 'Official interactive documentation for modern React with Server Components',
        notes: 'Hooks reference covers useActionState, useOptimistic, useId in depth.',
        tags: ['React', 'Frontend', 'JavaScript'],
        isFavorite: true,
        position: 0
      },
      {
        userId: demoUser._id,
        topicId: topicDev._id,
        title: 'Tailwind CSS Docs',
        url: 'https://tailwindcss.com/docs',
        description: 'Utility-first CSS framework for rapid UI development',
        notes: 'Check CSS variable theming and container queries documentation.',
        tags: ['CSS', 'Tailwind', 'Design'],
        isFavorite: false,
        position: 1
      },
      {
        userId: demoUser._id,
        topicId: topicDesign._id,
        title: 'Figma',
        url: 'https://www.figma.com',
        description: 'Industry standard collaborative interface design tool',
        notes: 'Utilize Auto Layout v5 and tokens matching Tailwind classes.',
        tags: ['Design', 'UI/UX', 'Prototyping'],
        isFavorite: true,
        position: 0
      }
    ]);

    await Tag.create([
      { userId: demoUser._id, name: 'AI', normalizedName: 'ai' },
      { userId: demoUser._id, name: 'Frontend', normalizedName: 'frontend' },
      { userId: demoUser._id, name: 'Design', normalizedName: 'design' }
    ]);

    logger.info('🎉 Seed completed successfully!');
    logger.info(`🔑 Demo Login: ${demoEmail} / password123`);

    await disconnectDatabase();
  } catch (err) {
    logger.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
