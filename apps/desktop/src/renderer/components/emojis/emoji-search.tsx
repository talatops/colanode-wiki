import { EmojiPickerItem } from '@/renderer/components/emojis/emoji-picker-item';
import { useQuery } from '@/renderer/hooks/use-query';

interface EmojiSearchProps {
  query: string;
}

export const EmojiSearch = ({ query }: EmojiSearchProps) => {
  const { data } = useQuery({
    type: 'emoji_search',
    query,
    count: 100,
  });

  const emojis = data ?? [];

  return (
    <div className="grid w-full min-w-full grid-cols-10 gap-1">
      <div className="col-span-full flex items-center py-1 pl-1 text-sm text-muted-foreground">
        <p>Search results for &quot;{query}&quot;</p>
      </div>
      {emojis.map((emoji) => (
        <EmojiPickerItem key={emoji.id} emoji={emoji} />
      ))}
    </div>
  );
};
