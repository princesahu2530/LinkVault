import mongoose from 'mongoose';
import { Comment, IComment } from '../models/Comment.js';
import { Item } from '../models/Item.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { Activity } from '../models/Activity.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export class CommentService {
  async getCommentsForItem(workspaceId: string, itemId: string) {
    return Comment.find({ workspaceId, itemId, deletedAt: null }).sort({ createdAt: 1 });
  }

  async addComment(
    workspaceId: string,
    itemId: string,
    authorId: string,
    content: string
  ) {
    const item = await Item.findOne({ _id: itemId, workspaceId, deletedAt: null });
    if (!item) throw new NotFoundError('Item not found');

    const author = await User.findById(authorId);
    if (!author) throw new NotFoundError('User not found');

    // Extract mentions (@Username or @email)
    const mentionMatches = content.match(/@([\w.-]+)/g) || [];
    const mentionedUsernames = mentionMatches.map(m => m.slice(1).toLowerCase());

    const mentionedUsers = mentionedUsernames.length > 0
      ? await User.find({
          $or: [
            { name: { $in: mentionedUsernames.map(u => new RegExp(`^${u}$`, 'i')) } },
            { email: { $in: mentionedUsernames.map(u => new RegExp(`^${u}`, 'i')) } }
          ]
        })
      : [];

    const mentionIds = mentionedUsers.map(u => u._id.toString());

    const comment = await Comment.create({
      workspaceId,
      itemId: item._id,
      authorId: author._id,
      authorName: author.name,
      authorAvatar: author.avatar || '',
      content: content.trim(),
      mentions: mentionIds
    });

    // Create notifications for mentioned users
    for (const u of mentionedUsers) {
      if (u._id.toString() !== authorId) {
        await Notification.create({
          workspaceId,
          recipientId: u._id,
          senderId: author._id,
          senderName: author.name,
          type: 'mention',
          title: 'Mentioned in a comment',
          message: `${author.name} mentioned you on "${item.title || 'Untitled Item'}": "${content.slice(0, 100)}"`,
          resourceType: 'item',
          resourceId: item._id.toString()
        });
      }
    }

    // If author is not item owner, notify item owner
    if (item.userId.toString() !== authorId && !mentionIds.includes(item.userId.toString())) {
      await Notification.create({
        workspaceId,
        recipientId: item.userId,
        senderId: author._id,
        senderName: author.name,
        type: 'comment',
        title: 'New comment on your item',
        message: `${author.name} commented on "${item.title || 'Untitled Item'}": "${content.slice(0, 100)}"`,
        resourceType: 'item',
        resourceId: item._id.toString()
      });
    }

    // Timeline activity
    await Activity.create({
      workspaceId,
      actorId: author._id,
      actorName: author.name,
      action: 'commented',
      resourceType: 'item',
      resourceId: item._id.toString(),
      resourceTitle: item.title || 'Untitled',
      description: `Commented: "${content.slice(0, 80)}"`
    });

    return comment;
  }

  async deleteComment(workspaceId: string, commentId: string, userId: string, role: string) {
    const comment = await Comment.findOne({ _id: commentId, workspaceId });
    if (!comment) throw new NotFoundError('Comment not found');

    if (comment.authorId.toString() !== userId && role !== 'owner' && role !== 'admin') {
      throw new ForbiddenError('Cannot delete someone else\'s comment');
    }

    comment.deletedAt = new Date();
    await comment.save();

    return { success: true };
  }
}

export const commentService = new CommentService();
