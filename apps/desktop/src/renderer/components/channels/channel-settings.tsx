import { NodeRole, hasNodeRole } from '@colanode/core';
import { Copy, Image, LetterText, Settings, Trash2 } from 'lucide-react';
import React from 'react';

import { ChannelDeleteDialog } from '@/renderer/components/channels/channel-delete-dialog';
import { ChannelUpdateDialog } from '@/renderer/components/channels/channel-update-dialog';
import { NodeCollaboratorAudit } from '@/renderer/components/collaborators/node-collaborator-audit';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/renderer/components/ui/dropdown-menu';
import { LocalChannelNode } from '@/shared/types/nodes';

interface ChannelSettingsProps {
  channel: LocalChannelNode;
  role: NodeRole;
}

export const ChannelSettings = ({ channel, role }: ChannelSettingsProps) => {
  const [showUpdateDialog, setShowUpdateDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteModal] = React.useState(false);

  const canEdit = hasNodeRole(role, 'editor');
  const canDelete = hasNodeRole(role, 'editor');

  return (
    <React.Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Settings className="size-4 cursor-pointer text-muted-foreground hover:text-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" className="mr-2 w-80">
          <DropdownMenuLabel>{channel.attributes.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => {
              if (!canEdit) {
                return;
              }

              setShowUpdateDialog(true);
            }}
            disabled={!canEdit}
          >
            <LetterText className="size-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2"
            disabled={!canEdit}
            onClick={() => {
              if (!canEdit) {
                return;
              }

              setShowUpdateDialog(true);
            }}
          >
            <Image className="size-4" />
            Update icon
          </DropdownMenuItem>
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
              collaboratorId={channel.createdBy}
              date={channel.createdAt}
            />
          </DropdownMenuItem>
          {channel.updatedBy && channel.updatedAt && (
            <React.Fragment>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Last updated by</DropdownMenuLabel>
              <DropdownMenuItem>
                <NodeCollaboratorAudit
                  collaboratorId={channel.updatedBy}
                  date={channel.updatedAt}
                />
              </DropdownMenuItem>
            </React.Fragment>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <ChannelDeleteDialog
        channelId={channel.id}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteModal}
      />
      <ChannelUpdateDialog
        channel={channel}
        role={role}
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
      />
    </React.Fragment>
  );
};
