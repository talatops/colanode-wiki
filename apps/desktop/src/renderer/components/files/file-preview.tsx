import { match } from 'ts-pattern';

import { FileDownload } from '@/renderer/components/files/file-download';
import { FilePreviewImage } from '@/renderer/components/files/previews/file-preview-image';
import { FilePreviewOther } from '@/renderer/components/files/previews/file-preview-other';
import { FilePreviewVideo } from '@/renderer/components/files/previews/file-preview-video';
import { useWorkspace } from '@/renderer/contexts/workspace';
import { getFileUrl } from '@/shared/lib/files';
import { LocalFileNode } from '@/shared/types/nodes';
import { useQuery } from '@/renderer/hooks/use-query';

interface FilePreviewProps {
  file: LocalFileNode;
}

export const FilePreview = ({ file }: FilePreviewProps) => {
  const workspace = useWorkspace();

  const { data, isPending } = useQuery({
    type: 'file_state_get',
    id: file.id,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
  });

  if (isPending) {
    return null;
  }

  if (data?.downloadProgress !== 100) {
    return <FileDownload file={file} state={data} />;
  }

  const url = getFileUrl(
    workspace.accountId,
    workspace.id,
    file.id,
    file.attributes.extension
  );

  return match(file.attributes.subtype)
    .with('image', () => (
      <FilePreviewImage url={url} name={file.attributes.name} />
    ))
    .with('video', () => <FilePreviewVideo url={url} />)
    .otherwise(() => <FilePreviewOther mimeType={file.attributes.mimeType} />);
};
