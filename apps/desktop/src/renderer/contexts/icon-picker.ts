import { createContext, useContext } from 'react';

import { Icon } from '@/shared/types/icons';

interface IconPickerContextProps {
  onPick: (icon: Icon) => void;
}

export const IconPickerContext = createContext<IconPickerContextProps>(
  {} as IconPickerContextProps
);

export const useIconPicker = () => useContext(IconPickerContext);
