export type WorkspaceRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

export type WorkspaceMemberStatus = 'active' | 'pending' | 'suspended';

export type Permission =
  | 'workspace.view'
  | 'workspace.edit'
  | 'workspace.delete'
  | 'members.view'
  | 'members.invite'
  | 'members.edit'
  | 'members.remove'
  | 'topics.view'
  | 'topics.create'
  | 'topics.edit'
  | 'topics.delete'
  | 'items.view'
  | 'items.create'
  | 'items.edit'
  | 'items.delete'
  | 'items.archive'
  | 'items.restore'
  | 'items.move'
  | 'items.duplicate'
  | 'templates.view'
  | 'templates.create'
  | 'templates.edit'
  | 'templates.delete'
  | 'tags.manage'
  | 'imports.create'
  | 'exports.create'
  | 'settings.view'
  | 'settings.edit';

export const ALL_PERMISSIONS: Permission[] = [
  'workspace.view',
  'workspace.edit',
  'workspace.delete',
  'members.view',
  'members.invite',
  'members.edit',
  'members.remove',
  'topics.view',
  'topics.create',
  'topics.edit',
  'topics.delete',
  'items.view',
  'items.create',
  'items.edit',
  'items.delete',
  'items.archive',
  'items.restore',
  'items.move',
  'items.duplicate',
  'templates.view',
  'templates.create',
  'templates.edit',
  'templates.delete',
  'tags.manage',
  'imports.create',
  'exports.create',
  'settings.view',
  'settings.edit'
];

export const DEFAULT_ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  owner: [...ALL_PERMISSIONS],
  admin: ALL_PERMISSIONS.filter(p => p !== 'workspace.delete'),
  manager: [
    'workspace.view',
    'members.view',
    'topics.view',
    'topics.create',
    'topics.edit',
    'items.view',
    'items.create',
    'items.edit',
    'items.delete',
    'items.archive',
    'items.restore',
    'items.move',
    'items.duplicate',
    'templates.view',
    'templates.create',
    'templates.edit',
    'tags.manage',
    'exports.create',
    'settings.view'
  ],
  member: [
    'workspace.view',
    'members.view',
    'topics.view',
    'items.view',
    'items.create',
    'items.edit',
    'items.archive',
    'items.restore',
    'items.duplicate',
    'templates.view',
    'tags.manage',
    'exports.create',
    'settings.view'
  ],
  viewer: [
    'workspace.view',
    'members.view',
    'topics.view',
    'items.view',
    'templates.view',
    'settings.view'
  ]
};
