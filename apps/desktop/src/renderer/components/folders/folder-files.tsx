import React from 'react';
import { match } from 'ts-pattern';

import { GalleryLayout } from '@/renderer/components/folders/galleries/gallery-layout';
import { GridLayout } from '@/renderer/components/folders/grids/grid-layout';
import { ListLayout } from '@/renderer/components/folders/lists/list-layout';
import { FolderContext } from '@/renderer/contexts/folder';
import { useWorkspace } from '@/renderer/contexts/workspace';
import { useQueries } from '@/renderer/hooks/use-queries';
import { FileListQueryInput } from '@/shared/queries/files/file-list';
import { FolderLayoutType } from '@/shared/types/folders';
import { useLayout } from '@/renderer/contexts/layout';

const FILES_PER_PAGE = 100;

interface FolderFilesProps {
  id: string;
  name: string;
  layout: FolderLayoutType;
}

export const FolderFiles = ({
  id,
  name,
  layout: folderLayout,
}: FolderFilesProps) => {
  const workspace = useWorkspace();
  const layout = useLayout();

  const [lastPage] = React.useState<number>(1);
  const inputs: FileListQueryInput[] = Array.from({
    length: lastPage,
  }).map((_, i) => ({
    type: 'file_list',
    accountId: workspace.accountId,
    workspaceId: workspace.id,
    parentId: id,
    count: FILES_PER_PAGE,
    page: i + 1,
  }));

  const result = useQueries(inputs);
  const files = result.flatMap((data) => data.data ?? []);

  return (
    <FolderContext.Provider
      value={{
        id,
        name,
        files,
        onClick: () => {
          console.log('onClick');
        },
        onDoubleClick: (_, id) => {
          layout.previewLeft(id, true);
        },
        onMove: () => {},
      }}
    >
      {match(folderLayout)
        .with('grid', () => <GridLayout />)
        .with('list', () => <ListLayout />)
        .with('gallery', () => <GalleryLayout />)
        .exhaustive()}
    </FolderContext.Provider>
  );
};
