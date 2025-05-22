import { Avatar } from '@/renderer/components/avatars/avatar';
import { LocalChannelNode } from '@/shared/types/nodes';

interface ChannelBreadcrumbItemProps {
  channel: LocalChannelNode;
}

export const ChannelBreadcrumbItem = ({
  channel,
}: ChannelBreadcrumbItemProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Avatar
        id={channel.id}
        name={channel.attributes.name}
        avatar={channel.attributes.avatar}
        className="size-4"
      />
      <span>{channel.attributes.name}</span>
    </div>
  );
};
