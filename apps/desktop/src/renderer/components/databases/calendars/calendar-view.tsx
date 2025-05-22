import React from 'react';

import { CalendarViewGrid } from '@/renderer/components/databases/calendars/calendar-view-grid';
import { CalendarViewSettings } from '@/renderer/components/databases/calendars/calendar-view-settings';
import { ViewFilterButton } from '@/renderer/components/databases/search/view-filter-button';
import { ViewSearchBar } from '@/renderer/components/databases/search/view-search-bar';
import { ViewSortButton } from '@/renderer/components/databases/search/view-sort-button';
import { ViewTabs } from '@/renderer/components/databases/view-tabs';
import { useDatabase } from '@/renderer/contexts/database';
import { useDatabaseView } from '@/renderer/contexts/database-view';

export const CalendarView = () => {
  const database = useDatabase();
  const view = useDatabaseView();

  const groupByField = database.fields.find(
    (field) => field.id === view.groupBy
  );

  if (!groupByField) {
    return null;
  }

  return (
    <React.Fragment>
      <div className="flex flex-row justify-between border-b">
        <ViewTabs />
        <div className="invisible flex flex-row items-center justify-end group-hover/database:visible">
          <CalendarViewSettings />
          <ViewSortButton />
          <ViewFilterButton />
        </div>
      </div>
      <ViewSearchBar />
      <div className="mt-2 w-full min-w-full max-w-full overflow-auto pr-5">
        <CalendarViewGrid field={groupByField} />
      </div>
    </React.Fragment>
  );
};
