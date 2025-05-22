import { NodeRole, hasNodeRole } from '@colanode/core';
import { Copy, Settings, Trash2 } from 'lucide-react';
import React from 'react';

import { NodeCollaboratorAudit } from '@/renderer/components/collaborators/node-collaborator-audit';
import { RecordDeleteDialog } from '@/renderer/components/records/record-delete-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/renderer/components/ui/dropdown-menu';
import { useWorkspace } from '@/renderer/contexts/workspace';
import { LocalRecordNode } from '@/shared/types/nodes';

interface RecordSettingsProps {
  record: LocalRecordNode;
  role: NodeRole;
}

export const RecordSettings = ({ record, role }: RecordSettingsProps) => {
  const workspace = useWorkspace();
  const [showDeleteDialog, setShowDeleteModal] = React.useState(false);
  const canDelete =
    record.createdBy === workspace.userId || hasNodeRole(role, 'editor');

  return (
    <React.Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Settings className="size-4 cursor-pointer text-muted-foreground hover:text-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" className="mr-2 w-80">
          <DropdownMenuLabel>{record.attributes.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center gap-2" disabled>
            <Copy className="size-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => {
              if (!canDelete) {
                return;
              }

              setShowDeleteModal(true);
            }}
            disabled={!canDelete}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Created by</DropdownMenuLabel>
          <DropdownMenuItem>
            <NodeCollaboratorAudit
              collaboratorId={record.createdBy}
              date={record.createdAt}
            />
          </DropdownMenuItem>
          {record.updatedBy && record.updatedAt && (
            <React.Fragment>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Last updated by</DropdownMenuLabel>
              <DropdownMenuItem>
                <NodeCollaboratorAudit
                  collaboratorId={record.updatedBy}
                  date={record.updatedAt}
                />
              </DropdownMenuItem>
            </React.Fragment>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <RecordDeleteDialog
        recordId={record.id}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteModal}
      />
    </React.Fragment>
  );
};
