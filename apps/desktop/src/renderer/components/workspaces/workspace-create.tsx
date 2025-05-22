import { WorkspaceForm } from '@/renderer/components/workspaces/workspace-form';
import { useAccount } from '@/renderer/contexts/account';
import { useMutation } from '@/renderer/hooks/use-mutation';
import { toast } from '@/renderer/hooks/use-toast';

interface WorkspaceCreateProps {
  onSuccess: (id: string) => void;
  onCancel: (() => void) | undefined;
}

export const WorkspaceCreate = ({
  onSuccess,
  onCancel,
}: WorkspaceCreateProps) => {
  const account = useAccount();
  const { mutate, isPending } = useMutation();

  return (
    <div className="container flex flex-row justify-center">
      <div className="w-full max-w-[700px]">
        <div className="flex flex-row justify-center py-8">
          <h1 className="text-center text-4xl font-bold leading-tight tracking-tighter lg:leading-[1.1]">
            Setup your workspace
          </h1>
        </div>
        <WorkspaceForm
          onSubmit={(values) => {
            mutate({
              input: {
                type: 'workspace_create',
                name: values.name,
                description: values.description,
                accountId: account.id,
                avatar: values.avatar ?? null,
              },
              onSuccess(output) {
                onSuccess(output.id);
              },
              onError(error) {
                toast({
                  title: 'Failed to create workspace',
                  description: error.message,
                  variant: 'destructive',
                });
              },
            });
          }}
          isSaving={isPending}
          onCancel={onCancel}
          saveText="Create"
        />
      </div>
    </div>
  );
};
