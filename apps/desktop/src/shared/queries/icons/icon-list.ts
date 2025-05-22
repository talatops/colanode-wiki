import { Icon } from '@/shared/types/icons';

export type IconListQueryInput = {
  type: 'icon_list';
  category: string;
  page: number;
  count: number;
};

declare module '@/shared/queries' {
  interface QueryMap {
    icon_list: {
      input: IconListQueryInput;
      output: Icon[];
    };
  }
}
