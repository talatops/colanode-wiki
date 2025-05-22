import { RecordNode } from '@colanode/core';
import isHotkey from 'is-hotkey';
import { SquareArrowOutUpRight } from 'lucide-react';
import React, { Fragment } from 'react';

import { Spinner } from '@/renderer/components/ui/spinner';
import { useWorkspace } from '@/renderer/contexts/workspace';
import { useMutation } from '@/renderer/hooks/use-mutation';
import { useLayout } from '@/renderer/contexts/layout';
import { toast } from '@/renderer/hooks/use-toast';

interface NameEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

const NameEditor = ({ initialValue, onSave, onCancel }: NameEditorProps) => {
  const [value, setValue] = React.useState(initialValue ?? '');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleBlur = () => {
    if (value === initialValue) {
      onCancel();
    } else {
      onSave(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isHotkey('enter', e)) {
      e.preventDefault();
      onSave(value);
    } else if (isHotkey('esc', e)) {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="flex h-full w-full cursor-text flex-row items-center gap-1 p-1 text-sm"
    />
  );
};

interface TableViewNameCellProps {
  record: RecordNode;
}

export const TableViewNameCell = ({ record }: TableViewNameCellProps) => {
  const workspace = useWorkspace();
  const layout = useLayout();
  const [isEditing, setIsEditing] = React.useState(false);

  const { mutate, isPending } = useMutation();
  const canEdit = true;
  const hasName = record.attributes.name && record.attributes.name.length > 0;

  const handleSave = (newName: string) => {
    if (newName === record.attributes.name) return;

    mutate({
      input: {
        type: 'record_name_update',
        name: newName,
        recordId: record.id,
        accountId: workspace.accountId,
        workspaceId: workspace.id,
      },
      onSuccess() {
        setIsEditing(false);
      },
      onError(error) {
        toast({
          title: 'Failed to update record',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className="group relative flex h-full w-full items-center">
      {isEditing ? (
        <NameEditor
          initialValue={record.attributes.name ?? ''}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <Fragment>
          <div
            onClick={() => canEdit && setIsEditing(true)}
            className="flex h-full w-full cursor-pointer flex-row items-center gap-1 p-1 text-sm"
          >
            {hasName ? (
              <span className="truncate">{record.attributes.name}</span>
            ) : (
              <span className="text-muted-foreground">Unnamed</span>
            )}
          </div>
          <button
            type="button"
            className="absolute right-2 flex h-6 cursor-pointer flex-row items-center gap-1 rounded-md border bg-white p-1 text-sm text-muted-foreground opacity-0 hover:bg-gray-50 group-hover:opacity-100"
            onClick={() => {
              layout.previewLeft(record.id, true);
            }}
          >
            <SquareArrowOutUpRight className="mr-1 size-4" /> <p>Open</p>
          </button>
          {isPending && (
            <span className="absolute right-2 text-muted-foreground">
              <Spinner size="small" />
            </span>
          )}
        </Fragment>
      )}
    </div>
  );
};
