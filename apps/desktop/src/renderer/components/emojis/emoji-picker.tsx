import React from 'react';

import { EmojiBrowser } from '@/renderer/components/emojis/emoji-browser';
import { EmojiSearch } from '@/renderer/components/emojis/emoji-search';
import { EmojiSkinToneSelector } from '@/renderer/components/emojis/emoji-skin-tone-selector';
import { EmojiPickerContext } from '@/renderer/contexts/emoji-picker';
import { Emoji } from '@/shared/types/emojis';

interface EmojiPickerProps {
  onPick: (emoji: Emoji, skinTone: number) => void;
}

export const EmojiPicker = ({ onPick }: EmojiPickerProps) => {
  const [query, setQuery] = React.useState('');
  const [skinTone, setSkinTone] = React.useState(0);

  return (
    <div className="flex flex-col gap-1 p-1">
      <div className="flex flex-row items-center gap-1">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-md bg-gray-100 p-2 text-xs focus:outline-none"
        />
        <EmojiSkinToneSelector
          skinTone={skinTone}
          onSkinToneChange={setSkinTone}
        />
      </div>
      <div className="h-[280px] min-h-[280px] overflow-auto w-[330px] min-w-[330px]">
        <EmojiPickerContext.Provider
          value={{
            skinTone,
            onPick: (emoji) => onPick(emoji, skinTone),
          }}
        >
          {query.length > 2 ? <EmojiSearch query={query} /> : <EmojiBrowser />}
        </EmojiPickerContext.Provider>
      </div>
    </div>
  );
};
