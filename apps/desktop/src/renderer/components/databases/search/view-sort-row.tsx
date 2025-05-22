import { FieldAttributes, DatabaseViewSortAttributes } from '@colanode/core';
import { ChevronDown, Trash2 } from 'lucide-react';

import { FieldIcon } from '@/renderer/components/databases/fields/field-icon';
import { Button } from '@/renderer/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/renderer/components/ui/dropdown-menu';
import { useDatabaseView } from '@/renderer/contexts/database-view';

interface ViewSortProps {
  sort: DatabaseViewSortAttributes;
  field: FieldAttributes;
}

export const ViewSortRow = ({ sort, field }: ViewSortProps) => {
  const view = useDatabaseView();

  return (
    <div className="flex flex-row items-center gap-3 text-sm">
      <div className="flex flex-row items-center gap-0.5 p-1">
        <FieldIcon type={field.type} className="size-4" />
        <p>{field.name}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex flex-grow flex-row items-center gap-1 rounded-md p-1 font-semibold hover:cursor-pointer hover:bg-gray-100">
            <p>{sort.direction === 'asc' ? 'Ascending' : 'Descending'}</p>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              view.updateSort(sort.id, {
                ...sort,
                direction: 'asc',
              });
            }}
          >
            <p>Ascending</p>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              view.updateSort(sort.id, {
                ...sort,
                direction: 'desc',
              });
            }}
          >
            <p>Descending</p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          view.removeSort(sort.id);
        }}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
};
