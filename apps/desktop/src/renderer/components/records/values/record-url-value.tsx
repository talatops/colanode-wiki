import { isValidUrl, UrlFieldAttributes } from '@colanode/core';
import { ExternalLink } from 'lucide-react';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/renderer/components/ui/hover-card';
import { SmartTextInput } from '@/renderer/components/ui/smart-text-input';
import { useRecord } from '@/renderer/contexts/record';
import { cn } from '@/shared/lib/utils';

interface RecordUrlValueProps {
  field: UrlFieldAttributes;
  readOnly?: boolean;
}

export const RecordUrlValue = ({ field, readOnly }: RecordUrlValueProps) => {
  const record = useRecord();

  const url = record.getUrlValue(field);
  const canOpen = url && isValidUrl(url);

  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger>
        <SmartTextInput
          value={url}
          readOnly={!record.canEdit || readOnly}
          onChange={(newValue) => {
            if (!record.canEdit || readOnly) return;

            if (newValue === url) {
              return;
            }

            if (newValue === null || newValue === '') {
              record.removeFieldValue(field);
            } else {
              record.updateFieldValue(field, {
                type: 'string',
                value: newValue,
              });
            }
          }}
          className="flex h-full w-full cursor-pointer flex-row items-center gap-1 border-none p-0 text-sm focus-visible:cursor-text"
        />
      </HoverCardTrigger>
      <HoverCardContent
        className={cn(
          'flex w-full min-w-80 max-w-128 flex-row items-center justify-between gap-2 overflow-hidden',
          !canOpen && 'hidden'
        )}
      >
        <a
          className="text-blue-500 underline hover:cursor-pointer hover:text-blue-600 text-ellipsis w-full overflow-hidden whitespace-nowrap"
          onClick={() => {
            if (!canOpen) return;

            window.colanode.executeCommand({
              type: 'url_open',
              url,
            });
          }}
        >
          {url}
        </a>
        <ExternalLink className="size-4 min-h-4 min-w-4 text-muted-foreground" />
      </HoverCardContent>
    </HoverCard>
  );
};
