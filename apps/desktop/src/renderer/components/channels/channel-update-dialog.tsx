import { NodeRole, hasNodeRole } from '@colanode/core';

import { LocalChannelNode } from '@/shared/types/nodes';
import { ChannelForm } from '@/renderer/components/channels/channel-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/renderer/components/ui/dialog';
import { useWorkspace } from '@/renderer/contexts/workspace';
import { useMutation } from '@/renderer/hooks/use-mutation';
import { toast } from '@/renderer/hooks/use-toast';

interface ChannelUpdateDialogProps {
  channel: LocalChannelNode;
  role: NodeRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChannelUpdateDialog = ({
  channel,
  role,
  open,
  onOpenChange,
}: ChannelUpdateDialogProps) => {
  const workspace = useWorkspace();
  const { mutate, isPending } = useMutation();
  const canEdit = hasNodeRole(role, 'editor');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update channel</DialogTitle>
          <DialogDescription>
            Update the channel name and icon
          </DialogDescription>
        </DialogHeader>
        <ChannelForm
          id={channel.id}
          values={{
            name: channel.attributes.name,
            avatar: channel.attributes.avatar,
          }}
          isPending={isPending}
          submitText="Update"
          readOnly={!canEdit}
          handleCancel={() => {
            onOpenChange(false);
          }}
          handleSubmit={(values) => {
            if (isPending) {
              return;
            }

            mutate({
              input: {
                type: 'channel_update',
                channelId: channel.id,
                name: values.name,
                avatar: values.avatar,
                accountId: workspace.accountId,
                workspaceId: workspace.id,
              },
              onSuccess() {
                onOpenChange(false);
                toast({
                  title: 'Channel updated',
                  description: 'Channel was updated successfully',
                  variant: 'default',
                });
              },
              onError(error) {
                toast({
                  title: 'Failed to update channel',
                  description: error.message,
                  variant: 'destructive',
                });
              },
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
