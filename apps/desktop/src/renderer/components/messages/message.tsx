import { InView } from 'react-intersection-observer';

import { MessageActions } from '@/renderer/components/messages/message-actions';
import { MessageAuthorAvatar } from '@/renderer/components/messages/message-author-avatar';
import { MessageAuthorName } from '@/renderer/components/messages/message-author-name';
import { MessageContent } from '@/renderer/components/messages/message-content';
import { MessageReactionCounts } from '@/renderer/components/messages/message-reaction-counts';
import { MessageTime } from '@/renderer/components/messages/message-time';
import { MessageReference } from '@/renderer/components/messages/message-reference';
import { useRadar } from '@/renderer/contexts/radar';
import { useWorkspace } from '@/renderer/contexts/workspace';
import { LocalMessageNode } from '@/shared/types/nodes';

interface MessageProps {
  message: LocalMessageNode;
  previousMessage?: LocalMessageNode | null;
}

const shouldDisplayAuthor = (
  message: LocalMessageNode,
  previousMessage?: LocalMessageNode | null
) => {
  if (!previousMessage) {
    return true;
  }

  const previousMessageDate = new Date(previousMessage.createdAt);
  const currentMessageDate = new Date(message.createdAt);

  if (previousMessageDate.getDate() !== currentMessageDate.getDate()) {
    return true;
  }

  return previousMessage.createdBy !== message.createdBy;
};

export const Message = ({ message, previousMessage }: MessageProps) => {
  const workspace = useWorkspace();
  const radar = useRadar();
  const displayAuthor = shouldDisplayAuthor(message, previousMessage);

  return (
    <div
      id={`message-${message.id}`}
      key={`message-${message.id}`}
      className={`group flex flex-row px-1 hover:bg-gray-50 ${
        displayAuthor ? 'mt-2 first:mt-0' : ''
      }`}
    >
      <div className="mr-2 w-10 pt-1">
        {displayAuthor && <MessageAuthorAvatar message={message} />}
      </div>

      <div className="relative w-full">
        {displayAuthor && (
          <div className="flex flex-row items-center gap-0.5">
            <MessageAuthorName message={message} />
            <MessageTime message={message} />
          </div>
        )}
        <InView
          rootMargin="50px"
          onChange={(inView) => {
            if (inView) {
              radar.markNodeAsSeen(
                workspace.accountId,
                workspace.id,
                message.id
              );
            }
          }}
        >
          <MessageActions message={message} />
          {message.attributes.referenceId && (
            <MessageReference messageId={message.attributes.referenceId} />
          )}
          <MessageContent message={message} />
          <MessageReactionCounts message={message} />
        </InView>
      </div>
    </div>
  );
};
