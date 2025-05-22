import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { IconPickerRowData } from '@/shared/types/icons';
import { IconBrowserItems } from '@/renderer/components/icons/icon-browser-items';
import { IconBrowserCategory } from '@/renderer/components/icons/icon-browser-category';
import { useQuery } from '@/renderer/hooks/use-query';

const ICONS_PER_ROW = 10;

export const IconBrowser = () => {
  const { data } = useQuery({
    type: 'icon_category_list',
  });

  const categories = data ?? [];
  const rowDataArray = React.useMemo<IconPickerRowData[]>(() => {
    const rows: IconPickerRowData[] = [];

    for (const category of categories) {
      rows.push({
        type: 'category',
        category: category.name,
      });

      const numIcons = category.count;
      const numRowsInCategory = Math.ceil(numIcons / ICONS_PER_ROW);

      for (let i = 0; i < numRowsInCategory; i++) {
        rows.push({
          type: 'items',
          category: category.id,
          page: i,
          count: ICONS_PER_ROW,
        });
      }
    }

    return rows;
  }, [categories]);

  const parentRef = React.useRef(null);

  const virtualizer = useVirtualizer({
    count: rowDataArray.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 30,
  });

  return (
    <div
      ref={parentRef}
      style={{
        height: `100%`,
        overflow: 'auto',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const row = rowDataArray[virtualItem.index]!;
          const style: React.CSSProperties = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualItem.size}px`,
            transform: `translateY(${virtualItem.start}px)`,
          };

          if (row.type === 'category') {
            return <IconBrowserCategory row={row} style={style} />;
          }

          return <IconBrowserItems row={row} style={style} />;
        })}
      </div>
    </div>
  );
};
