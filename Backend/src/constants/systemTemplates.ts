import { ITemplateField } from '../types/item.types.js';

export interface ISystemTemplateDef {
  name: string;
  category: 'hr' | 'pm' | 'founder' | 'ceo' | 'lead' | 'dev' | 'general';
  description: string;
  icon: string;
  color: string;
  fields: ITemplateField[];
}

export const SYSTEM_TEMPLATES: ISystemTemplateDef[] = [
  // --- HR TEMPLATES ---
  {
    name: 'Candidate Profile',
    category: 'hr',
    description: 'Track candidate applications, resumes, interviews, and ratings',
    icon: 'UserCheck',
    color: '#ec4899',
    fields: [
      { name: 'Candidate Name', type: 'text', required: true, position: 0 },
      { name: 'Email', type: 'email', required: true, position: 1 },
      { name: 'Phone', type: 'phone', position: 2 },
      { name: 'Position Applied', type: 'text', required: true, position: 3 },
      { name: 'Department', type: 'select', options: ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Operations', 'Finance'], position: 4 },
      { name: 'Experience (Years)', type: 'number', position: 5 },
      { name: 'Resume URL', type: 'url', position: 6 },
      { name: 'LinkedIn', type: 'url', position: 7 },
      { name: 'GitHub / Portfolio', type: 'url', position: 8 },
      { name: 'Interview Status', type: 'select', options: ['Applied', 'Screening', 'Technical Round', 'Managerial', 'Offer Extended', 'Hired', 'Rejected'], defaultValue: 'Applied', position: 9 },
      { name: 'Interview Date', type: 'date', position: 10 },
      { name: 'Recruiter', type: 'user', position: 11 },
      { name: 'Expected Salary', type: 'currency', currencyCode: 'USD', position: 12 },
      { name: 'Rating', type: 'rating', maxRating: 5, defaultValue: 4, position: 13 },
      { name: 'Notes', type: 'longText', position: 14 }
    ]
  },
  {
    name: 'Employee Record',
    category: 'hr',
    description: 'Manage staff profiles, designations, managers, and status',
    icon: 'Users',
    color: '#8b5cf6',
    fields: [
      { name: 'Employee Name', type: 'text', required: true, position: 0 },
      { name: 'Employee ID', type: 'text', required: true, position: 1 },
      { name: 'Work Email', type: 'email', required: true, position: 2 },
      { name: 'Phone', type: 'phone', position: 3 },
      { name: 'Department', type: 'select', options: ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Executive'], position: 4 },
      { name: 'Designation', type: 'text', position: 5 },
      { name: 'Manager', type: 'user', position: 6 },
      { name: 'Joining Date', type: 'date', position: 7 },
      { name: 'Employment Status', type: 'select', options: ['Full-Time', 'Part-Time', 'Contract', 'Intern', 'On Leave'], defaultValue: 'Full-Time', position: 8 },
      { name: 'Location / Work Mode', type: 'select', options: ['Remote', 'Hybrid', 'On-Site'], defaultValue: 'Hybrid', position: 9 },
      { name: 'Notes', type: 'longText', position: 10 }
    ]
  },
  {
    name: 'Interview Assessment',
    category: 'hr',
    description: 'Score candidates with structured feedback, strengths, and recommendations',
    icon: 'ClipboardCheck',
    color: '#06b6d4',
    fields: [
      { name: 'Candidate Name', type: 'text', required: true, position: 0 },
      { name: 'Interview Round', type: 'select', options: ['Initial Screen', 'Tech Assessment', 'System Design', 'Behavioral', 'Executive'], defaultValue: 'Tech Assessment', position: 1 },
      { name: 'Interviewer', type: 'user', position: 2 },
      { name: 'Interview Date', type: 'date', position: 3 },
      { name: 'Score', type: 'rating', maxRating: 5, defaultValue: 4, position: 4 },
      { name: 'Strengths', type: 'longText', position: 5 },
      { name: 'Areas of Improvement', type: 'longText', position: 6 },
      { name: 'Recommendation', type: 'select', options: ['Strong Hire', 'Hire', 'Leaning Hire', 'Hold', 'No Hire'], defaultValue: 'Hire', position: 7 },
      { name: 'Detailed Feedback', type: 'markdown', position: 8 }
    ]
  },
  {
    name: 'Employee Onboarding',
    category: 'hr',
    description: 'Checklist and milestone tracking for new hire equipment and access',
    icon: 'UserPlus',
    color: '#10b981',
    fields: [
      { name: 'New Hire Name', type: 'text', required: true, position: 0 },
      { name: 'Joining Date', type: 'date', position: 1 },
      { name: 'Department', type: 'select', options: ['Engineering', 'Product', 'Marketing', 'Sales', 'HR', 'Finance'], position: 2 },
      { name: 'Assigned Buddy / Mentor', type: 'user', position: 3 },
      { name: 'Email Account Created', type: 'boolean', defaultValue: false, position: 4 },
      { name: 'Hardware / Laptop Dispatched', type: 'boolean', defaultValue: false, position: 5 },
      { name: 'GitHub / Workspace Access Granted', type: 'boolean', defaultValue: false, position: 6 },
      { name: 'HR Documentation Submitted', type: 'boolean', defaultValue: false, position: 7 },
      { name: 'Onboarding Status', type: 'select', options: ['Pending', 'In Progress', 'Completed'], defaultValue: 'In Progress', position: 8 },
      { name: 'Onboarding Notes', type: 'longText', position: 9 }
    ]
  },

  // --- PRODUCT MANAGER TEMPLATES ---
  {
    name: 'Product Idea',
    category: 'pm',
    description: 'Capture, score, and prioritize user-driven feature opportunities',
    icon: 'Lightbulb',
    color: '#f59e0b',
    fields: [
      { name: 'Idea Title', type: 'text', required: true, position: 0 },
      { name: 'Problem Statement', type: 'longText', required: true, position: 1 },
      { name: 'Proposed Solution', type: 'longText', position: 2 },
      { name: 'Target Audience', type: 'text', position: 3 },
      { name: 'Product Area', type: 'select', options: ['Core Platform', 'Authentication', 'Analytics', 'Billing', 'Mobile', 'Integrations'], position: 4 },
      { name: 'Estimated Impact', type: 'select', options: ['Low', 'Medium', 'High', 'Very High'], defaultValue: 'High', position: 5 },
      { name: 'Estimated Effort', type: 'select', options: ['XS (<1 wk)', 'S (1-2 wks)', 'M (1 mo)', 'L (1 quarter)'], defaultValue: 'S (1-2 wks)', position: 6 },
      { name: 'Status', type: 'select', options: ['Backlog', 'Under Review', 'Prioritized', 'In Spec', 'Deferred', 'Declined'], defaultValue: 'Backlog', position: 7 },
      { name: 'Reference URLs', type: 'url', position: 8 }
    ]
  },
  {
    name: 'Feature Requirement (PRD)',
    category: 'pm',
    description: 'Detailed specification with acceptance criteria, mockups, and goals',
    icon: 'FileText',
    color: '#6366f1',
    fields: [
      { name: 'Feature Name', type: 'text', required: true, position: 0 },
      { name: 'Product Owner', type: 'user', position: 1 },
      { name: 'Goal & Success Metric', type: 'longText', position: 2 },
      { name: 'Priority', type: 'select', options: ['P0 - Blocker', 'P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Nice to have'], defaultValue: 'P2 - High', position: 3 },
      { name: 'Target Release Date', type: 'date', position: 4 },
      { name: 'Figma / Design URL', type: 'url', position: 5 },
      { name: 'Status', type: 'select', options: ['Drafting', 'Review', 'Approved', 'In Development', 'Testing', 'Shipped'], defaultValue: 'Drafting', position: 6 },
      { name: 'Acceptance Criteria', type: 'markdown', position: 7 },
      { name: 'Technical Notes', type: 'longText', position: 8 }
    ]
  },
  {
    name: 'Customer Feedback',
    category: 'pm',
    description: 'Track customer insights, sentiment, requests, and feature links',
    icon: 'MessageSquare',
    color: '#3b82f6',
    fields: [
      { name: 'Customer / Account', type: 'text', required: true, position: 0 },
      { name: 'Feedback Summary', type: 'longText', required: true, position: 1 },
      { name: 'Product Area', type: 'select', options: ['UI/UX', 'Performance', 'Integrations', 'Billing', 'Reliability', 'Feature Request'], position: 2 },
      { name: 'Urgency', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'], defaultValue: 'Medium', position: 3 },
      { name: 'Feedback Source', type: 'select', options: ['Support Ticket', 'Sales Call', 'Survey', 'Community', 'Intercom', 'Email'], position: 4 },
      { name: 'Feedback Date', type: 'date', position: 5 },
      { name: 'Related Feature', type: 'relation', position: 6 },
      { name: 'Status', type: 'select', options: ['New', 'Under Review', 'Action Planned', 'Resolved', 'Closed'], defaultValue: 'New', position: 7 }
    ]
  },
  {
    name: 'Competitor Research',
    category: 'pm',
    description: 'Analyze competitors, features, pricing models, and SWOT comparison',
    icon: 'Crosshair',
    color: '#ef4444',
    fields: [
      { name: 'Competitor Name', type: 'text', required: true, position: 0 },
      { name: 'Website', type: 'url', position: 1 },
      { name: 'Pricing Model', type: 'text', position: 2 },
      { name: 'Key Strengths', type: 'longText', position: 3 },
      { name: 'Weaknesses / Gaps', type: 'longText', position: 4 },
      { name: 'Threat Level', type: 'select', options: ['Low', 'Moderate', 'High', 'Direct Competitor'], defaultValue: 'Moderate', position: 5 },
      { name: 'Rating', type: 'rating', maxRating: 5, defaultValue: 3, position: 6 },
      { name: 'Analysis Notes', type: 'markdown', position: 7 }
    ]
  },

  // --- FOUNDER & CEO TEMPLATES ---
  {
    name: 'Business Idea & Model',
    category: 'founder',
    description: 'Validate market size, unit economics, revenue potential, and pitch',
    icon: 'Sparkles',
    color: '#8b5cf6',
    fields: [
      { name: 'Venture Name', type: 'text', required: true, position: 0 },
      { name: 'Problem & Opportunity', type: 'longText', required: true, position: 1 },
      { name: 'Solution Overview', type: 'longText', position: 2 },
      { name: 'Target Market (TAM/SAM)', type: 'text', position: 3 },
      { name: 'Monetization Model', type: 'select', options: ['SaaS Subscription', 'Usage-Based', 'Marketplace Fee', 'Enterprise License', 'Freemium'], position: 4 },
      { name: 'Validation Stage', type: 'select', options: ['Ideation', 'Customer Interviews', 'MVP Building', 'Alpha Testing', 'Generating Revenue'], defaultValue: 'Ideation', position: 5 },
      { name: 'Pitch Deck / Doc URL', type: 'url', position: 6 },
      { name: 'Strategic Notes', type: 'markdown', position: 7 }
    ]
  },
  {
    name: 'Investor CRM',
    category: 'founder',
    description: 'Manage fundraising pipeline, meetings, check sizes, and follow-ups',
    icon: 'DollarSign',
    color: '#10b981',
    fields: [
      { name: 'Firm / Investor Name', type: 'text', required: true, position: 0 },
      { name: 'Lead Partner', type: 'text', position: 1 },
      { name: 'Email', type: 'email', position: 2 },
      { name: 'LinkedIn / Website', type: 'url', position: 3 },
      { name: 'Stage Focus', type: 'select', options: ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth', 'Angel'], defaultValue: 'Seed', position: 4 },
      { name: 'Target Check Size', type: 'currency', currencyCode: 'USD', position: 5 },
      { name: 'Pipeline Status', type: 'select', options: ['Identified', 'Intro Sent', 'First Meeting', 'Partner Pitch', 'Due Diligence', 'Term Sheet', 'Committed', 'Passed'], defaultValue: 'Identified', position: 6 },
      { name: 'Next Follow-up Date', type: 'date', position: 7 },
      { name: 'Meeting Notes', type: 'longText', position: 8 }
    ]
  },
  {
    name: 'Company Strategic Goal (OKR)',
    category: 'ceo',
    description: 'Track objectives, key metrics, owners, deadlines, and current progress',
    icon: 'Target',
    color: '#f97316',
    fields: [
      { name: 'Objective', type: 'text', required: true, position: 0 },
      { name: 'Goal Owner', type: 'user', position: 1 },
      { name: 'Department', type: 'select', options: ['Company-wide', 'Engineering', 'Product', 'Sales', 'Growth', 'Operations'], position: 2 },
      { name: 'Target Metric', type: 'text', position: 3 },
      { name: 'Target Deadline', type: 'date', position: 4 },
      { name: 'Priority', type: 'select', options: ['Must Win', 'High', 'Medium'], defaultValue: 'Must Win', position: 5 },
      { name: 'Status', type: 'select', options: ['On Track', 'At Risk', 'Behind', 'Achieved'], defaultValue: 'On Track', position: 6 },
      { name: 'Key Results & Progress', type: 'markdown', position: 7 }
    ]
  },
  {
    name: 'Strategic Partnership',
    category: 'ceo',
    description: 'Manage external alliances, integration partners, and agreements',
    icon: 'Handshake',
    color: '#3b82f6',
    fields: [
      { name: 'Partner Organization', type: 'text', required: true, position: 0 },
      { name: 'Primary Contact', type: 'text', position: 1 },
      { name: 'Email', type: 'email', position: 2 },
      { name: 'Partnership Type', type: 'select', options: ['Technology / API', 'Co-Marketing', 'Distribution', 'Reseller', 'Vendor'], position: 3 },
      { name: 'Status', type: 'select', options: ['Initial Discussion', 'Scoping', 'Agreement Drafting', 'Active Partner', 'On Hold'], defaultValue: 'Initial Discussion', position: 4 },
      { name: 'Agreement URL', type: 'url', position: 5 },
      { name: 'Next Step Date', type: 'date', position: 6 },
      { name: 'Partnership Scope', type: 'longText', position: 7 }
    ]
  },

  // --- TEAM LEAD TEMPLATES ---
  {
    name: 'Team Member Profile',
    category: 'lead',
    description: 'Track skills, current projects, availability, and growth goals',
    icon: 'User',
    color: '#06b6d4',
    fields: [
      { name: 'Member Name', type: 'text', required: true, position: 0 },
      { name: 'Role / Specialty', type: 'text', position: 1 },
      { name: 'Associated User', type: 'user', position: 2 },
      { name: 'Primary Skills', type: 'text', position: 3 },
      { name: 'Current Project', type: 'text', position: 4 },
      { name: 'Availability', type: 'select', options: ['Full Bandwidth', 'Partial (50%)', 'Overloaded', 'On Leave'], defaultValue: 'Full Bandwidth', position: 5 },
      { name: 'Growth Goals & 1-on-1 Notes', type: 'longText', position: 6 }
    ]
  },
  {
    name: 'Sprint Planning & Review',
    category: 'lead',
    description: 'Manage 2-week sprint cycles, velocity, blockers, and retro outcomes',
    icon: 'Zap',
    color: '#eab308',
    fields: [
      { name: 'Sprint Name', type: 'text', required: true, position: 0 },
      { name: 'Sprint Lead', type: 'user', position: 1 },
      { name: 'Start Date', type: 'date', required: true, position: 2 },
      { name: 'End Date', type: 'date', required: true, position: 3 },
      { name: 'Sprint Goal', type: 'longText', position: 4 },
      { name: 'Status', type: 'select', options: ['Planning', 'Active', 'Review', 'Completed'], defaultValue: 'Active', position: 5 },
      { name: 'Committed Points', type: 'number', position: 6 },
      { name: 'Completed Points', type: 'number', position: 7 },
      { name: 'Retrospective Highlights', type: 'markdown', position: 8 }
    ]
  },

  // --- SENIOR DEVELOPER & ENGINEERING TEMPLATES ---
  {
    name: 'Reusable Code Snippet',
    category: 'dev',
    description: 'Save production snippets, helper hooks, scripts, and algorithms',
    icon: 'Code',
    color: '#10b981',
    fields: [
      { name: 'Snippet Title', type: 'text', required: true, position: 0 },
      { name: 'Programming Language', type: 'select', options: ['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'SQL', 'Bash', 'CSS', 'HTML', 'JSON'], defaultValue: 'TypeScript', position: 1 },
      { name: 'Code Snippet', type: 'code', position: 2 },
      { name: 'Use Case & Description', type: 'longText', position: 3 },
      { name: 'Documentation Reference', type: 'url', position: 4 }
    ]
  },
  {
    name: 'API Endpoint Spec',
    category: 'dev',
    description: 'Document REST/GraphQL endpoints, payloads, auth, and sample responses',
    icon: 'Globe',
    color: '#6366f1',
    fields: [
      { name: 'Endpoint Name', type: 'text', required: true, position: 0 },
      { name: 'HTTP Method', type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], defaultValue: 'GET', position: 1 },
      { name: 'Path', type: 'text', required: true, position: 2 },
      { name: 'Auth Type', type: 'select', options: ['Bearer JWT', 'API Key', 'Session Cookie', 'Public'], defaultValue: 'Bearer JWT', position: 3 },
      { name: 'Environment URL', type: 'url', position: 4 },
      { name: 'Example Request Payload', type: 'json', position: 5 },
      { name: 'Example Response', type: 'json', position: 6 },
      { name: 'Endpoint Description', type: 'markdown', position: 7 }
    ]
  },
  {
    name: 'Bug & Issue Report',
    category: 'dev',
    description: 'Track reproduction steps, error logs, root causes, and fixes',
    icon: 'Bug',
    color: '#ef4444',
    fields: [
      { name: 'Issue Summary', type: 'text', required: true, position: 0 },
      { name: 'Severity', type: 'select', options: ['Blocker', 'Critical', 'Major', 'Minor', 'Trivial'], defaultValue: 'Major', position: 1 },
      { name: 'Assigned Engineer', type: 'user', position: 2 },
      { name: 'Environment', type: 'select', options: ['Production', 'Staging', 'Development', 'Local'], defaultValue: 'Production', position: 3 },
      { name: 'Status', type: 'select', options: ['Open', 'Investigating', 'Fix in Progress', 'In Review', 'Resolved', 'Cannot Reproduce'], defaultValue: 'Open', position: 4 },
      { name: 'Error Message / Stack Trace', type: 'code', position: 5 },
      { name: 'Reproduction Steps', type: 'markdown', position: 6 },
      { name: 'Root Cause & Resolution', type: 'longText', position: 7 }
    ]
  },
  {
    name: 'Architecture Decision Record (ADR)',
    category: 'dev',
    description: 'Document technical architectural decisions, trade-offs, and rationale',
    icon: 'Cpu',
    color: '#a855f7',
    fields: [
      { name: 'Decision Title', type: 'text', required: true, position: 0 },
      { name: 'Decision Owner', type: 'user', position: 1 },
      { name: 'Decision Date', type: 'date', position: 2 },
      { name: 'Status', type: 'select', options: ['Proposed', 'Accepted', 'Superseded', 'Deprecated', 'Rejected'], defaultValue: 'Accepted', position: 3 },
      { name: 'Context & Problem Statement', type: 'markdown', position: 4 },
      { name: 'Options Considered', type: 'markdown', position: 5 },
      { name: 'Chosen Solution & Rationale', type: 'markdown', position: 6 },
      { name: 'Consequences & Trade-offs', type: 'markdown', position: 7 }
    ]
  },

  // --- CLIENT PROJECT & DELIVERY TEMPLATES ---
  {
    name: 'Client Project Master',
    category: 'pm',
    description: 'Master project metadata, budget, client details, timelines, and repositories',
    icon: 'Briefcase',
    color: '#6366f1',
    fields: [
      { name: 'Project Name', type: 'text', required: true, position: 0 },
      { name: 'Client Organization', type: 'text', required: true, position: 1 },
      { name: 'Project Manager', type: 'user', position: 2 },
      { name: 'Product Manager', type: 'user', position: 3 },
      { name: 'Team Lead', type: 'user', position: 4 },
      { name: 'Project Type', type: 'select', options: ['SaaS', 'Mobile App', 'Enterprise Web', 'Internal Tool', 'API Platform'], defaultValue: 'SaaS', position: 5 },
      { name: 'Status', type: 'select', options: ['Discovery', 'In Progress', 'Testing', 'Staging Demo', 'Launched', 'On Hold'], defaultValue: 'In Progress', position: 6 },
      { name: 'Priority', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], defaultValue: 'High', position: 7 },
      { name: 'Start Date', type: 'date', position: 8 },
      { name: 'Target Launch', type: 'date', position: 9 },
      { name: 'Budget', type: 'currency', currencyCode: 'INR', position: 10 },
      { name: 'Team Size', type: 'number', position: 11 },
      { name: 'Client Website', type: 'url', position: 12 },
      { name: 'Repository URL', type: 'url', position: 13 },
      { name: 'Documentation URL', type: 'url', position: 14 }
    ]
  },
  {
    name: 'Client Requirement',
    category: 'pm',
    description: 'Structured functional requirement with acceptance criteria, business value and release',
    icon: 'CheckSquare',
    color: '#06b6d4',
    fields: [
      { name: 'Requirement ID', type: 'text', required: true, position: 0 },
      { name: 'Title', type: 'text', required: true, position: 1 },
      { name: 'Requirement Type', type: 'select', options: ['Feature', 'Enhancement', 'Security', 'Performance', 'Integration'], defaultValue: 'Feature', position: 2 },
      { name: 'Requested By', type: 'text', position: 3 },
      { name: 'Priority', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], defaultValue: 'High', position: 4 },
      { name: 'Status', type: 'select', options: ['Draft', 'Under Review', 'Approved', 'In Progress', 'Done', 'Rejected'], defaultValue: 'Approved', position: 5 },
      { name: 'Module', type: 'select', options: ['Dashboard', 'Tenant Management', 'Property Management', 'Room Management', 'Rent & Payments', 'Complaints', 'Staff', 'Reports', 'Auth & Security'], position: 6 },
      { name: 'Description', type: 'longText', position: 7 },
      { name: 'Acceptance Criteria', type: 'markdown', position: 8 },
      { name: 'Business Value', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], defaultValue: 'High', position: 9 },
      { name: 'Target Release', type: 'text', defaultValue: 'Version 1.0', position: 10 }
    ]
  },
  {
    name: 'Project Task & Sprint Item',
    category: 'lead',
    description: 'Sprint task with assignee, mentor/reviewer, estimate, priority, and PR reference',
    icon: 'CheckCircle2',
    color: '#10b981',
    fields: [
      { name: 'Task ID', type: 'text', required: true, position: 0 },
      { name: 'Task Title', type: 'text', required: true, position: 1 },
      { name: 'Assignee', type: 'user', position: 2 },
      { name: 'Reviewer', type: 'user', position: 3 },
      { name: 'Sprint', type: 'text', defaultValue: 'Sprint 01', position: 4 },
      { name: 'Priority', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], defaultValue: 'High', position: 5 },
      { name: 'Status', type: 'select', options: ['Backlog', 'To Do', 'In Progress', 'In Review', 'Completed', 'Blocked'], defaultValue: 'In Progress', position: 6 },
      { name: 'Start Date', type: 'date', position: 7 },
      { name: 'Due Date', type: 'date', position: 8 },
      { name: 'Estimated Hours', type: 'number', position: 9 },
      { name: 'Pull Request URL', type: 'url', position: 10 },
      { name: 'Task Description', type: 'markdown', position: 11 }
    ]
  },
  {
    name: 'Meeting & Decision Note',
    category: 'general',
    description: 'Track client and sprint meetings, participants, agenda, and action decisions',
    icon: 'Video',
    color: '#8b5cf6',
    fields: [
      { name: 'Meeting Title', type: 'text', required: true, position: 0 },
      { name: 'Meeting Type', type: 'select', options: ['Client Kickoff', 'Client Demo', 'Sprint Planning', 'Sprint Retro', 'Architecture Review', 'Daily Standup'], defaultValue: 'Sprint Planning', position: 1 },
      { name: 'Meeting Date', type: 'date', position: 2 },
      { name: 'Participants', type: 'text', position: 3 },
      { name: 'Agenda', type: 'longText', position: 4 },
      { name: 'Decisions Made', type: 'markdown', position: 5 },
      { name: 'Action Items', type: 'markdown', position: 6 },
      { name: 'Next Meeting Date', type: 'date', position: 7 }
    ]
  },
  {
    name: 'Deployment & Infrastructure',
    category: 'dev',
    description: 'DevOps environment configuration, cloud hosting, CI/CD, and endpoints',
    icon: 'Server',
    color: '#f97316',
    fields: [
      { name: 'Environment', type: 'select', options: ['Production', 'Staging', 'Development', 'QA'], defaultValue: 'Staging', position: 0 },
      { name: 'DevOps Lead', type: 'user', position: 1 },
      { name: 'Cloud Provider', type: 'text', defaultValue: 'AWS', position: 2 },
      { name: 'Frontend Hosting', type: 'text', defaultValue: 'Vercel', position: 3 },
      { name: 'Backend Hosting', type: 'text', defaultValue: 'AWS ECS', position: 4 },
      { name: 'Database', type: 'text', defaultValue: 'MongoDB Atlas', position: 5 },
      { name: 'CI/CD Pipeline', type: 'text', defaultValue: 'GitHub Actions', position: 6 },
      { name: 'Domain / Live URL', type: 'url', position: 7 },
      { name: 'Status', type: 'select', options: ['Active', 'Maintenance', 'Deploying', 'Inactive'], defaultValue: 'Active', position: 8 },
      { name: 'Deployment Notes', type: 'markdown', position: 9 }
    ]
  },
  {
    name: 'Security & Compliance',
    category: 'dev',
    description: 'Production security controls, authentication specs, and vulnerability safeguards',
    icon: 'ShieldCheck',
    color: '#ec4899',
    fields: [
      { name: 'Security Area', type: 'text', required: true, position: 0 },
      { name: 'Authentication Spec', type: 'text', defaultValue: 'Access + Refresh Tokens (HTTP-only)', position: 1 },
      { name: 'Password Hashing', type: 'text', defaultValue: 'Argon2 / Bcrypt', position: 2 },
      { name: 'Authorization Model', type: 'text', defaultValue: 'RBAC (Role Based Access Control)', position: 3 },
      { name: 'Rate Limiting Enabled', type: 'boolean', defaultValue: true, position: 4 },
      { name: 'Input Validation / Sanitization', type: 'boolean', defaultValue: true, position: 5 },
      { name: 'Status', type: 'select', options: ['Compliant', 'Pending Review', 'In Progress', 'Action Required'], defaultValue: 'Compliant', position: 6 },
      { name: 'Security Details', type: 'markdown', position: 7 }
    ]
  }
];

export interface IStarterPackDef {
  id: string;
  name: string;
  roleTitle: string;
  category: string;
  icon: string;
  color: string;
  description: string;
  suggestedTopics: Array<{
    name: string;
    description: string;
    icon: string;
    color: string;
    defaultView: 'cards' | 'table' | 'compact' | 'detailed' | 'calendar';
    defaultTemplateName?: string;
  }>;
}

export const STARTER_PACKS: IStarterPackDef[] = [
  {
    id: 'pack_personal',
    name: 'Personal Knowledge & Vault',
    roleTitle: 'Individual',
    category: 'personal',
    icon: 'Folder',
    color: '#6366f1',
    description: 'Clean personal workspace for bookmarks, notes, tools, and research',
    suggestedTopics: [
      { name: 'AI Tools & Resources', description: 'Curated models, prompts, and APIs', icon: 'Bot', color: '#6366f1', defaultView: 'cards' },
      { name: 'Developer Bookmarks', description: 'Docs, guides, repos, and cheat sheets', icon: 'Code', color: '#10b981', defaultView: 'cards' },
      { name: 'Projects & Ideas', description: 'Side projects, notes, and milestones', icon: 'Briefcase', color: '#f59e0b', defaultView: 'table' }
    ]
  },
  {
    id: 'pack_hr',
    name: 'Human Resources & Talent',
    roleTitle: 'HR & Recruiters',
    category: 'hr',
    icon: 'Users',
    color: '#ec4899',
    description: 'Candidate pipelines, employee directories, interview scoring, and onboarding',
    suggestedTopics: [
      { name: 'Recruitment & Candidates', description: 'Active candidate pipeline and resumes', icon: 'UserCheck', color: '#ec4899', defaultView: 'table', defaultTemplateName: 'Candidate Profile' },
      { name: 'Employees Directory', description: 'Staff profiles, designations, and contacts', icon: 'Users', color: '#8b5cf6', defaultView: 'table', defaultTemplateName: 'Employee Record' },
      { name: 'Interview Feedback', description: 'Structured interview scores and recommendations', icon: 'ClipboardCheck', color: '#06b6d4', defaultView: 'cards', defaultTemplateName: 'Interview Assessment' },
      { name: 'Onboarding Checklists', description: 'Equipment, accesses, and new hire tasks', icon: 'UserPlus', color: '#10b981', defaultView: 'table', defaultTemplateName: 'Employee Onboarding' }
    ]
  },
  {
    id: 'pack_pm',
    name: 'Product Management Hub',
    roleTitle: 'Product Managers',
    category: 'pm',
    icon: 'Kanban',
    color: '#3b82f6',
    description: 'Product backlog, feature specifications, customer feedback, and competitors',
    suggestedTopics: [
      { name: 'Product Ideas & Backlog', description: 'Feature opportunities and scoring', icon: 'Lightbulb', color: '#f59e0b', defaultView: 'cards', defaultTemplateName: 'Product Idea' },
      { name: 'Feature Requirements (PRD)', description: 'Specs, mockups, acceptance criteria', icon: 'FileText', color: '#6366f1', defaultView: 'table', defaultTemplateName: 'Feature Requirement (PRD)' },
      { name: 'Customer Insights & Feedback', description: 'Customer pain points and requests', icon: 'MessageSquare', color: '#3b82f6', defaultView: 'table', defaultTemplateName: 'Customer Feedback' },
      { name: 'Competitor Intelligence', description: 'Competitor analysis and market research', icon: 'Crosshair', color: '#ef4444', defaultView: 'cards', defaultTemplateName: 'Competitor Research' }
    ]
  },
  {
    id: 'pack_engineering',
    name: 'Engineering & Architecture',
    roleTitle: 'Senior Developers & Leads',
    category: 'dev',
    icon: 'Cpu',
    color: '#10b981',
    description: 'Code snippets, API endpoints, bug tracker, sprint review, and ADRs',
    suggestedTopics: [
      { name: 'Active Projects & Tasks', description: 'Sprint deliverables and milestones', icon: 'FolderGit2', color: '#10b981', defaultView: 'table' },
      { name: 'Bug & Issue Tracker', description: 'Reproduction steps and fixes', icon: 'Bug', color: '#ef4444', defaultView: 'table', defaultTemplateName: 'Bug & Issue Report' },
      { name: 'API Specifications', description: 'Endpoints, payloads, and auth schemas', icon: 'Globe', color: '#6366f1', defaultView: 'cards', defaultTemplateName: 'API Endpoint Spec' },
      { name: 'Architecture Decisions (ADRs)', description: 'System design choices and rationale', icon: 'Cpu', color: '#a855f7', defaultView: 'cards', defaultTemplateName: 'Architecture Decision Record (ADR)' },
      { name: 'Reusable Code Snippets', description: 'Production snippets and utilities', icon: 'Code', color: '#f59e0b', defaultView: 'cards', defaultTemplateName: 'Reusable Code Snippet' }
    ]
  },
  {
    id: 'pack_executive',
    name: 'Founders & Executive Command',
    roleTitle: 'Founders & CEOs',
    category: 'founder',
    icon: 'Target',
    color: '#8b5cf6',
    description: 'Strategic OKRs, investor relations, ventures, and key partnerships',
    suggestedTopics: [
      { name: 'Strategic Goals & OKRs', description: 'Company-wide objectives and key results', icon: 'Target', color: '#f97316', defaultView: 'table', defaultTemplateName: 'Company Strategic Goal (OKR)' },
      { name: 'Investor Pipeline & CRM', description: 'Fundraising stages and check sizes', icon: 'DollarSign', color: '#10b981', defaultView: 'table', defaultTemplateName: 'Investor CRM' },
      { name: 'Ventures & Business Ideas', description: 'Business models and market validation', icon: 'Sparkles', color: '#8b5cf6', defaultView: 'cards', defaultTemplateName: 'Business Idea & Model' },
      { name: 'Strategic Partnerships', description: 'Alliances and key contracts', icon: 'Handshake', color: '#3b82f6', defaultView: 'table', defaultTemplateName: 'Strategic Partnership' }
    ]
  },
  {
    id: 'pack_client_project',
    name: 'Client Project – SaaS Delivery',
    roleTitle: 'Project & Engineering Teams',
    category: 'client_project',
    icon: 'Briefcase',
    color: '#6366f1',
    description: 'Complete PG Platform & SaaS lifecycle: requirements, team tasks, bugs, HR, architecture, and client demo',
    suggestedTopics: [
      { name: '01 Project Overview', description: 'Master project metadata, scope, timeline & budget', icon: 'Briefcase', color: '#6366f1', defaultView: 'table', defaultTemplateName: 'Client Project Master' },
      { name: '02 Client Requirements', description: 'Feature specifications, SRS and acceptance criteria', icon: 'CheckSquare', color: '#06b6d4', defaultView: 'table', defaultTemplateName: 'Client Requirement' },
      { name: '03 Product Management', description: 'Product vision, feature backlog and roadmap', icon: 'Kanban', color: '#3b82f6', defaultView: 'cards', defaultTemplateName: 'Feature Requirement (PRD)' },
      { name: '04 UI UX Design', description: 'Figma mockups, design tokens and UI components', icon: 'Palette', color: '#ec4899', defaultView: 'cards' },
      { name: '05 Frontend Development', description: 'React screens, state management and PR branches', icon: 'Layout', color: '#10b981', defaultView: 'table' },
      { name: '06 Backend Development', description: 'Node/Express REST APIs and auth endpoints', icon: 'Server', color: '#6366f1', defaultView: 'cards', defaultTemplateName: 'API Endpoint Spec' },
      { name: '07 Database', description: 'MongoDB collections, indexes and schema designs', icon: 'Database', color: '#8b5cf6', defaultView: 'cards' },
      { name: '08 QA & Testing', description: 'Test suites, staging test cases and bug reports', icon: 'CheckCircle2', color: '#f59e0b', defaultView: 'table', defaultTemplateName: 'Bug & Issue Report' },
      { name: '09 DevOps & Deployment', description: 'AWS, Vercel, ECS, CI/CD pipeline and staging URLs', icon: 'Cloud', color: '#3b82f6', defaultView: 'cards', defaultTemplateName: 'Deployment & Infrastructure' },
      { name: '10 HR & Recruitment', description: 'Open positions, candidates, interviews and hiring', icon: 'Users', color: '#ec4899', defaultView: 'table', defaultTemplateName: 'Candidate Profile' },
      { name: '11 Team Management', description: 'Team roles, developer bandwidth and mentoring', icon: 'UserCheck', color: '#10b981', defaultView: 'table', defaultTemplateName: 'Team Member Profile' },
      { name: '12 Meetings', description: 'Sprint reviews, client syncs and standup notes', icon: 'Video', color: '#8b5cf6', defaultView: 'cards', defaultTemplateName: 'Meeting & Decision Note' },
      { name: '13 Client Communication', description: 'Approvals, feedback notes and demo questions', icon: 'MessageSquare', color: '#06b6d4', defaultView: 'table' },
      { name: '14 Technical Documentation', description: 'Architecture decisions (ADRs) and system security', icon: 'Cpu', color: '#a855f7', defaultView: 'cards', defaultTemplateName: 'Architecture Decision Record (ADR)' },
      { name: '15 Project Tasks', description: 'Sprint tasks, assignees, deadlines and status', icon: 'Layers', color: '#6366f1', defaultView: 'table', defaultTemplateName: 'Project Task & Sprint Item' },
      { name: '16 Bugs & Issues', description: 'Issue tracker with severity, reproduction and assigned fix', icon: 'Bug', color: '#ef4444', defaultView: 'table', defaultTemplateName: 'Bug & Issue Report' },
      { name: '17 Product Roadmap', description: 'Quarterly milestones and target versions (V1.0, V1.1)', icon: 'TrendingUp', color: '#f97316', defaultView: 'cards' },
      { name: '18 Security', description: 'RBAC policies, token rotation and input validation specs', icon: 'ShieldCheck', color: '#ec4899', defaultView: 'table', defaultTemplateName: 'Security & Compliance' },
      { name: '19 Project Reports', description: 'Sprint velocity, bug resolution rate and client summaries', icon: 'FileBarChart', color: '#10b981', defaultView: 'cards' }
    ]
  }
];
