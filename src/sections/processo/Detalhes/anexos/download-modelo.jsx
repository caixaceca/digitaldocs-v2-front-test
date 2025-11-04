import { useState } from 'react';
import Button from '@mui/material/Button';
import { getFileThumb } from '../../../../utils/formatFile';

// ---------------------------------------------------------------------------------------------------------------------

export default function DownloadModelo({ modelo = 'Modelo.docx', tipo = '', onClick }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      fullWidth
      variant="soft"
      color="inherit"
      loading={loading}
      onClick={() => onClick(setLoading, tipo)}
      startIcon={getFileThumb(false, null, 'file.docx')}
      sx={{ justifyContent: 'left', textAlign: 'left', boxShadow: 'none' }}
    >
      {modelo}
    </Button>
  );
}
