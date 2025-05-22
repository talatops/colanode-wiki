import {
  compareString,
  SortDirection,
  DatabaseViewFieldFilterAttributes,
  DatabaseViewFilterAttributes,
  DatabaseViewSortAttributes,
} from '@colanode/core';
import React from 'react';
import { match } from 'ts-pattern';

import { BoardView } from '@/renderer/components/databases/boards/board-view';
import { CalendarView } from '@/renderer/components/databases/calendars/calendar-view';
import { TableView } from '@/renderer/components/databases/tables/table-view';
import { useDatabase } from '@/renderer/contexts/database';
import { DatabaseViewContext } from '@/renderer/contexts/database-view';
import { useWorkspace } from '@/renderer/contexts/workspace';
import { useLayout } from '@/renderer/contexts/layout';
import {
  generateFieldValuesFromFilters,
  generateViewFieldIndex,
  getDefaultFieldWidth,
  getDefaultNameWidth,
  getDefaultViewFieldDisplay,
  getFieldFilterOperators,
} from '@/shared/lib/databases';
import { ViewField } from '@/shared/types/databases';
import { toast } from '@/renderer/hooks/use-toast';
import { LocalDatabaseViewNode } from '@/shared/types/nodes';

interface ViewProps {
  view: LocalDatabaseViewNode;
}

export const View = ({ view }: ViewProps) => {
  const workspace = useWorkspace();
  const database = useDatabase();
  const layout = useLayout();

  const fields: ViewField[] = database.fields
    .map((field) => {
      const viewField = view.attributes.fields?.[field.id];

      return {
        field,
        display:
          viewField?.display ??
          getDefaultViewFieldDisplay(view.attributes.layout),
        index: viewField?.index ?? field.index,
        width: viewField?.width ?? getDefaultFieldWidth(field.type),
      };
    })
    .filter((field) => field.display)
    .sort((a, b) => compareString(a.index, b.index));

  const [isSearchBarOpened, setIsSearchBarOpened] = React.useState(false);
  const [isSortsOpened, setIsSortsOpened] = React.useState(false);
  const [openedFieldFilters, setOpenedFieldFilters] = React.useState<string[]>(
    []
  );

  return (
    <DatabaseViewContext.Provider
      value={{
        id: view.id,
        name: view.attributes.name,
        avatar: view.attributes.avatar,
        layout: view.attributes.layout,
        fields,
        filters: Object.values(view.attributes.filters ?? {}),
        sorts: Object.values(view.attributes.sorts ?? {}),
        groupBy: view.attributes.groupBy,
        nameWidth: view.attributes.nameWidth ?? getDefaultNameWidth(),
        isSearchBarOpened,
        isSortsOpened,
        rename: async (name: string) => {
          if (!database.canEdit) return;

          const viewAttributes = { ...view.attributes };
          viewAttributes.name = name;

          const result = await window.colanode.executeMutation({
            type: 'view_update',
            accountId: workspace.accountId,
            workspaceId: workspace.id,
            viewId: view.id,
            view: viewAttributes,
          });

          if (!result.success) {
            toast({
              title: 'Failed to update view',
              description: result.error.message,
              variant: 'destructive',
            });
          }
        },
        updateAvatar: async (avatar: string) => {
          if (!database.canEdit) return;

          const viewAttributes = { ...view.attributes };
          viewAttributes.avatar = avatar;

          const result = await window.colanode.executeMutation({
            type: 'view_update',
            accountId: workspace.accountId,
            workspaceId: workspace.id,
            viewId: view.id,
            view: viewAttributes,
          });

          if (!result.success) {
            toast({
              title: 'Failed to update view',
              description: result.error.message,
              variant: 'destructive',
            });
          }
        },
        setFieldDisplay: async (id: string, display: boolean) => {
          if (!database.canEdit) return;

          const viewField = view.attributes.fields?.[id];
          if (viewField && viewField.display === display) return;

          const viewAttributes = { ...view.attributes };
          viewAttributes.fields = viewAttributes.fields ?? {};
          if (!viewAttributes.fields[id]) {
            viewAttributes.fields[id] = {
              id: id,
              display: display,
            };
          } else {
            viewAttributes.fields[id].display = display;
          }

          const result = await window.colanode.executeMutation({
            type: 'view_update',
            accountId: workspace.accountId,
            workspaceId: workspace.id,
            viewId: view.id,
            view: viewAttributes,
          });

          if (!result.success) {
            toast({
              title: 'Failed to update view',
              description: result.error.message,
              variant: 'destructive',
            });
          }
        },
        resizeField: async (id: string, width: number) => {
          if (!database.canEdit) {
            return;
          }

          const viewField = view.attributes.fields?.[id];
          if (viewField && viewField.width === width) {
            return;
          }

          const viewAttributes = { ...view.attributes };
          viewAttributes.fields = viewAttributes.fields ?? {};
          if (!viewAttributes.fields[id]) {
            viewAttributes.fields[id] = {
              id: id,
              width: width,
            };
          } else {
            viewAttributes.fields[id].width = width;
          }

          const result = await window.colanode.executeMutation({
            type: 'view_update',
            accountId: workspace.accountId,
            workspaceId: workspace.id,
            viewId: view.id,
            view: viewAttributes,
          });

          if (!result.success) {
            toast({
              title: 'Failed to update view',
              description: result.error.message,
              variant: 'destructive',
            });
          }
        },
        resizeName: async (width: number) => {
          if (!database.canEdit) {
            return;
          }

          if (view.attributes.nameWidth === width) {
            return;
          }

          const viewAttributes = { ...view.attributes };
          viewAttributes.nameWidth = width;

          const result = await window.colanode.executeMutation({
            type: 'view_update',
            accountId: workspace.accountId,
            workspaceId: workspace.id,
            viewId: view.id,
            view: viewAttributes,
          });

          if (!result.success) {
            toast({
              title: 'Failed to update view',
              description: result.error.message,
              variant: 'destructive',
            });
          }
        },
        moveField: async (id: string, after: string) => {
          if (!database.canEdit) {
            return;
          }

          const newIndex = generateViewFieldIndex(
            database.fields,
            Object.values(view.attributes.fields ?? {}),
            id,
            after
          );
          if (newIndex === null) {
            return;
          }

          const viewAttributes = { ...view.attributes };
          viewAttributes.fields = viewAttributes.fields ?? {};
          if (!viewAttributes.fields[id]) {
            viewAttributes.fields[id] = {
              id: id,
              index: newIndex,
            };
          } else {
            viewAttributes.fields[id].index = newIndex;
          }

          const result = await window.colanode.executeMutation({
            type: 'view_update',
            accountId: workspace.accountId,
            workspaceId: workspace.id,
            viewId: view.id,
            view: viewAttributes,
          });

          if (!result.success) {
            toast({
              title: 'Failed to update view',
              description: result.error.message,
              variant: 'destructive',
            });
          }
        },
        isFieldFilterOpened: (fieldId: string) =>
          openedFieldFilters.includes(fieldId),
        initFieldFilter: async (fieldId: string) => {
          if (!database.canEdit) {
            return;
          }

          if (view.attributes.filters?.[fieldId]) {
            setOpenedFieldFilters((prev) => [...prev, fieldId]);
            return;
          }

          const field = database.fields.find((f) => f.id === fieldId);
          if (!field) {
            return;
          }

          const operators = getFieldFilterOperators(field.type);
          const filter: DatabaseViewFieldFilterAttributes = {
            type: 'field',
            id: fieldId,
            fieldId,
            operator: operators[0]?.value ?? '',
          };

          const viewAttributes = { ...view.attributes };
          viewAttributes.filters = viewAttributes.filters ?? {};
          viewAttributes.filters[fieldId] = filter;

          const result = await window.colanode.executeMutation({
            type: 'view_update',
            accountId: workspace.accountId,
            workspaceId: workspace.id,
            viewId: view.id,
            view: viewAttributes,
          });

          if (!result.success) {
            toast({
              title: 'Failed to update view',
              description: result.error.message,
              variant: 'destructive',
            });
          } else {
            setOpenedFieldFilters((prev) => [...prev, fieldId]);
          }
        },
        updateFilter: async (
          id: string,
          filter: DatabaseViewFilterAttributes
        ) => {
          if (!database.canEdit) {
            return;
          }

          if (!view.attributes.filters?.[id]) {
            return;
          }

          const viewAttributes = { ...view.attributes };
          viewAttributes.filters = viewAttributes.filters ?? {};
          viewAttributes.filters[id] = filter;

          const result = await window.colanode.executeMutation({
            type: 'view_update',
            accountId: workspace.accountId,
            workspaceId: workspace.id,
            viewId: view.id,
            view: viewAttributes,
          });

          if (!result.success) {
            toast({
              title: 'Failed to update view',
              description: result.error.message,
              variant: 'destructive',
            });
          } else {
            setIsSearchBarOpened(true);
          }
        },
        removeFilter: async (id: string) => {
          if (!database.canEdit) {
            return;
          }

          if (!view.attributes.filters?.[id]) {
            return;
          }

          const viewAttributes = { ...view.attributes };
          viewAttributes.filters = viewAttributes.filters ?? {};
          delete viewAttributes.filters[id];

          const result = await window.colanode.executeMutation({
            type: 'view_update',
            accountId: workspace.accountId,
            workspaceId: workspace.id,
            viewId: view.id,
            view: viewAttributes,
          });

          if (!result.success) {
            toast({
              title: 'Failed to update view',
              description: result.error.message,
              variant: 'destructive',
            });
          } else {
            setIsSearchBarOpened(true);
          }
        },
        initFieldSort: async (fieldId: string, direction: SortDirection) => {
          if (!database.canEdit) {
            return;
          }

          const existingSort = view.attributes.sorts?.[fieldId];
          if (existingSort && existingSort.direction === direction) {
            return;
          }

          const field = database.fields.find((f) => f.id === fieldId);
          if (!field) {
            return;
          }

          const sort: DatabaseViewSortAttributes = {
            id: fieldId,
            fieldId,
            direction,
          };

          const viewAttributes = { ...view.attributes };
          viewAttributes.sorts = viewAttributes.sorts ?? {};
          viewAttributes.sorts[fieldId] = sort;

          const result = await window.colanode.executeMutation({
            type: 'view_update',
            accountId: workspace.accountId,
            workspaceId: workspace.id,
            viewId: view.id,
            view: viewAttributes,
          });

          if (!result.success) {
            toast({
              title: 'Failed to update view',
              description: result.error.message,
              variant: 'destructive',
            });
          } else {
            setIsSearchBarOpened(true);
            setIsSortsOpened(true);
          }
        },
        updateSort: async (id: string, sort: DatabaseViewSortAttributes) => {
          if (!database.canEdit) {
            return;
          }

          if (!view.attributes.sorts?.[id]) {
            return;
          }

          const viewAttributes = { ...view.attributes };
          viewAttributes.sorts = viewAttributes.sorts ?? {};
          viewAttributes.sorts[id] = sort;

          const result = await window.colanode.executeMutation({
            type: 'view_update',
            accountId: workspace.accountId,
            workspaceId: workspace.id,
            viewId: view.id,
            view: viewAttributes,
          });

          if (!result.success) {
            toast({
              title: 'Failed to update view',
              description: result.error.message,
              variant: 'destructive',
            });
          } else {
            setIsSearchBarOpened(true);
            setIsSortsOpened(true);
          }
        },
        removeSort: async (id: string) => {
          if (!database.canEdit) {
            return;
          }

          if (!view.attributes.sorts?.[id]) {
            return;
          }

          const viewAttributes = { ...view.attributes };
          viewAttributes.sorts = viewAttributes.sorts ?? {};
          delete viewAttributes.sorts[id];

          const result = await window.colanode.executeMutation({
            type: 'view_update',
            accountId: workspace.accountId,
            workspaceId: workspace.id,
            viewId: view.id,
            view: viewAttributes,
          });

          if (!result.success) {
            toast({
              title: 'Failed to update view',
              description: result.error.message,
              variant: 'destructive',
            });
          } else {
            setIsSearchBarOpened(true);
            setIsSortsOpened(true);
          }
        },
        openSearchBar: () => {
          setIsSearchBarOpened(true);
        },
        closeSearchBar: () => {
          setIsSearchBarOpened(false);
        },
        openSorts: () => {
          setIsSortsOpened(true);
        },
        closeSorts: () => {
          setIsSortsOpened(false);
        },
        openFieldFilter: (fieldId: string) => {
          setOpenedFieldFilters((prev) => [...prev, fieldId]);
        },
        closeFieldFilter: (fieldId: string) => {
          setOpenedFieldFilters((prev) => prev.filter((id) => id !== fieldId));
        },
        createRecord: async (filters?: DatabaseViewFilterAttributes[]) => {
          const viewFilters =
            Object.values(view.attributes.filters ?? {}) ?? [];
          const extraFilters = filters ?? [];

          const allFilters = [...viewFilters, ...extraFilters];
          const fields = generateFieldValuesFromFilters(
            database.fields,
            allFilters,
            workspace.userId
          );

          const result = await window.colanode.executeMutation({
            type: 'record_create',
            databaseId: database.id,
            accountId: workspace.accountId,
            workspaceId: workspace.id,
            fields,
          });

          if (!result.success) {
            toast({
              title: 'Failed to create record',
              description: result.error.message,
              variant: 'destructive',
            });
          } else {
            layout.previewLeft(result.output.id, true);
          }
        },
      }}
    >
      {match(view.attributes.layout)
        .with('table', () => <TableView />)
        .with('board', () => <BoardView />)
        .with('calendar', () => <CalendarView />)
        .exhaustive()}
    </DatabaseViewContext.Provider>
  );
};
