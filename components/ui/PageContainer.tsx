import { ReactNode } from 'react';
import Breadcrumb, { BreadcrumbItem } from './Breadcrumb';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
  background?: 'gray' | 'white';
}

export default function PageContainer({ 
  children, 
  title, 
  description, 
  breadcrumbs, 
  className = "",
  background = 'gray'
}: PageContainerProps) {
  const bgClass = background === 'gray' ? 'bg-gray-50' : 'bg-white';
  
  return (
    <div className={`bg-gray-50 dark:bg-slate-800 flex-1 pt-0 flex xl:pt-36`}>
      <div className="max-w-6xl flex-1 mx-auto px-4 py-6">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb items={breadcrumbs} />
        )}
        
        {(title || description) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-3xl font-bold mb-2 text-gray-900">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-gray-600">
                {description}
              </p>
            )}
          </div>
        )}

        <div className={`h-full ${className}`}>
          {children}
        </div>
      </div>
    </div>
  );
}