import { RecordNode, RelationFieldAttributes } from '@colanode/core';
import { X } from 'lucide-react';
import React from 'react';

import { RecordSearch } from '../record-search';

import { Avatar } from '@/renderer/components/avatars/avatar';
import { Badge } from '@/renderer/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/renderer/components/ui/popover';
import { Separator } from '@/renderer/components/ui/separator';
import { useRecord } from '@/renderer/contexts/record';
import { useWorkspace } from '@/renderer/contexts/workspace';
import { useQueries } from '@/renderer/hooks/use-queries';

interface RecordRelationValueProps {
  field: RelationFieldAttributes;
  readOnly?: boolean;
}

const RelationBadge = ({ record }: { record: RecordNode }) => {
  const name = record.attributes.name ?? 'Unnamed';
  return (
    <div className="flex flex-row items-center gap-1">
      <Avatar
        id={record.id}
        name={name}
        avatar={record.attributes.avatar}
        size="small"
      />
      <p className="text-sm line-clamp-1 w-full">{name}</p>
    </div>
  );
};

export const RecordRelationValue = ({
  field,
  readOnly,
}: RecordRelationValueProps) => {
  const workspace = useWorkspace();
  const record = useRecord();

  const [open, setOpen] = React.useState(false);

  const relationIds = record.getRelationValue(field) ?? [];
  const results = useQueries(
    relationIds.map((id) => ({
      type: 'node_get',
      nodeId: id,
      accountId: workspace.accountId,
      workspaceId: workspace.id,
    }))
  );

  const relations: RecordNode[] = [];
  for (const result of results) {
    if (result.data && result.data.type === 'record') {
      relations.push(result.data);
    }
  }

  if (!field.databaseId) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex h-full w-full cursor-pointer flex-wrap gap-1 p-0 overflow-hidden">
          {relations.slice(0, 1).map((relation) => (
            <RelationBadge key={relation.id} record={relation} />
          ))}
          {relations.length === 0 && ' '}
          {relations.length > 1 && (
            <Badge
              variant="outline"
              className="ml-2 text-xs px-1 text-muted-foreground"
            >
              +{relations.length - 1}
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-1">
        <div className="flex flex-col flex-wrap gap-2 p-2">
          {relations.length > 0 ? (
            <React.Fragment>
              {relations.map((relation) => (
                <div
                  key={relation.id}
                  className="flex w-full flex-row items-center gap-2"
                >
                  <RelationBadge record={relation} />
                  {record.canEdit && !readOnly && (
                    <X
                      className="size-4 cursor-pointer"
                      onClick={() => {
                        if (!record.canEdit || readOnly) return;

                        const newRelations = relationIds.filter(
                          (id) => id !== relation.id
                        );

                        if (newRelations.length === 0) {
                          record.removeFieldValue(field);
                        } else {
                          record.updateFieldValue(field, {
                            type: 'string_array',
                            value: newRelations,
                          });
                        }
                      }}
                    />
                  )}
                </div>
              ))}
              <Separator className="w-full my-2" />
            </React.Fragment>
          ) : (
            <p className="text-sm text-muted-foreground">No relations</p>
          )}
        </div>
        {record.canEdit && !readOnly && (
          <RecordSearch
            databaseId={field.databaseId}
            exclude={relationIds}
            onSelect={(selectedRecord) => {
              if (!record.canEdit || readOnly) return;

              const newRelations = relationIds.includes(selectedRecord.id)
                ? relationIds.filter((id) => id !== selectedRecord.id)
                : [...relationIds, selectedRecord.id];

              if (newRelations.length === 0) {
                record.removeFieldValue(field);
              } else {
                record.updateFieldValue(field, {
                  type: 'string_array',
                  value: newRelations,
                });
              }

              setOpen(false);
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  );
};
