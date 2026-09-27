import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { Topic } from '../models/Topic.js';
import { Item } from '../models/Item.js';
import { Template } from '../models/Template.js';
import { Comment } from '../models/Comment.js';
import { SavedView } from '../models/SavedView.js';
import { AuditLog } from '../models/AuditLog.js';
import { UserSettings } from '../models/UserSettings.js';
import { hashPassword } from '../utils/password.js';
import { logger } from '../utils/logger.js';

export async function seedPGPlatform() {
  try {
    await connectDatabase();
    logger.info('🚀 Starting PG Platform Dataset Seeding...');

    const primaryEmail = 'pgsaathi0489@gmail.com';
    const primaryPassword = 'Aa@123456';
    const passwordHash = await hashPassword(primaryPassword);

    // 1. Create or Update Primary User (Amit Sharma - Project Manager)
    let pmUser = await User.findOne({ email: primaryEmail });
    if (pmUser) {
      pmUser.name = 'Amit Sharma';
      pmUser.passwordHash = passwordHash;
      pmUser.isEmailVerified = true;
      pmUser.isActive = true;
      await pmUser.save();
    } else {
      pmUser = await User.create({
        name: 'Amit Sharma',
        email: primaryEmail,
        passwordHash,
        isEmailVerified: true,
        isActive: true,
        lastLoginAt: new Date()
      });
    }

    await UserSettings.findOneAndUpdate(
      { userId: pmUser._id },
      {
        userId: pmUser._id,
        theme: 'dark',
        compactMode: false,
        defaultTopicState: 'remember',
        showDescriptions: true,
        showUrls: true,
        appName: 'LinkVault'
      },
      { upsert: true }
    );

    // 2. Team Member Users
    const teamMembersData = [
      { name: 'Neha Verma', email: 'neha.verma@pgplatform.example', role: 'manager', title: 'Product Manager', dept: 'Product' },
      { name: 'Priya Singh', email: 'priya.singh@pgplatform.example', role: 'admin', title: 'HR Manager', dept: 'HR & Talent' },
      { name: 'Rahul Mehta', email: 'rahul.mehta@pgplatform.example', role: 'manager', title: 'Team Lead', dept: 'Engineering' },
      { name: 'Arjun Kapoor', email: 'arjun.kapoor@pgplatform.example', role: 'member', title: 'Senior Developer', dept: 'Engineering' },
      { name: 'Rohit Kumar', email: 'rohit.kumar@pgplatform.example', role: 'member', title: 'Junior Developer', dept: 'Engineering' },
      { name: 'Sneha Gupta', email: 'sneha.gupta@pgplatform.example', role: 'member', title: 'Junior Developer', dept: 'Engineering' },
      { name: 'Anjali Jain', email: 'anjali.jain@pgplatform.example', role: 'member', title: 'UI/UX Designer', dept: 'Design' },
      { name: 'Vikash Yadav', email: 'vikash.yadav@pgplatform.example', role: 'member', title: 'QA Engineer', dept: 'QA' },
      { name: 'Karan Malhotra', email: 'karan.malhotra@pgplatform.example', role: 'member', title: 'DevOps Engineer', dept: 'DevOps & Infra' },
      { name: 'Suresh Patel', email: 'suresh.patel@pgtechnologies.example', role: 'viewer', title: 'Client Representative', dept: 'Client Stakeholder' }
    ];

    const createdUsers: Record<string, any> = { 'Amit Sharma': pmUser };

    for (const m of teamMembersData) {
      let u = await User.findOne({ email: m.email });
      if (!u) {
        u = await User.create({
          name: m.name,
          email: m.email,
          passwordHash,
          isEmailVerified: true,
          isActive: true
        });
      }
      createdUsers[m.name] = u;
    }

    // 3. Create or Reset the PG Platform Workspace
    let workspace = await Workspace.findOne({ name: 'PG Platform – Client Project', ownerId: pmUser._id });
    if (!workspace) {
      workspace = await Workspace.create({
        ownerId: pmUser._id,
        name: 'PG Platform – Client Project',
        description: 'PG Platform is a SaaS-based property and tenant management platform being developed for managing PG properties, rooms, beds, tenants, payments, complaints, staff and operational activities.',
        icon: 'Briefcase',
        color: '#6366f1',
        isPersonal: false,
        category: 'client_project'
      });
    } else {
      // Clear existing records for clean idempotent seeding
      await Promise.all([
        Topic.deleteMany({ workspaceId: workspace._id }),
        Item.deleteMany({ workspaceId: workspace._id }),
        Template.deleteMany({ workspaceId: workspace._id }),
        WorkspaceMember.deleteMany({ workspaceId: workspace._id }),
        SavedView.deleteMany({ workspaceId: workspace._id })
      ]);
    }

    // 4. Create Workspace Members
    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: pmUser._id,
      role: 'owner',
      title: 'Project Manager',
      department: 'Project Management',
      status: 'active'
    });

    for (const m of teamMembersData) {
      const u = createdUsers[m.name];
      await WorkspaceMember.create({
        workspaceId: workspace._id,
        userId: u._id,
        role: m.role as any,
        title: m.title,
        department: m.dept,
        status: 'active',
        invitedBy: pmUser._id
      });
    }

    // 5. Templates for PG Platform
    const templatesData = [
      {
        name: 'Project Template',
        category: 'pm',
        description: 'Master metadata, client info, timelines, budget, and repositories',
        icon: 'Briefcase',
        color: '#6366f1',
        fields: [
          { name: 'Project Name', type: 'text', required: true, position: 0 },
          { name: 'Client', type: 'text', required: true, position: 1 },
          { name: 'Project Manager', type: 'user', position: 2 },
          { name: 'Product Manager', type: 'user', position: 3 },
          { name: 'Team Lead', type: 'user', position: 4 },
          { name: 'Project Type', type: 'select', options: ['SaaS', 'Mobile App', 'Enterprise Web'], position: 5 },
          { name: 'Status', type: 'select', options: ['In Progress', 'Testing', 'Launched', 'On Hold'], position: 6 },
          { name: 'Priority', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], position: 7 },
          { name: 'Start Date', type: 'date', position: 8 },
          { name: 'Target Launch', type: 'date', position: 9 },
          { name: 'Budget', type: 'currency', currencyCode: 'INR', position: 10 },
          { name: 'Team Size', type: 'number', position: 11 },
          { name: 'Client Website', type: 'url', position: 12 },
          { name: 'Repository', type: 'url', position: 13 },
          { name: 'Documentation', type: 'url', position: 14 }
        ]
      },
      {
        name: 'Requirement Template',
        category: 'pm',
        description: 'Feature specifications, SRS and acceptance criteria',
        icon: 'CheckSquare',
        color: '#06b6d4',
        fields: [
          { name: 'Requirement ID', type: 'text', required: true, position: 0 },
          { name: 'Requirement Type', type: 'select', options: ['Feature', 'Enhancement', 'Security', 'Performance'], position: 1 },
          { name: 'Requested By', type: 'text', position: 2 },
          { name: 'Priority', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], position: 3 },
          { name: 'Status', type: 'select', options: ['Draft', 'Under Review', 'Approved', 'In Progress', 'Done'], position: 4 },
          { name: 'Module', type: 'select', options: ['Dashboard', 'Tenant Management', 'Property Management', 'Room Management', 'Rent Management', 'Complaints', 'Reports'], position: 5 },
          { name: 'Acceptance Criteria', type: 'markdown', position: 6 },
          { name: 'Business Value', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], position: 7 },
          { name: 'Target Release', type: 'text', position: 8 }
        ]
      },
      {
        name: 'Task Template',
        category: 'lead',
        description: 'Sprint task with assignee, mentor/reviewer, estimate, priority, and PR reference',
        icon: 'Layers',
        color: '#10b981',
        fields: [
          { name: 'Task ID', type: 'text', required: true, position: 0 },
          { name: 'Assignee', type: 'user', position: 1 },
          { name: 'Reviewer', type: 'user', position: 2 },
          { name: 'Status', type: 'select', options: ['Backlog', 'To Do', 'In Progress', 'In Review', 'Completed', 'Blocked'], position: 3 },
          { name: 'Priority', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], position: 4 },
          { name: 'Start Date', type: 'date', position: 5 },
          { name: 'Due Date', type: 'date', position: 6 },
          { name: 'Estimated Hours', type: 'number', position: 7 },
          { name: 'Actual Hours', type: 'number', position: 8 },
          { name: 'Pull Request URL', type: 'url', position: 9 }
        ]
      },
      {
        name: 'Bug Template',
        category: 'dev',
        description: 'Issue tracker with severity, reproduction steps, error logs, and fixes',
        icon: 'Bug',
        color: '#ef4444',
        fields: [
          { name: 'Bug ID', type: 'text', required: true, position: 0 },
          { name: 'Module', type: 'select', options: ['Tenant Management', 'Property Management', 'Dashboard', 'Authentication', 'Billing', 'API'], position: 1 },
          { name: 'Severity', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], position: 2 },
          { name: 'Priority', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], position: 3 },
          { name: 'Environment', type: 'select', options: ['Production', 'Staging', 'QA', 'Local'], position: 4 },
          { name: 'Reported By', type: 'user', position: 5 },
          { name: 'Assigned To', type: 'user', position: 6 },
          { name: 'Status', type: 'select', options: ['Open', 'Investigating', 'Fix in Progress', 'In Review', 'Resolved', 'Closed'], position: 7 },
          { name: 'Steps to Reproduce', type: 'markdown', position: 8 },
          { name: 'Expected Result', type: 'text', position: 9 },
          { name: 'Actual Result', type: 'text', position: 10 },
          { name: 'Due Date', type: 'date', position: 11 }
        ]
      },
      {
        name: 'Candidate Template',
        category: 'hr',
        description: 'Track candidate applications, resumes, interviews, and ratings',
        icon: 'UserCheck',
        color: '#ec4899',
        fields: [
          { name: 'Candidate Name', type: 'text', required: true, position: 0 },
          { name: 'Position', type: 'text', required: true, position: 1 },
          { name: 'Email', type: 'email', position: 2 },
          { name: 'Phone', type: 'phone', position: 3 },
          { name: 'Experience', type: 'text', position: 4 },
          { name: 'Skills', type: 'text', position: 5 },
          { name: 'Resume URL', type: 'url', position: 6 },
          { name: 'Source', type: 'select', options: ['LinkedIn', 'Naukri', 'Referral', 'Career Portal'], position: 7 },
          { name: 'Interview Status', type: 'select', options: ['Applied', 'Screening', 'Technical Round', 'Managerial', 'Offer', 'Hired', 'Rejected'], position: 8 },
          { name: 'Expected Salary', type: 'currency', currencyCode: 'INR', position: 9 },
          { name: 'Notice Period', type: 'text', position: 10 },
          { name: 'Recruiter', type: 'user', position: 11 },
          { name: 'Interviewer', type: 'user', position: 12 },
          { name: 'Interview Date', type: 'date', position: 13 },
          { name: 'Status', type: 'select', options: ['Interviewing', 'Selected', 'Offer Extended', 'Joined', 'Rejected'], position: 14 }
        ]
      },
      {
        name: 'Interview Template',
        category: 'hr',
        description: 'Score candidates with structured feedback, strengths, and recommendations',
        icon: 'ClipboardCheck',
        color: '#06b6d4',
        fields: [
          { name: 'Interview ID', type: 'text', required: true, position: 0 },
          { name: 'Candidate', type: 'text', required: true, position: 1 },
          { name: 'Position', type: 'text', position: 2 },
          { name: 'Round', type: 'select', options: ['Initial Screening', 'Technical Round 1', 'Technical Round 2', 'System Design', 'Managerial Round', 'HR Round'], position: 3 },
          { name: 'Interviewer', type: 'user', position: 4 },
          { name: 'Date', type: 'date', position: 5 },
          { name: 'Duration', type: 'text', position: 6 },
          { name: 'Technical Score', type: 'rating', maxRating: 10, position: 7 },
          { name: 'Communication Score', type: 'rating', maxRating: 10, position: 8 },
          { name: 'Problem Solving Score', type: 'rating', maxRating: 10, position: 9 },
          { name: 'Recommendation', type: 'select', options: ['Strong Hire', 'Move to next round', 'Hold', 'No Hire'], position: 10 },
          { name: 'Feedback', type: 'markdown', position: 11 },
          { name: 'Status', type: 'select', options: ['Completed', 'Scheduled', 'Cancelled'], position: 12 }
        ]
      },
      {
        name: 'Employee Template',
        category: 'hr',
        description: 'Manage employee records, onboardings, and asset access',
        icon: 'Users',
        color: '#8b5cf6',
        fields: [
          { name: 'Employee Name', type: 'text', required: true, position: 0 },
          { name: 'Employee ID', type: 'text', position: 1 },
          { name: 'Designation', type: 'text', position: 2 },
          { name: 'Department', type: 'select', options: ['Engineering', 'Product', 'Design', 'QA', 'DevOps', 'HR', 'Management'], position: 3 },
          { name: 'Email', type: 'email', position: 4 },
          { name: 'Joining Date', type: 'date', position: 5 },
          { name: 'Reporting Manager', type: 'user', position: 6 },
          { name: 'Employment Type', type: 'select', options: ['Full Time', 'Part Time', 'Contract'], position: 7 },
          { name: 'Laptop', type: 'select', options: ['Assigned', 'Pending', 'Dispatched'], position: 8 },
          { name: 'Email Account', type: 'select', options: ['Created', 'Pending'], position: 9 },
          { name: 'GitHub Access', type: 'select', options: ['Granted', 'Pending'], position: 10 },
          { name: 'Slack Access', type: 'select', options: ['Added', 'Pending'], position: 11 },
          { name: 'Workspace Access', type: 'select', options: ['Granted', 'Pending'], position: 12 },
          { name: 'Status', type: 'select', options: ['Onboarding', 'Active', 'Offboarding', 'Exited'], position: 13 }
        ]
      },
      {
        name: 'Technical Decision Template',
        category: 'dev',
        description: 'Architecture Decision Record (ADR) capturing trade-offs, solutions, and security',
        icon: 'Cpu',
        color: '#a855f7',
        fields: [
          { name: 'Decision Title', type: 'text', required: true, position: 0 },
          { name: 'Author', type: 'user', position: 1 },
          { name: 'Role', type: 'text', position: 2 },
          { name: 'Technology', type: 'text', position: 3 },
          { name: 'Authentication Spec', type: 'text', position: 4 },
          { name: 'Password Hashing', type: 'text', position: 5 },
          { name: 'Session Management', type: 'text', position: 6 },
          { name: 'Security Controls', type: 'markdown', position: 7 },
          { name: 'Status', type: 'select', options: ['Proposed', 'Approved', 'Deprecated', 'Rejected'], position: 8 }
        ]
      },
      {
        name: 'Meeting Template',
        category: 'general',
        description: 'Track agendas, participants, discussions, decisions, and action items',
        icon: 'Video',
        color: '#f59e0b',
        fields: [
          { name: 'Meeting Title', type: 'text', required: true, position: 0 },
          { name: 'Meeting Type', type: 'select', options: ['Project Kickoff', 'Sprint Planning', 'Sprint Review', 'Client Demo', 'Daily Standup'], position: 1 },
          { name: 'Client', type: 'text', position: 2 },
          { name: 'Date', type: 'date', position: 3 },
          { name: 'Participants', type: 'text', position: 4 },
          { name: 'Agenda', type: 'markdown', position: 5 },
          { name: 'Decisions', type: 'markdown', position: 6 },
          { name: 'Action Items', type: 'markdown', position: 7 },
          { name: 'Outcome', type: 'markdown', position: 8 }
        ]
      }
    ];

    const createdTemplates: Record<string, any> = {};
    for (const t of templatesData) {
      const tmpl = await Template.create({
        userId: pmUser._id,
        workspaceId: workspace._id,
        name: t.name,
        category: t.category,
        description: t.description,
        icon: t.icon,
        color: t.color,
        fields: t.fields,
        isSystem: false
      });
      createdTemplates[t.name] = tmpl;
    }

    // 6. Create All 19 Topics
    const topicsDefs = [
      { name: '01 Project Overview', desc: 'Master project metadata, scope, timeline and commercial parameters', icon: 'Briefcase', color: '#6366f1', pos: 0 },
      { name: '02 Client Requirements', desc: 'Functional requirements, SRS, and acceptance criteria', icon: 'CheckSquare', color: '#06b6d4', pos: 1 },
      { name: '03 Product Management', desc: 'Product vision, feature backlog and roadmap', icon: 'Kanban', color: '#3b82f6', pos: 2 },
      { name: '04 UI UX Design', desc: 'Figma mockups, design tokens, and UI components', icon: 'Palette', color: '#ec4899', pos: 3 },
      { name: '05 Frontend Development', desc: 'React screens, state management, components and PR branches', icon: 'Layout', color: '#10b981', pos: 4 },
      { name: '06 Backend Development', desc: 'Node.js/Express REST APIs, auth endpoints, and controllers', icon: 'Server', color: '#6366f1', pos: 5 },
      { name: '07 Database', desc: 'MongoDB collections, indexes, schemas, and queries', icon: 'Database', color: '#8b5cf6', pos: 6 },
      { name: '08 QA & Testing', desc: 'Test suites, test cases, and staging quality assurance', icon: 'CheckCircle2', color: '#f59e0b', pos: 7 },
      { name: '09 DevOps & Deployment', desc: 'AWS ECS, Vercel, MongoDB Atlas, and CI/CD pipelines', icon: 'Cloud', color: '#3b82f6', pos: 8 },
      { name: '10 HR & Recruitment', desc: 'Open job positions, candidate pipeline, interviews, and onboarding', icon: 'Users', color: '#ec4899', pos: 9 },
      { name: '11 Team Management', desc: 'Team roles, developer bandwidth, mentorship, and reviews', icon: 'UserCheck', color: '#10b981', pos: 10 },
      { name: '12 Meetings', desc: 'Client syncs, sprint planning, and architecture decisions', icon: 'Video', color: '#8b5cf6', pos: 11 },
      { name: '13 Client Communication', desc: 'Approvals, feedback notes, and demo questions', icon: 'MessageSquare', color: '#06b6d4', pos: 12 },
      { name: '14 Technical Documentation', desc: 'Architecture decisions (ADRs) and system security specifications', icon: 'Cpu', color: '#a855f7', pos: 13 },
      { name: '15 Project Tasks', desc: 'Sprint tasks, assignees, deadlines, and execution status', icon: 'Layers', color: '#6366f1', pos: 14 },
      { name: '16 Bugs & Issues', desc: 'Issue tracker with severity, reproduction steps, and fixes', icon: 'Bug', color: '#ef4444', pos: 15 },
      { name: '17 Product Roadmap', desc: 'Release milestones and quarterly deliverable targets (V1.0, V1.1)', icon: 'TrendingUp', color: '#f97316', pos: 16 },
      { name: '18 Security', desc: 'RBAC policies, HTTP-only cookie auth, rate limiting, and sanitization', icon: 'ShieldCheck', color: '#ec4899', pos: 17 },
      { name: '19 Project Reports', desc: 'Sprint velocity, test coverage, and project health summaries', icon: 'FileBarChart', color: '#10b981', pos: 18 }
    ];

    const topicMap: Record<string, any> = {};
    for (const t of topicsDefs) {
      const topicDoc = await Topic.create({
        userId: pmUser._id,
        workspaceId: workspace._id,
        name: t.name,
        description: t.desc,
        icon: t.icon,
        color: t.color,
        position: t.pos
      });
      topicMap[t.name] = topicDoc;
    }

    // 7. Populate All Detailed Items
    const itemsToCreate = [
      // Topic 01: Project Overview
      {
        topic: '01 Project Overview',
        title: 'Project Master Information',
        template: 'Project Template',
        content: 'PG Platform is a SaaS-based property and tenant management platform developed for PG owners to automate occupancy, room/bed allocations, rent, complaints, staff, and operations.',
        tags: ['client', 'saas', 'active-project', 'high-priority'],
        fields: [
          { fieldId: 'f_pname', name: 'Project Name', type: 'text', value: 'PG Platform' },
          { fieldId: 'f_client', name: 'Client', type: 'text', value: 'PG Technologies Pvt. Ltd.' },
          { fieldId: 'f_pm', name: 'Project Manager', type: 'user', value: 'Amit Sharma' },
          { fieldId: 'f_prodm', name: 'Product Manager', type: 'user', value: 'Neha Verma' },
          { fieldId: 'f_tl', name: 'Team Lead', type: 'user', value: 'Rahul Mehta' },
          { fieldId: 'f_type', name: 'Project Type', type: 'select', value: 'SaaS' },
          { fieldId: 'f_status', name: 'Status', type: 'select', value: 'In Progress' },
          { fieldId: 'f_priority', name: 'Priority', type: 'select', value: 'High' },
          { fieldId: 'f_start', name: 'Start Date', type: 'date', value: '2026-09-01' },
          { fieldId: 'f_launch', name: 'Target Launch', type: 'date', value: '2027-02-15' },
          { fieldId: 'f_budget', name: 'Budget', type: 'currency', value: 3800000, currencyCode: 'INR' },
          { fieldId: 'f_size', name: 'Team Size', type: 'number', value: 9 },
          { fieldId: 'f_cweb', name: 'Client Website', type: 'url', value: 'https://pgtechnologies.example' },
          { fieldId: 'f_repo', name: 'Repository', type: 'url', value: 'https://github.com/company/pg-platform' },
          { fieldId: 'f_docs', name: 'Documentation', type: 'url', value: 'https://docs.example.com/pg-platform' }
        ]
      },

      // Topic 02: Client Requirements
      {
        topic: '02 Client Requirements',
        title: 'PG Owner Dashboard',
        template: 'Requirement Template',
        content: 'PG owner should be able to see total properties, rooms, beds, occupied beds, available beds, pending payments, complaints and monthly revenue.',
        tags: ['requirement', 'feature', 'dashboard', 'critical'],
        fields: [
          { fieldId: 'f_rid', name: 'Requirement ID', type: 'text', value: 'REQ-001' },
          { fieldId: 'f_rtype', name: 'Requirement Type', type: 'select', value: 'Feature' },
          { fieldId: 'f_reqby', name: 'Requested By', type: 'text', value: 'PG Technologies' },
          { fieldId: 'f_prio', name: 'Priority', type: 'select', value: 'Critical' },
          { fieldId: 'f_st', name: 'Status', type: 'select', value: 'Approved' },
          { fieldId: 'f_mod', name: 'Module', type: 'select', value: 'Dashboard' },
          { fieldId: 'f_ac', name: 'Acceptance Criteria', type: 'markdown', value: '1. Owner can see total rooms.\n2. Owner can see available beds.\n3. Owner can see occupied beds.\n4. Owner can see pending rent.\n5. Owner can see active complaints.\n6. Dashboard updates with real-time data.' },
          { fieldId: 'f_bv', name: 'Business Value', type: 'select', value: 'High' },
          { fieldId: 'f_tr', name: 'Target Release', type: 'text', value: 'Version 1.0' }
        ]
      },
      {
        topic: '02 Client Requirements',
        title: 'Tenant Management',
        template: 'Requirement Template',
        content: 'PG owner should be able to add, update, search, filter and manage tenants with KYC documents, room allocation and payment history.',
        tags: ['requirement', 'feature', 'tenant', 'high-priority'],
        fields: [
          { fieldId: 'f_rid', name: 'Requirement ID', type: 'text', value: 'REQ-002' },
          { fieldId: 'f_rtype', name: 'Requirement Type', type: 'select', value: 'Feature' },
          { fieldId: 'f_reqby', name: 'Requested By', type: 'text', value: 'PG Technologies' },
          { fieldId: 'f_prio', name: 'Priority', type: 'select', value: 'High' },
          { fieldId: 'f_st', name: 'Status', type: 'select', value: 'Approved' },
          { fieldId: 'f_mod', name: 'Module', type: 'select', value: 'Tenant Management' },
          { fieldId: 'f_ac', name: 'Acceptance Criteria', type: 'markdown', value: '- Add & Edit Tenant Profile\n- Room & Bed allocation selector\n- KYC document upload & ID verification\n- Payment history & security deposit record\n- Emergency contact details\n- Tenant status toggle (Active/Vacated)' },
          { fieldId: 'f_bv', name: 'Business Value', type: 'select', value: 'High' },
          { fieldId: 'f_tr', name: 'Target Release', type: 'text', value: 'V1.0' }
        ]
      },

      // Topic 03: Product Management
      {
        topic: '03 Product Management',
        title: 'PG Platform Product Vision',
        tags: ['product', 'vision', 'strategy'],
        content: `**Product:** PG Management SaaS\n\n**Target Users:**\n- PG Owners & Property Managers\n- On-site Caretakers & Staff\n- Resident Tenants\n\n**Problem Statement:**\nPG owners currently manage tenants, rooms, rent collection and complaints through disconnected spreadsheets, WhatsApp chats and manual registers, causing revenue leakage and communication gaps.\n\n**Solution:**\nA centralized multi-tenant web platform for automating operations, automated WhatsApp reminders, occupancy heatmaps, online payments, and ticketed complaint workflows.`
      },
      {
        topic: '03 Product Management',
        title: 'Online Rent Payment Feature',
        tags: ['product', 'roadmap', 'payment', 'v1.1'],
        content: `**Feature:** Online Rent Payment via UPI & Gateway\n**Status:** Planned\n**Priority:** High\n**Target Release:** V1.1\n**Dependencies:** Payment Gateway Integration, Invoicing Engine, Tenant App`
      },

      // Topic 04: UI UX Design
      {
        topic: '04 UI UX Design',
        title: 'Login Page Design',
        tags: ['design', 'ui', 'figma', 'approved'],
        content: `**Screen:** Login / Auth Screen\n**Designer:** Anjali Jain\n**Status:** Approved\n**User Types:** Owner, Manager, Staff, Tenant\n**Required Fields:** Email, Password\n**Actions:** Login, Forgot Password, Remember Me, SSO\n\n**Figma Design URL:** https://figma.example.com/pg-platform/login`
      },
      {
        topic: '04 UI UX Design',
        title: 'Owner Dashboard Design',
        tags: ['design', 'dashboard', 'figma', 'in-review'],
        content: `**Screen:** Owner Dashboard\n**Designer:** Anjali Jain\n**Status:** In Review\n**Components:** Occupancy Card, Revenue Card, Pending Payment Card, Complaint Card, Recent Activity, Occupancy Chart, Revenue Chart\n\n**Figma URL:** https://figma.example.com/pg-platform/dashboard`
      },

      // Topic 05: Frontend Development
      {
        topic: '05 Frontend Development',
        title: 'Tenant Management Frontend',
        template: 'Task Template',
        tags: ['frontend', 'react', 'tenant', 'in-progress'],
        content: `**Feature:** Tenant Management UI & Filters\n**Framework:** React 18 + Tailwind CSS + Vite\n**Branch:** \`feature/tenant-management\`\n**PR:** https://github.com/company/pg-platform/pull/42`,
        taskProps: {
          isTask: true,
          status: 'in_progress',
          priority: 'high',
          assigneeName: 'Rohit Kumar',
          startDate: new Date('2026-09-20'),
          dueDate: new Date('2026-10-05'),
          progress: 55
        },
        fields: [
          { fieldId: 'f_tid', name: 'Task ID', type: 'text', value: 'FE-042' },
          { fieldId: 'f_as', name: 'Assignee', type: 'user', value: 'Rohit Kumar' },
          { fieldId: 'f_rev', name: 'Reviewer', type: 'user', value: 'Arjun Kapoor' },
          { fieldId: 'f_st', name: 'Status', type: 'select', value: 'In Progress' },
          { fieldId: 'f_pri', name: 'Priority', type: 'select', value: 'High' },
          { fieldId: 'f_sdate', name: 'Start Date', type: 'date', value: '2026-09-20' },
          { fieldId: 'f_ddate', name: 'Due Date', type: 'date', value: '2026-10-05' },
          { fieldId: 'f_pr', name: 'Pull Request URL', type: 'url', value: 'https://github.com/company/pg-platform/pull/42' }
        ]
      },

      // Topic 06: Backend Development
      {
        topic: '06 Backend Development',
        title: 'Tenant Management API',
        tags: ['backend', 'api', 'nodejs', 'mongodb'],
        content: `**Feature:** Tenant Management API\n**Developer:** Arjun Kapoor\n**Reviewer:** Rahul Mehta\n**Technology:** Node.js, Express, MongoDB\n\n**Endpoints:**\n\`\`\`text\nPOST   /api/tenants\nGET    /api/tenants\nGET    /api/tenants/:id\nPATCH  /api/tenants/:id\nDELETE /api/tenants/:id\n\`\`\`\n\n**Authentication:** Required (Bearer JWT in HTTP-only Cookie)\n**Authorization:** Owner / Manager (RBAC)\n**Status:** In Review`
      },

      // Topic 07: Database
      {
        topic: '07 Database',
        title: 'Tenant Collection Schema',
        tags: ['database', 'mongodb', 'schema'],
        content: `**Collection Name:** \`tenants\`\n\n**Fields:**\n- \`_id\`: ObjectId\n- \`workspaceId\`: ObjectId (Indexed)\n- \`propertyId\`: ObjectId (Indexed)\n- \`roomId\`: ObjectId\n- \`bedId\`: ObjectId\n- \`name\`: String\n- \`email\`: String (Indexed)\n- \`phone\`: String (Indexed)\n- \`dateOfBirth\`: Date\n- \`gender\`: String\n- \`emergencyContact\`: { name, phone, relation }\n- \`joiningDate\`: Date\n- \`status\`: 'active' | 'notice' | 'vacated'\n- \`documents\`: Array<{ type, url, verified }>\n- \`createdAt\`, \`updatedAt\`: Timestamps\n\n**Indexes:** \`{ workspaceId: 1, propertyId: 1 }\`, \`{ phone: 1 }\`, \`{ status: 1 }\``
      },

      // Topic 08: QA & Testing
      {
        topic: '08 QA & Testing',
        title: 'Authentication Test Suite',
        tags: ['qa', 'testing', 'authentication', 'staging'],
        content: `**Test Suite:** Authentication & Security\n**Tester:** Vikash Yadav\n**Environment:** Staging\n\n**Test Cases:**\n- TC-001 Valid Login (PASS)\n- TC-002 Invalid Password Lockout (PASS)\n- TC-003 Invalid Email Regex (PASS)\n- TC-004 Empty Email Validation (PASS)\n- TC-005 Empty Password Validation (PASS)\n- TC-006 Account Lockout after 5 attempts (PASS)\n- TC-007 Logout & Cookie Invalidation (PASS)\n- TC-008 Refresh Token Rotation (PASS)\n- TC-009 Expired Session Cookie Redirect (PASS)\n- TC-010 Unauthorized API Access Protection (PASS)\n\n**Status:** In Progress (10/10 automated)`
      },

      // Topic 09: DevOps & Deployment
      {
        topic: '09 DevOps & Deployment',
        title: 'Staging Environment Deployment',
        tags: ['devops', 'aws', 'vercel', 'ci-cd'],
        content: `**Environment:** Staging\n**DevOps Engineer:** Karan Malhotra\n**Cloud Infrastructure:** AWS ECS (ap-south-1)\n**Frontend Hosting:** Vercel\n**Database:** MongoDB Atlas M10 Cluster\n**CI/CD:** GitHub Actions Automated Pipeline\n**Domain:** https://staging.pgplatform.example\n**Status:** Active & Healthy`
      },

      // Topic 10: HR & Recruitment
      {
        topic: '10 HR & Recruitment',
        title: 'Hiring Requirement: Senior Backend Developer',
        tags: ['hr', 'recruitment', 'job-opening', 'backend'],
        content: `**Position:** Senior Backend Developer\n**Department:** Engineering\n**Requested By:** Rahul Mehta (Team Lead)\n**Approved By:** Amit Sharma (Project Manager)\n**Open Positions:** 1\n**Experience:** 4–7 Years\n**Key Skills:** Node.js, Express, MongoDB, REST API, System Design, JWT/RBAC\n**Salary Range:** ₹12–18 LPA\n**Priority:** High\n**Status:** Open\n**Expected Joining:** November 2026`
      },
      {
        topic: '10 HR & Recruitment',
        title: 'Candidate: Vivek Sharma',
        template: 'Candidate Template',
        tags: ['candidate', 'backend', 'senior', 'interviewing'],
        content: `**Candidate Name:** Vivek Sharma\n**Position:** Senior Backend Developer\n**Experience:** 5 Years\n**Current Organization:** Tech Solutions Ltd.\n**Skills:** Node.js, Express, MongoDB, AWS, Redis\n**Expected Salary:** ₹15 LPA\n**Notice Period:** 30 Days\n**Status:** Interviewing (Technical Round 1 Completed)`,
        fields: [
          { fieldId: 'f_cname', name: 'Candidate Name', type: 'text', value: 'Vivek Sharma' },
          { fieldId: 'f_pos', name: 'Position', type: 'text', value: 'Senior Backend Developer' },
          { fieldId: 'f_email', name: 'Email', type: 'email', value: 'vivek@example.com' },
          { fieldId: 'f_ph', name: 'Phone', type: 'phone', value: '+91 9876543210' },
          { fieldId: 'f_exp', name: 'Experience', type: 'text', value: '5 Years' },
          { fieldId: 'f_skills', name: 'Skills', type: 'text', value: 'Node.js, MongoDB, Express, AWS, Redis' },
          { fieldId: 'f_src', name: 'Source', type: 'select', value: 'LinkedIn' },
          { fieldId: 'f_istat', name: 'Interview Status', type: 'select', value: 'Technical Round' },
          { fieldId: 'f_esal', name: 'Expected Salary', type: 'currency', value: 1500000, currencyCode: 'INR' },
          { fieldId: 'f_np', name: 'Notice Period', type: 'text', value: '30 Days' },
          { fieldId: 'f_rec', name: 'Recruiter', type: 'user', value: 'Priya Singh' },
          { fieldId: 'f_int', name: 'Interviewer', type: 'user', value: 'Arjun Kapoor' },
          { fieldId: 'f_idate', name: 'Interview Date', type: 'date', value: '2026-10-03' },
          { fieldId: 'f_st', name: 'Status', type: 'select', value: 'Interviewing' }
        ]
      },
      {
        topic: '10 HR & Recruitment',
        title: 'Interview Assessment: INT-045 (Vivek Sharma)',
        template: 'Interview Template',
        tags: ['interview', 'assessment', 'technical-round', 'completed'],
        content: `**Interview ID:** INT-045\n**Candidate:** Vivek Sharma\n**Round:** Technical Round 1\n**Interviewer:** Arjun Kapoor\n**Date:** 03 October 2026\n**Technical Score:** 8/10\n**Communication:** 7/10\n**Problem Solving:** 8/10\n**Recommendation:** Move to next round\n**Feedback:** Strong Node.js and MongoDB fundamentals. Needs deeper system design discussion in Round 2.`,
        fields: [
          { fieldId: 'f_iid', name: 'Interview ID', type: 'text', value: 'INT-045' },
          { fieldId: 'f_cand', name: 'Candidate', type: 'text', value: 'Vivek Sharma' },
          { fieldId: 'f_pos', name: 'Position', type: 'text', value: 'Senior Backend Developer' },
          { fieldId: 'f_rnd', name: 'Round', type: 'select', value: 'Technical Round 1' },
          { fieldId: 'f_inter', name: 'Interviewer', type: 'user', value: 'Arjun Kapoor' },
          { fieldId: 'f_date', name: 'Date', type: 'date', value: '2026-10-03' },
          { fieldId: 'f_tscore', name: 'Technical Score', type: 'rating', value: 8, maxRating: 10 },
          { fieldId: 'f_cscore', name: 'Communication Score', type: 'rating', value: 7, maxRating: 10 },
          { fieldId: 'f_pscore', name: 'Problem Solving Score', type: 'rating', value: 8, maxRating: 10 },
          { fieldId: 'f_rec', name: 'Recommendation', type: 'select', value: 'Move to next round' },
          { fieldId: 'f_fb', name: 'Feedback', type: 'markdown', value: 'Strong Node.js and MongoDB knowledge. Hands-on with aggregation pipeline and indexes. Move to System Design round.' },
          { fieldId: 'f_st', name: 'Status', type: 'select', value: 'Completed' }
        ]
      },
      {
        topic: '10 HR & Recruitment',
        title: 'Employee Onboarding: Vivek Sharma',
        template: 'Employee Template',
        tags: ['onboarding', 'employee', 'engineering'],
        content: `**Employee:** Vivek Sharma\n**Designation:** Senior Backend Developer\n**Department:** Engineering\n**Joining Date:** 2026-10-20\n**Reporting Manager:** Rahul Mehta\n**HR Manager:** Priya Singh\n\n**Checklist:**\n- Laptop: Assigned (MacBook Pro)\n- Email Account: Created\n- GitHub Organization: Added\n- Slack: Added\n- LinkVault Workspace: Granted\n- Status: Onboarding`,
        fields: [
          { fieldId: 'f_ename', name: 'Employee Name', type: 'text', value: 'Vivek Sharma' },
          { fieldId: 'f_eid', name: 'Employee ID', type: 'text', value: 'EMP-108' },
          { fieldId: 'f_desig', name: 'Designation', type: 'text', value: 'Senior Backend Developer' },
          { fieldId: 'f_dept', name: 'Department', type: 'select', value: 'Engineering' },
          { fieldId: 'f_email', name: 'Email', type: 'email', value: 'vivek.sharma@pgplatform.example' },
          { fieldId: 'f_jdate', name: 'Joining Date', type: 'date', value: '2026-10-20' },
          { fieldId: 'f_mgr', name: 'Reporting Manager', type: 'user', value: 'Rahul Mehta' },
          { fieldId: 'f_type', name: 'Employment Type', type: 'select', value: 'Full Time' },
          { fieldId: 'f_lap', name: 'Laptop', type: 'select', value: 'Assigned' },
          { fieldId: 'f_emacc', name: 'Email Account', type: 'select', value: 'Created' },
          { fieldId: 'f_gh', name: 'GitHub Access', type: 'select', value: 'Granted' },
          { fieldId: 'f_slack', name: 'Slack Access', type: 'select', value: 'Added' },
          { fieldId: 'f_ws', name: 'Workspace Access', type: 'select', value: 'Granted' },
          { fieldId: 'f_st', name: 'Status', type: 'select', value: 'Onboarding' }
        ]
      },

      // Topic 11: Team Management
      {
        topic: '11 Team Management',
        title: 'Sprint 01 Planning & Workload',
        tags: ['sprint', 'planning', 'sprint-01', 'team-lead'],
        content: `**Sprint:** Sprint 01\n**Team Lead:** Rahul Mehta\n**Start Date:** 21 September 2026\n**End Date:** 04 October 2026\n**Sprint Goal:** Complete authentication, JWT session system, and initial Property/Tenant Management modules.\n\n**Sprint Tasks:**\n- Login API (Arjun) - Completed\n- Registration API (Arjun) - Completed\n- JWT/Session system (Arjun) - Completed\n- Property CRUD UI (Rohit) - In Progress\n- API Validation & BUG-104 (Arjun/Vikash) - In Progress\n- Unit & Integration Tests (Vikash) - In Progress\n\n**Status:** In Progress (62% Completed)`
      },

      // Topic 12: Meetings
      {
        topic: '12 Meetings',
        title: 'Project Kickoff Meeting 01',
        template: 'Meeting Template',
        tags: ['meeting', 'kickoff', 'client', 'decisions'],
        content: `**Meeting Title:** Project Kickoff Meeting\n**Date:** 2026-09-05\n**Client:** PG Technologies\n**Participants:** Suresh Patel (Client), Amit Sharma (PM), Neha Verma (Prod), Rahul Mehta (Lead)\n\n**Key Decisions:**\n1. Target V1 launch date fixed for 15 February 2027.\n2. Bi-weekly client sync meetings scheduled every Friday.\n3. Staging live demo at the end of every two-week sprint cycle.\n4. Budget milestone payments linked to approved deliverables.`,
        fields: [
          { fieldId: 'f_mtitle', name: 'Meeting Title', type: 'text', value: 'Project Kickoff Meeting' },
          { fieldId: 'f_mtype', name: 'Meeting Type', type: 'select', value: 'Project Kickoff' },
          { fieldId: 'f_client', name: 'Client', type: 'text', value: 'PG Technologies Pvt. Ltd.' },
          { fieldId: 'f_mdate', name: 'Date', type: 'date', value: '2026-09-05' },
          { fieldId: 'f_part', name: 'Participants', type: 'text', value: 'Suresh Patel, Amit Sharma, Neha Verma, Rahul Mehta' },
          { fieldId: 'f_agenda', name: 'Agenda', type: 'markdown', value: '1. Scope validation\n2. Milestone timelines\n3. Communication protocols\n4. Staging demo schedule' },
          { fieldId: 'f_dec', name: 'Decisions', type: 'markdown', value: '- Launch target 15 Feb 2027\n- Sprint staging review bi-weekly\n- Client feedback SLA 48 hours' }
        ]
      },

      // Topic 13: Client Communication
      {
        topic: '13 Client Communication',
        title: 'Owner Dashboard Design Approval',
        tags: ['client', 'approval', 'ui-ux', 'signed-off'],
        content: `**Item:** PG Owner Dashboard Wireframe & High-fidelity Mockup\n**Approved By:** Suresh Patel (Client Representative)\n**Date:** 2026-09-24\n**Approval Notes:** "Dashboard design approved with occupancy cards and revenue charts. Please proceed with Frontend development in Sprint 02."`
      },

      // Topic 14: Technical Documentation
      {
        topic: '14 Technical Documentation',
        title: 'Authentication Architecture (ADR-001)',
        template: 'Technical Decision Template',
        tags: ['architecture', 'authentication', 'security', 'backend', 'adr'],
        content: `**Title:** Authentication Architecture & Session Security\n**Author:** Arjun Kapoor (Senior Developer)\n**Reviewer:** Rahul Mehta (Team Lead)\n**Technology:** Node.js, Express, MongoDB\n\n**Architecture Details:**\n- Access Token (Short-lived 15 mins) + Refresh Token (7 days rotation)\n- Password Hashing: Argon2 / Bcrypt with salt rounds >= 12\n- Cookies: Stored in Secure, HTTP-Only, SameSite=Strict cookies\n- Rate Limiting: 100 requests per 15 minutes on auth endpoints\n- MongoDB Injection: Sanitized query wrappers on all endpoints\n- XSS & Headers: Helmet.js with Content-Security-Policy\n\n**Status:** Approved & Implemented in Sprint 01`,
        fields: [
          { fieldId: 'f_dtitle', name: 'Decision Title', type: 'text', value: 'Authentication Architecture & Session Security' },
          { fieldId: 'f_auth', name: 'Author', type: 'user', value: 'Arjun Kapoor' },
          { fieldId: 'f_role', name: 'Role', type: 'text', value: 'Senior Developer' },
          { fieldId: 'f_tech', name: 'Technology', type: 'text', value: 'Node.js, Express, MongoDB, JWT' },
          { fieldId: 'f_aspec', name: 'Authentication Spec', type: 'text', value: 'Access Token + Refresh Token in HTTP-Only Cookie' },
          { fieldId: 'f_phash', name: 'Password Hashing', type: 'text', value: 'Argon2 / Bcrypt (Salt >= 12)' },
          { fieldId: 'f_sess', name: 'Session Management', type: 'text', value: 'Secure HTTP-only cookies with token revocation' },
          { fieldId: 'f_sec', name: 'Security Controls', type: 'markdown', value: 'Rate limiting, input sanitization, CORS whitelist, Helmet headers, token rotation.' },
          { fieldId: 'f_st', name: 'Status', type: 'select', value: 'Approved' }
        ]
      },

      // Topic 15: Project Tasks
      {
        topic: '15 Project Tasks',
        title: 'TASK-001: Implement Login API & JWT Auth',
        template: 'Task Template',
        tags: ['task', 'backend', 'critical', 'completed'],
        taskProps: {
          isTask: true,
          status: 'done',
          priority: 'urgent',
          assigneeName: 'Arjun Kapoor',
          startDate: new Date('2026-09-21'),
          dueDate: new Date('2026-09-24'),
          progress: 100,
          completed: true
        },
        fields: [
          { fieldId: 'f_tid', name: 'Task ID', type: 'text', value: 'TASK-001' },
          { fieldId: 'f_as', name: 'Assignee', type: 'user', value: 'Arjun Kapoor' },
          { fieldId: 'f_rev', name: 'Reviewer', type: 'user', value: 'Rahul Mehta' },
          { fieldId: 'f_st', name: 'Status', type: 'select', value: 'Completed' },
          { fieldId: 'f_pri', name: 'Priority', type: 'select', value: 'Critical' },
          { fieldId: 'f_sdate', name: 'Start Date', type: 'date', value: '2026-09-21' },
          { fieldId: 'f_ddate', name: 'Due Date', type: 'date', value: '2026-09-24' },
          { fieldId: 'f_est', name: 'Estimated Hours', type: 'number', value: 16 },
          { fieldId: 'f_act', name: 'Actual Hours', type: 'number', value: 14 }
        ]
      },
      {
        topic: '15 Project Tasks',
        title: 'TASK-002: Create Property Listing Screen & Filters',
        template: 'Task Template',
        tags: ['task', 'frontend', 'ui', 'in-progress'],
        taskProps: {
          isTask: true,
          status: 'in_progress',
          priority: 'high',
          assigneeName: 'Rohit Kumar',
          startDate: new Date('2026-09-22'),
          dueDate: new Date('2026-09-27'),
          progress: 60
        },
        fields: [
          { fieldId: 'f_tid', name: 'Task ID', type: 'text', value: 'TASK-002' },
          { fieldId: 'f_as', name: 'Assignee', type: 'user', value: 'Rohit Kumar' },
          { fieldId: 'f_rev', name: 'Reviewer', type: 'user', value: 'Arjun Kapoor' },
          { fieldId: 'f_st', name: 'Status', type: 'select', value: 'In Progress' },
          { fieldId: 'f_pri', name: 'Priority', type: 'select', value: 'High' },
          { fieldId: 'f_sdate', name: 'Start Date', type: 'date', value: '2026-09-22' },
          { fieldId: 'f_ddate', name: 'Due Date', type: 'date', value: '2026-09-27' },
          { fieldId: 'f_est', name: 'Estimated Hours', type: 'number', value: 20 }
        ]
      },
      {
        topic: '15 Project Tasks',
        title: 'TASK-003: Write Login & Session Test Cases',
        template: 'Task Template',
        tags: ['task', 'qa', 'testing', 'planned'],
        taskProps: {
          isTask: true,
          status: 'todo',
          priority: 'high',
          assigneeName: 'Vikash Yadav',
          startDate: new Date('2026-09-25'),
          dueDate: new Date('2026-09-28'),
          progress: 20
        },
        fields: [
          { fieldId: 'f_tid', name: 'Task ID', type: 'text', value: 'TASK-003' },
          { fieldId: 'f_as', name: 'Assignee', type: 'user', value: 'Vikash Yadav' },
          { fieldId: 'f_rev', name: 'Reviewer', type: 'user', value: 'Rahul Mehta' },
          { fieldId: 'f_st', name: 'Status', type: 'select', value: 'To Do' },
          { fieldId: 'f_pri', name: 'Priority', type: 'select', value: 'High' },
          { fieldId: 'f_sdate', name: 'Start Date', type: 'date', value: '2026-09-25' },
          { fieldId: 'f_ddate', name: 'Due Date', type: 'date', value: '2026-09-28' },
          { fieldId: 'f_est', name: 'Estimated Hours', type: 'number', value: 12 }
        ]
      },

      // Topic 16: Bugs & Issues
      {
        topic: '16 Bugs & Issues',
        title: 'BUG-104: Tenant API returns 500 when roomId is missing',
        template: 'Bug Template',
        tags: ['bug', 'defect', 'tenant-api', 'high-priority', 'in-progress'],
        content: `**Bug ID:** BUG-104\n**Title:** Tenant API returns 500 when roomId is missing\n**Severity:** High\n**Priority:** High\n**Environment:** Staging\n**Reported By:** Vikash Yadav\n**Assigned To:** Arjun Kapoor\n\n**Steps to Reproduce:**\n1. Call \`POST /api/tenants\` without passing \`roomId\` parameter.\n2. Server attempts ObjectId conversion on null and crashes with 500 Internal Server Error.\n\n**Expected:** 400 Bad Request with validation message \`"roomId is required"\`.\n**Actual:** 500 Internal Server Error.`,
        taskProps: {
          isTask: true,
          status: 'in_progress',
          priority: 'urgent',
          assigneeName: 'Arjun Kapoor',
          dueDate: new Date('2026-09-29')
        },
        fields: [
          { fieldId: 'f_bid', name: 'Bug ID', type: 'text', value: 'BUG-104' },
          { fieldId: 'f_mod', name: 'Module', type: 'select', value: 'Tenant Management' },
          { fieldId: 'f_sev', name: 'Severity', type: 'select', value: 'High' },
          { fieldId: 'f_pri', name: 'Priority', type: 'select', value: 'High' },
          { fieldId: 'f_env', name: 'Environment', type: 'select', value: 'Staging' },
          { fieldId: 'f_rep', name: 'Reported By', type: 'user', value: 'Vikash Yadav' },
          { fieldId: 'f_as', name: 'Assigned To', type: 'user', value: 'Arjun Kapoor' },
          { fieldId: 'f_st', name: 'Status', type: 'select', value: 'Fix in Progress' },
          { fieldId: 'f_step', name: 'Steps to Reproduce', type: 'markdown', value: '1. POST /api/tenants with missing roomId field.\n2. Submit payload.' },
          { fieldId: 'f_exp', name: 'Expected Result', type: 'text', value: 'Validation error 400 with friendly message' },
          { fieldId: 'f_act', name: 'Actual Result', type: 'text', value: '500 Internal Server Error crash' },
          { fieldId: 'f_due', name: 'Due Date', type: 'date', value: '2026-09-29' }
        ]
      },

      // Topic 17: Product Roadmap
      {
        topic: '17 Product Roadmap',
        title: 'PG Platform Release Roadmap (V1.0 – V1.2)',
        tags: ['roadmap', 'milestones', 'planning'],
        content: `**Release V1.0 (Target: 15 Feb 2027):**\n- Property & Room Management\n- Tenant Registration & Bed Allocation\n- Rent Invoicing & Payment Tracking\n- Complaint Ticketing System\n- Staff Operations\n- PG Owner Analytics Dashboard\n\n**Release V1.1 (Target: April 2027):**\n- Online Rent Payment via UPI & Gateway\n- Automated WhatsApp Reminders\n- Financial P&L Reports\n\n**Release V1.2 (Target: June 2027):**\n- Tenant Mobile Self-Service Portal\n- Biometric Gate Access Integration`
      },

      // Topic 18: Security
      {
        topic: '18 Security',
        title: 'Production Security & RBAC Policy',
        tags: ['security', 'compliance', 'rbac', 'production'],
        content: `**Production Security Baseline Checklist:**\n- [x] Authentication: Access Token + HTTP-only Cookie Refresh Token\n- [x] Authorization: Role-Based Access Control (RBAC) enforced per route\n- [x] Passwords: Argon2 / Bcrypt with high iteration cost\n- [x] API Rate Limiting: 100 req/15 min on public endpoints\n- [x] Input Validation: Zod schemas on all API inputs\n- [x] Injection Defense: Sanitized MongoDB queries\n- [x] CORS: Whitelist restricted to authorized domain origins\n- [x] Security Headers: Helmet enabled with strict CSP`
      },

      // Topic 19: Project Reports
      {
        topic: '19 Project Reports',
        title: 'Sprint 01 Executive Progress Report',
        tags: ['reports', 'sprint-01', 'executive', 'summary'],
        content: `**Sprint 01 Summary (21 Sep – 04 Oct 2026):**\n- Sprint Velocity: 62% Completed on schedule\n- Total Tasks Tracked: 84\n- Completed Tasks: 31\n- In Progress: 28\n- Blocked: 7\n- Bugs Logged: 21 (14 Resolved, 2 Critical, 5 Under Investigation)\n- Hiring Pipeline: 14 Candidates, Vivek Sharma moved to Round 2\n- Client Feedback: Owner Dashboard Figma approved by Suresh Patel`
      }
    ];

    const createdItemsList = [];

    for (const itemData of itemsToCreate) {
      const topicDoc = topicMap[itemData.topic];
      if (!topicDoc) continue;

      const tmplDoc = itemData.template ? createdTemplates[itemData.template] : null;

      const itemDoc = await Item.create({
        userId: pmUser._id,
        workspaceId: workspace._id,
        topicId: topicDoc._id,
        templateId: tmplDoc?._id || null,
        title: itemData.title,
        content: itemData.content || '',
        tags: itemData.tags || [],
        fields: (itemData.fields || []) as any,
        taskProps: itemData.taskProps || { isTask: false },
        isFavorite: itemData.tags?.includes('critical') || itemData.tags?.includes('active-project') || false,
        visibility: 'workspace'
      });

      createdItemsList.push(itemDoc);
    }

    // 8. Add Comments & Mentions
    const authArchItem = createdItemsList.find(i => i.title.includes('Authentication Architecture'));
    if (authArchItem) {
      await Comment.create([
        {
          workspaceId: workspace._id,
          itemId: authArchItem._id,
          authorId: createdUsers['Rahul Mehta']._id,
          authorName: 'Rahul Mehta',
          authorAvatar: '',
          content: '@Arjun please review the authentication architecture before Friday.',
          mentions: [createdUsers['Arjun Kapoor']._id.toString()],
          createdAt: new Date(Date.now() - 3600000 * 24)
        },
        {
          workspaceId: workspace._id,
          itemId: authArchItem._id,
          authorId: createdUsers['Arjun Kapoor']._id,
          authorName: 'Arjun Kapoor',
          authorAvatar: '',
          content: 'Reviewed. Refresh token rotation and HTTP-only cookies are implemented.',
          mentions: [],
          createdAt: new Date(Date.now() - 3600000 * 12)
        },
        {
          workspaceId: workspace._id,
          itemId: authArchItem._id,
          authorId: pmUser._id,
          authorName: 'Amit Sharma',
          authorAvatar: '',
          content: '@Rahul please confirm the final implementation timeline for Sprint 01.',
          mentions: [createdUsers['Rahul Mehta']._id.toString()],
          createdAt: new Date(Date.now() - 3600000 * 2)
        }
      ]);
    }

    // 9. Saved Views for the Workspace
    const savedViewsData = [
      {
        name: 'My Tasks',
        viewType: 'table',
        filterRules: [{ field: 'assigneeName', operator: 'equals', value: 'Amit Sharma' }, { field: 'status', operator: 'notEquals', value: 'completed' }],
        sortField: 'dueDate',
        sortOrder: 'asc'
      },
      {
        name: 'Critical Bugs',
        viewType: 'table',
        filterRules: [{ field: 'severity', operator: 'equals', value: 'High' }],
        sortField: 'createdAt',
        sortOrder: 'desc'
      },
      {
        name: 'Pending Hiring',
        viewType: 'cards',
        filterRules: [{ field: 'status', operator: 'equals', value: 'Interviewing' }],
        sortField: 'updatedAt',
        sortOrder: 'desc'
      },
      {
        name: 'Sprint 01 Tasks',
        viewType: 'table',
        filterRules: [{ field: 'topic', operator: 'contains', value: 'Tasks' }],
        sortField: 'position',
        sortOrder: 'asc'
      }
    ];

    for (const sv of savedViewsData) {
      await SavedView.create({
        userId: pmUser._id,
        workspaceId: workspace._id,
        name: sv.name,
        viewType: sv.viewType as any,
        filterRules: sv.filterRules as any,
        sortField: sv.sortField,
        sortOrder: sv.sortOrder as any,
        isDefault: false
      });
    }

    // 10. Write dataset backup to JSON file in workspace root
    const exportDataset = {
      project: 'LinkVault – PG Platform Client',
      account: {
        email: primaryEmail,
        password: primaryPassword,
        name: 'Amit Sharma',
        role: 'Project Manager'
      },
      workspace: {
        id: workspace._id.toString(),
        name: workspace.name,
        description: workspace.description,
        category: workspace.category
      },
      members: teamMembersData,
      topicsCount: topicsDefs.length,
      topics: topicsDefs.map(t => t.name),
      itemsCount: createdItemsList.length,
      templatesCount: templatesData.length,
      seededAt: new Date().toISOString()
    };

    const datasetPath = path.resolve(process.cwd(), '../PG_Platform_Client_Dataset.json');
    fs.writeFileSync(datasetPath, JSON.stringify(exportDataset, null, 2), 'utf-8');

    logger.info('🎉 PG Platform Dataset successfully seeded into database!');
    logger.info(`🔑 Login Account: ${primaryEmail} / ${primaryPassword}`);
    logger.info(`📁 Dataset export written to ${datasetPath}`);

    await disconnectDatabase();
  } catch (err) {
    logger.error('PG Platform Seed Error:', err);
    process.exit(1);
  }
}

if (process.argv[1]?.includes('seed_pg_platform')) {
  seedPGPlatform();
}
