import { Avatar } from '@/renderer/components/avatars/avatar';
import { useWorkspace } from '@/renderer/contexts/workspace';
import { useQuery } from '@/renderer/hooks/use-query';
import { useRadar } from '@/renderer/contexts/radar';
import { UnreadBadge } from '@/renderer/components/ui/unread-badge';
import { LocalChannelNode } from '@/shared/types/nodes';

interface ChannelContainerTabProps {
  channelId: string;
  isActive: boolean;
}

export const ChannelContainerTab = ({
  channelId,
  isActive,
}: ChannelContainerTabProps) => {
  const workspace = useWorkspace();
  const radar = useRadar();

  const { data, isPending } = useQuery({
    type: 'node_get',
    nodeId: channelId,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
  });

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  const channel = data as LocalChannelNode;
  if (!channel) {
    return <p className="text-sm text-muted-foreground">Not found</p>;
  }

  const name =
    channel.attributes.name && channel.attributes.name.length > 0
      ? channel.attributes.name
      : 'Unnamed';

  const unreadState = radar.getNodeState(
    workspace.accountId,
    workspace.id,
    channel.id
  );

  return (
    <div className="flex items-center space-x-2">
      <Avatar
        size="small"
        id={channel.id}
        name={name}
        avatar={channel.attributes.avatar}
      />
      <span>{name}</span>
      {!isActive && (
        <UnreadBadge
          count={unreadState.unreadCount}
          unread={unreadState.hasUnread}
        />
      )}
    </div>
  );
};
