export type FieldType =
  | 'text'
  | 'longText'
  | 'url'
  | 'email'
  | 'phone'
  | 'currency'
  | 'rating'
  | 'number'
  | 'date'
  | 'boolean'
  | 'select'
  | 'multiSelect'
  | 'code'
  | 'markdown'
  | 'json'
  | 'relation'
  | 'user';

export interface IItemField {
  fieldId: string;
  name: string;
  type: FieldType;
  value: any;
  options?: string[]; // for select, multiSelect
  relationTopicId?: string; // for relation fields
  relationMultiple?: boolean; // for relation fields
  currencyCode?: string; // for currency fields (USD, EUR, INR, etc.)
  maxRating?: number; // for rating fields (default 5)
  position: number;
  required?: boolean;
  visible?: boolean;
}

export interface ITemplateField {
  name: string;
  type: FieldType;
  options?: string[];
  relationTopicId?: string;
  relationMultiple?: boolean;
  currencyCode?: string;
  maxRating?: number;
  required?: boolean;
  position: number;
  defaultValue?: any;
}

export interface ITaskProperties {
  isTask?: boolean;
  status?: 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  assigneeName?: string;
  startDate?: Date | string | null;
  dueDate?: Date | string | null;
  reminderDate?: Date | string | null;
  completed?: boolean;
  progress?: number; // 0 to 100
  dependencies?: string[]; // Item IDs
}

export const ITEM_LIMITS = {
  MAX_TITLE_LENGTH: 300,
  MAX_CONTENT_LENGTH: 100000,
  MAX_FIELD_NAME_LENGTH: 100,
  MAX_FIELDS_PER_ITEM: 50,
  MAX_TAGS_PER_ITEM: 30,
  MAX_TEXT_LENGTH: 10000,
  MAX_LONG_TEXT_LENGTH: 100000,
  MAX_SELECT_OPTIONS: 50,
  MAX_JSON_DEPTH: 10,
  MAX_BULK_ITEMS: 100
};

