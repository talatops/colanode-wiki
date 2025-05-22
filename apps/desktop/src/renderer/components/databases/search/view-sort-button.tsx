import { ArrowDownAz } from 'lucide-react';

import { ViewSortAddPopover } from '@/renderer/components/databases/search/view-sort-add-popover';
import { useDatabaseView } from '@/renderer/contexts/database-view';

export const ViewSortButton = () => {
  const view = useDatabaseView();

  if (view.sorts.length > 0) {
    return (
      <button
        className="flex cursor-pointer items-center rounded-md p-1.5 hover:bg-gray-50"
        onClick={() => view.openSearchBar()}
      >
        <ArrowDownAz className="size-4" />
      </button>
    );
  }

  return (
    <ViewSortAddPopover>
      <button className="flex cursor-pointer items-center rounded-md p-1.5 hover:bg-gray-50">
        <ArrowDownAz className="size-4" />
      </button>
    </ViewSortAddPopover>
  );
};
