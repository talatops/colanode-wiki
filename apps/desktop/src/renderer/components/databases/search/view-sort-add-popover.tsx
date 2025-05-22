import React from 'react';

import { FieldIcon } from '@/renderer/components/databases/fields/field-icon';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/renderer/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/renderer/components/ui/popover';
import { useDatabase } from '@/renderer/contexts/database';
import { useDatabaseView } from '@/renderer/contexts/database-view';
import { isSortableField } from '@/shared/lib/databases';

interface ViewSortAddPopoverProps {
  children: React.ReactNode;
}

export const ViewSortAddPopover = ({ children }: ViewSortAddPopoverProps) => {
  const database = useDatabase();
  const view = useDatabaseView();

  const [open, setOpen] = React.useState(false);
  const sortableFields = database.fields.filter(
    (field) =>
      isSortableField(field) &&
      !view.sorts.some((sort) => sort.fieldId === field.id)
  );

  if (sortableFields.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-96 p-1">
        <Command className="min-h-min">
          <CommandInput placeholder="Search fields..." className="h-9" />
          <CommandEmpty>No sortable field found.</CommandEmpty>
          <CommandList>
            <CommandGroup className="h-min">
              {sortableFields.map((field) => (
                <CommandItem
                  key={field.id}
                  onSelect={() => {
                    view.initFieldSort(field.id, 'asc');
                    setOpen(false);
                  }}
                >
                  <div className="flex w-full flex-row items-center gap-2">
                    <FieldIcon type={field.type} className="size-4" />
                    <p>{field.name}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
