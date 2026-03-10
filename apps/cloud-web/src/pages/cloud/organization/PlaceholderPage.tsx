import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { useLocation } from 'react-router-dom';

// Formats a path segment into a readable title (e.g. "business-units" → "Business Units")
function formatTitle(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Generic placeholder page that derives its title from the current route
export const PlaceholderPage = () => {
  const { pathname } = useLocation();
  const lastSegment = pathname.split('/').filter(Boolean).pop() ?? '';
  const title = formatTitle(lastSegment);

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={`${title} page coming soon.`} />
    </div>
  );
};
