// @mui
import Dialog from '@mui/material/Dialog';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// redux
import { useSelector } from '@/redux/store';
// components
import { DialogTitleAlt } from '@/components/CustomDialog';
import { SearchNotFoundSmall } from '@/components/table/SearchNotFound';

// ---------------------------------------------------------------------------------------------------------------------

export default function DetalhesPrompt({ onClose }) {
  const { selectedItem, isLoading } = useSelector((s) => s.suporte);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitleAlt onClose={onClose} title="Prompt" sx={{ mb: 2 }} />

      <DialogContent>
        {isLoading ? (
          <Skeleton sx={{ height: 300, transform: 'none', mt: 1 }} />
        ) : (
          <>
            {!selectedItem ? (
              <SearchNotFoundSmall message="Item não disponível..." />
            ) : (
              <Typography variant="body2" sx={{ textAlign: 'justify', whiteSpace: 'pre-line' }}>
                {selectedItem?.prompt}
              </Typography>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
