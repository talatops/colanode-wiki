import { extractNodeRole, isSameDay } from '@colanode/core';
import { Plus } from 'lucide-react';

import { CalendarViewRecordCard } from '@/renderer/components/databases/calendars/calendar-view-record-card';
import { RecordProvider } from '@/renderer/components/records/record-provider';
import { useDatabase } from '@/renderer/contexts/database';
import { useWorkspace } from '@/renderer/contexts/workspace';
import { cn } from '@/shared/lib/utils';
import { LocalRecordNode } from '@/shared/types/nodes';

interface CalendarViewDayProps {
  date: Date;
  month: Date;
  records: LocalRecordNode[];
  onCreate?: () => void;
}

export const CalendarViewDay = ({
  date,
  month,
  records,
  onCreate,
}: CalendarViewDayProps) => {
  const workspace = useWorkspace();
  const database = useDatabase();

  const isToday = isSameDay(date, new Date());
  const dateMonth = date.getMonth();
  const displayMonth = month.getMonth();
  const isOutside = dateMonth !== displayMonth;

  return (
    <div className="animate-fade-in group/calendar-day flex h-full w-full flex-col gap-1">
      <div
        className={cn(
          'flex w-full justify-end text-sm',
          isOutside ? 'text-muted-foreground' : ''
        )}
      >
        {onCreate && (
          <div className="flex-grow">
            <Plus
              className="size-4 cursor-pointer opacity-0 group-hover/calendar-day:opacity-100"
              onClick={onCreate}
            />
          </div>
        )}
        <p className={isToday ? 'rounded-md bg-red-500 p-0.5 text-white' : ''}>
          {date.getDate()}
        </p>
      </div>
      {records.map((record) => {
        const role = extractNodeRole(record, workspace.userId) ?? database.role;

        return (
          <RecordProvider key={record.id} record={record} role={role}>
            <CalendarViewRecordCard />
          </RecordProvider>
        );
      })}
    </div>
  );
};
