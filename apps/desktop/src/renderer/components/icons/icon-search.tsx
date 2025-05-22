import { IconPickerItem } from '@/renderer/components/icons/icon-picker-item';
import { useQuery } from '@/renderer/hooks/use-query';

interface IconSearchProps {
  query: string;
}

export const IconSearch = ({ query }: IconSearchProps) => {
  const { data } = useQuery({
    type: 'icon_search',
    query,
    count: 100,
  });

  const icons = data ?? [];

  return (
    <div className="grid w-full min-w-full grid-cols-10 gap-1">
      <div className="col-span-full flex items-center py-1 pl-1 text-sm text-muted-foreground">
        <p>Search results for &quot;{query}&quot;</p>
      </div>
      {icons.map((icon) => (
        <IconPickerItem key={icon.id} icon={icon} />
      ))}
    </div>
  );
};
