import React from 'react';
import { ExternalLink } from 'lucide-react';

type TableActionsProps = {
  slug: string;
};

const TableActions: React.FC<TableActionsProps> = ({ slug }) => {
  return (
    <div className="flex items-center space-x-2">
      <a
        href={`/category/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1 text-purple-600 hover:text-purple-800"
        title="View on site"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
};

export default TableActions;
