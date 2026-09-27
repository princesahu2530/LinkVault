import React from 'react';
import * as Icons from 'lucide-react';

export function IconRenderer({ name, className = 'w-4 h-4', style = {} }) {
  if (!name) {
    return <Icons.Folder className={className} style={style} />;
  }

  // If name is an emoji
  if (/\p{Extended_Pictographic}/u.test(name)) {
    return <span className={`inline-flex items-center justify-center ${className}`}>{name}</span>;
  }

  const IconComponent = Icons[name] || Icons.Folder;
  return <IconComponent className={className} style={style} />;
}
