import { LayoutGrid, MessageCircle } from 'lucide-react';

import { SidebarMenuIcon } from '@/renderer/components/layouts/sidebars/sidebar-menu-icon';
import { SidebarMenuHeader } from '@/renderer/components/layouts/sidebars/sidebar-menu-header';
import { SidebarMenuFooter } from '@/renderer/components/layouts/sidebars/sidebar-menu-footer';
import { SidebarMenuType } from '@/shared/types/workspaces';
import { useApp } from '@/renderer/contexts/app';

interface SidebarMenuProps {
  value: SidebarMenuType;
  onChange: (value: SidebarMenuType) => void;
}

export const SidebarMenu = ({ value, onChange }: SidebarMenuProps) => {
  const app = useApp();
  const platform = app.getMetadata('platform');
  const windowSize = app.getMetadata('window_size');
  const showMacOsPlaceholder = platform === 'darwin' && !windowSize?.fullscreen;

  return (
    <div className="flex flex-col h-full w-[65px] min-w-[65px] items-center bg-slate-100">
      {showMacOsPlaceholder ? (
        <div className="w-full h-8 flex gap-[8px] px-[6px] py-[7px]">
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
        </div>
      ) : (
        <div className="w-full h-4" />
      )}
      <SidebarMenuHeader />
      <div className="flex flex-col gap-1 mt-2 w-full p-2 items-center flex-grow">
        <SidebarMenuIcon
          icon={MessageCircle}
          onClick={() => {
            onChange('chats');
          }}
          isActive={value === 'chats'}
        />
        <SidebarMenuIcon
          icon={LayoutGrid}
          onClick={() => {
            onChange('spaces');
          }}
          isActive={value === 'spaces'}
        />
      </div>
      <SidebarMenuFooter />
    </div>
  );
};
