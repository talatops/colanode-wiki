import {
  extractNodeRole,
  SelectFieldAttributes,
  SelectOptionAttributes,
  DatabaseViewFilterAttributes,
} from '@colanode/core';

import { BoardViewRecordCard } from '@/renderer/components/databases/boards/board-view-record-card';
import { BoardViewRecordCreateCard } from '@/renderer/components/databases/boards/board-view-record-create-card';
import { RecordProvider } from '@/renderer/components/records/record-provider';
import { useDatabase } from '@/renderer/contexts/database';
import { useDatabaseView } from '@/renderer/contexts/database-view';
import { useWorkspace } from '@/renderer/contexts/workspace';
import { useRecordsQuery } from '@/renderer/hooks/use-records-query';

interface BoardViewColumnRecordsProps {
  field: SelectFieldAttributes;
  option: SelectOptionAttributes;
}

export const BoardViewColumnRecords = ({
  field,
  option,
}: BoardViewColumnRecordsProps) => {
  const workspace = useWorkspace();
  const database = useDatabase();
  const view = useDatabaseView();

  const filter: DatabaseViewFilterAttributes = {
    id: '1',
    type: 'field',
    fieldId: field.id,
    operator: 'is_in',
    value: [option.id],
  };

  const filters: DatabaseViewFilterAttributes[] = [...view.filters, filter];

  const { records } = useRecordsQuery(filters, view.sorts);
  return (
    <div className="mt-3 flex flex-col gap-2">
      {records.map((record) => {
        const role = extractNodeRole(record, workspace.userId) ?? database.role;

        return (
          <RecordProvider key={record.id} record={record} role={role}>
            <BoardViewRecordCard />
          </RecordProvider>
        );
      })}
      <BoardViewRecordCreateCard filters={filters} />
    </div>
  );
};
