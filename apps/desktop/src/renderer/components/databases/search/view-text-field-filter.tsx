import {
  TextFieldAttributes,
  DatabaseViewFieldFilterAttributes,
} from '@colanode/core';
import { ChevronDown, Trash2 } from 'lucide-react';

import { FieldIcon } from '@/renderer/components/databases/fields/field-icon';
import { Button } from '@/renderer/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/renderer/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/renderer/components/ui/popover';
import { SmartTextInput } from '@/renderer/components/ui/smart-text-input';
import { useDatabaseView } from '@/renderer/contexts/database-view';
import { textFieldFilterOperators } from '@/shared/lib/databases';

interface ViewTextFieldFilterProps {
  field: TextFieldAttributes;
  filter: DatabaseViewFieldFilterAttributes;
}

export const ViewTextFieldFilter = ({
  field,
  filter,
}: ViewTextFieldFilterProps) => {
  const view = useDatabaseView();

  const operator =
    textFieldFilterOperators.find(
      (operator) => operator.value === filter.operator
    ) ?? textFieldFilterOperators[0];

  if (!operator) {
    return null;
  }

  const textValue = filter.value as string | null;

  const hideInput =
    operator.value === 'is_empty' || operator.value === 'is_not_empty';

  return (
    <Popover
      open={view.isFieldFilterOpened(filter.id)}
      onOpenChange={(open) => {
        if (open) {
          view.openFieldFilter(filter.id);
        } else {
          view.closeFieldFilter(filter.id);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-dashed text-xs text-muted-foreground"
        >
          {field.name}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-96 flex-col gap-2 p-2">
        <div className="flex flex-row items-center gap-3 text-sm">
          <div className="flex flex-row items-center gap-0.5 p-1">
            <FieldIcon type={field.type} className="size-4" />
            <p>{field.name}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex flex-grow flex-row items-center gap-1 rounded-md p-1 font-semibold hover:cursor-pointer hover:bg-gray-100">
                <p>{operator.label}</p>
                <ChevronDown className="size-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {textFieldFilterOperators.map((operator) => (
                <DropdownMenuItem
                  key={operator.value}
                  onSelect={() => {
                    const value =
                      operator.value === 'is_empty' ||
                      operator.value === 'is_not_empty'
                        ? null
                        : textValue;

                    view.updateFilter(filter.id, {
                      ...filter,
                      operator: operator.value,
                      value: value,
                    });
                  }}
                >
                  {operator.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              view.removeFilter(filter.id);
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
        {!hideInput && (
          <SmartTextInput
            value={textValue}
            onChange={(value) => {
              view.updateFilter(filter.id, {
                ...filter,
                value: value,
              });
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  );
};
