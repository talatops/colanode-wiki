import { CircleX } from 'lucide-react';

import { useWorkspace } from '@/renderer/contexts/workspace';
import { useQuery } from '@/renderer/hooks/use-query';
import { LocalMessageNode } from '@/shared/types/nodes';

interface MessageReplyBannerProps {
  message: LocalMessageNode;
  onCancel: () => void;
}

export const MessageReplyBanner = ({
  message,
  onCancel,
}: MessageReplyBannerProps) => {
  const workspace = useWorkspace();
  const { data } = useQuery({
    type: 'user_get',
    accountId: workspace.accountId,
    workspaceId: workspace.id,
    userId: message.createdBy,
  });

  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-row items-center justify-between rounded-t-lg border-b-2 bg-gray-100 p-2 text-foreground">
      <p className="text-sm">
        Replying to <span className="font-semibold">{data.name}</span>
      </p>
      <button className="cursor-pointer" onClick={onCancel}>
        <CircleX className="size-4" />
      </button>
    </div>
  );
};
