import { useState, useEffect } from 'react';

import { AppContext } from '@/renderer/contexts/app';
import { DelayedComponent } from '@/renderer/components/ui/delayed-component';
import { AppLoader } from '@/renderer/app-loader';
import { useQuery } from '@/renderer/hooks/use-query';
import { RadarProvider } from '@/renderer/radar-provider';
import { Account } from '@/renderer/components/accounts/account';
import { Login } from '@/renderer/components/accounts/login';

export const App = () => {
  const [initialized, setInitialized] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);

  const { data: metadata, isPending: isPendingMetadata } = useQuery({
    type: 'app_metadata_list',
  });

  const { data: accounts, isPending: isPendingAccounts } = useQuery({
    type: 'account_list',
  });

  useEffect(() => {
    window.colanode.init().then(() => {
      setInitialized(true);
    });
  }, []);

  if (!initialized || isPendingMetadata || isPendingAccounts) {
    return (
      <DelayedComponent>
        <AppLoader />
      </DelayedComponent>
    );
  }

  const accountMetadata = metadata?.find(
    (metadata) => metadata.key === 'account'
  );

  const account =
    accounts?.find((account) => account.id === accountMetadata?.value) ||
    accounts?.[0];

  return (
    <AppContext.Provider
      value={{
        getMetadata: (key) => {
          return metadata?.find((metadata) => metadata.key === key)?.value;
        },
        setMetadata: (key, value) => {
          window.colanode.executeMutation({
            type: 'app_metadata_save',
            key,
            value,
          });
        },
        deleteMetadata: (key: string) => {
          window.colanode.executeMutation({
            type: 'app_metadata_delete',
            key,
          });
        },
        openLogin: () => setOpenLogin(true),
        closeLogin: () => setOpenLogin(false),
        openAccount: (id: string) => {
          setOpenLogin(false);
          window.colanode.executeMutation({
            type: 'app_metadata_save',
            key: 'account',
            value: id,
          });
        },
      }}
    >
      <RadarProvider>
        {!openLogin && account ? (
          <Account key={account.id} account={account} />
        ) : (
          <Login />
        )}
      </RadarProvider>
    </AppContext.Provider>
  );
};
