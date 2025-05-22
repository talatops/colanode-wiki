import { createContext, useContext } from 'react';

import { Account } from '@/shared/types/accounts';

interface AccountContext extends Account {
  openSettings: () => void;
  openLogout: () => void;
  openWorkspace: (id: string) => void;
  openWorkspaceCreate: () => void;
}

export const AccountContext = createContext<AccountContext>(
  {} as AccountContext
);

export const useAccount = () => useContext(AccountContext);
