import { IconPickerCategoryRow } from '@/shared/types/icons';

interface IconBrowserCategoryProps {
  row: IconPickerCategoryRow;
  style: React.CSSProperties;
}

export const IconBrowserCategory = ({
  row,
  style,
}: IconBrowserCategoryProps) => {
  return (
    <div
      className="flex items-center pl-1 text-sm text-muted-foreground"
      style={style}
    >
      <p>{row.category}</p>
    </div>
  );
};
