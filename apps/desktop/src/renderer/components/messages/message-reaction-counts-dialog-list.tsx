import React from 'react';
import { InView } from 'react-intersection-observer';

import { Avatar } from '@/renderer/components/avatars/avatar';
import { useWorkspace } from '@/renderer/contexts/workspace';
import { useQueries } from '@/renderer/hooks/use-queries';
import { NodeReactionCount, LocalMessageNode } from '@/shared/types/nodes';
import { NodeReactionListQueryInput } from '@/shared/queries/nodes/node-reaction-list';

const REACTIONS_PER_PAGE = 20;

interface MessageReactionCountsDialogListProps {
  message: LocalMessageNode;
  reactionCount: NodeReactionCount;
}

export const MessageReactionCountsDialogList = ({
  message,
  reactionCount,
}: MessageReactionCountsDialogListProps) => {
  const workspace = useWorkspace();

  const [lastPage, setLastPage] = React.useState<number>(1);
  const inputs: NodeReactionListQueryInput[] = Array.from({
    length: lastPage,
  }).map((_, i) => ({
    type: 'node_reaction_list',
    nodeId: message.id,
    reaction: reactionCount.reaction,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
    page: i + 1,
    count: REACTIONS_PER_PAGE,
  }));

  const result = useQueries(inputs);
  const reactions = result.flatMap((data) => data.data ?? []);
  const isPending = result.some((data) => data.isPending);
  const hasMore =
    !isPending && reactions.length === lastPage * REACTIONS_PER_PAGE;

  const userIds = reactions?.map((reaction) => reaction.collaboratorId) ?? [];

  const results = useQueries(
    userIds.map((userId) => ({
      type: 'user_get',
      accountId: workspace.accountId,
      workspaceId: workspace.id,
      userId,
    }))
  );

  const users = results
    .filter((result) => result.data !== null)
    .map((result) => result.data!);

  return (
    <div className="flex flex-col gap-2">
      {users.map((user) => (
        <div key={user.id} className="flex items-center space-x-3">
          <Avatar
            id={user.id}
            name={user.name}
            avatar={user.avatar}
            className="size-5"
          />
          <p className="flex-grow text-sm font-medium leading-none">
            {user.name}
          </p>
        </div>
      ))}
      <InView
        rootMargin="200px"
        onChange={(inView) => {
          if (inView && hasMore && !isPending) {
            setLastPage(lastPage + 1);
          }
        }}
      ></InView>
    </div>
  );
};
