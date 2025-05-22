import React from 'react';

import { ViewFilters } from '@/renderer/components/databases/search/view-filters';
import { ViewSorts } from '@/renderer/components/databases/search/view-sorts';
import { Separator } from '@/renderer/components/ui/separator';
import { useDatabaseView } from '@/renderer/contexts/database-view';

export const ViewSearchBar = () => {
  const view = useDatabaseView();

  if (!view.isSearchBarOpened) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-row items-center gap-2">
      {view.sorts.length > 0 && (
        <React.Fragment>
          <ViewSorts />
          <Separator orientation="vertical" className="mx-1 h-4" />
        </React.Fragment>
      )}
      <ViewFilters />
    </div>
  );
};
