import React from 'react';
import { useDrop } from 'react-dnd';

import { ScrollArea, ScrollBar } from '@/renderer/components/ui/scroll-area';
import { Tabs, TabsList } from '@/renderer/components/ui/tabs';
import { ContainerTab } from '@/shared/types/workspaces';
import { ContainerTabTrigger } from '@/renderer/components/layouts/containers/container-tab-trigger';
import { ContainerTabContent } from '@/renderer/components/layouts/containers/container-tab-content';
import { cn } from '@/shared/lib/utils';

interface ContainerTabsProps {
  tabs: ContainerTab[];
  onTabChange: (value: string) => void;
  onFocus: () => void;
  onClose: (value: string) => void;
  onOpen: (value: string) => void;
  onMove: (tab: string, before: string | null) => void;
}

export const ContainerTabs = ({
  tabs,
  onTabChange,
  onFocus,
  onClose,
  onOpen,
  onMove,
}: ContainerTabsProps) => {
  const activeTab = tabs.find((t) => t.active)?.path;

  const [dropMonitor, dropRef] = useDrop({
    accept: 'container-tab',
    drop: () => ({
      before: null,
    }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const buttonRef = React.useRef<HTMLDivElement>(null);
  const dragDropRef = dropRef(buttonRef);

  return (
    <Tabs
      defaultValue={tabs[0]?.path}
      value={activeTab}
      onValueChange={onTabChange}
      onFocus={onFocus}
      className="h-full min-h-full w-full min-w-full max-h-full max-w-full flex flex-col overflow-hidden"
    >
      <ScrollArea className="h-10 min-h-10 w-full">
        <TabsList className="h-10 bg-slate-50 w-full justify-start p-0 app-drag-region">
          {tabs.map((tab) => (
            <ContainerTabTrigger
              key={tab.path}
              tab={tab}
              onClose={() => onClose(tab.path)}
              onOpen={() => onOpen(tab.path)}
              onMove={(before) => onMove(tab.path, before)}
            />
          ))}
          <div
            ref={dragDropRef as React.LegacyRef<HTMLDivElement>}
            className={cn(
              'h-full w-10',
              dropMonitor.isOver &&
                dropMonitor.canDrop &&
                'border-l-2 border-blue-300'
            )}
          />
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="flex-grow overflow-hidden">
        {tabs.map((tab) => (
          <ContainerTabContent key={tab.path} tab={tab} />
        ))}
      </div>
    </Tabs>
  );
};
