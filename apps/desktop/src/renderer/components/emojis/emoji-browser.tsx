import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { EmojiPickerRowData } from '@/shared/types/emojis';
import { useQuery } from '@/renderer/hooks/use-query';
import { EmojiBrowserCategory } from '@/renderer/components/emojis/emoji-browser-category';
import { EmojiBrowserItems } from '@/renderer/components/emojis/emoji-browser-items';

const EMOJIS_PER_ROW = 10;

export const EmojiBrowser = () => {
  const { data } = useQuery({
    type: 'emoji_category_list',
  });

  const categories = data ?? [];
  const rowDataArray = React.useMemo<EmojiPickerRowData[]>(() => {
    const rows: EmojiPickerRowData[] = [];

    for (const category of categories) {
      rows.push({
        type: 'category',
        category: category.name,
      });

      const numEmojis = category.count;
      const numRowsInCategory = Math.ceil(numEmojis / EMOJIS_PER_ROW);

      for (let i = 0; i < numRowsInCategory; i++) {
        rows.push({
          type: 'items',
          category: category.id,
          page: i,
          count: EMOJIS_PER_ROW,
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
            return (
              <EmojiBrowserCategory
                row={row}
                style={style}
                key={row.category}
              />
            );
          }

          return (
            <EmojiBrowserItems row={row} style={style} key={row.category} />
          );
        })}
      </div>
    </div>
  );
};
