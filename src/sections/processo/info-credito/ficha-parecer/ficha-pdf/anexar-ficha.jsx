import { useSnackbar } from 'notistack';
import { pdf } from '@react-pdf/renderer';
import { useState, useEffect, useMemo } from 'react';
// @mui
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// utils
import { updateItem } from '@/redux/slices/digitaldocs';
import { useDispatch, useSelector } from '@/redux/store';
import useToggle, { useToggle1 } from '@/hooks/useToggle';
import { appendAnexos } from '../../../form/anexos/utils-anexos';
import { getFromParametrizacao } from '@/redux/slices/parametrizacao';
//
import FichaPdf from './index';
import { DefaultAction } from '@/components/Actions';
import DialogPreviewDoc, { DialogConfirmar } from '@/components/CustomDialog';

// ---------------------------------------------------------------------------------------------------------------------

export default function AnexarFicha({ dados }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [url, setUrl] = useState('');
  const [gerando, setGerando] = useState(false);
  const { toggle: open, onOpen, onClose } = useToggle();
  const { toggle1: open1, onOpen1, onClose1 } = useToggle1();

  const { cc } = useSelector((state) => state.intranet);
  const { checklist } = useSelector((state) => state.parametrizacao);
  const { processo, isSaving } = useSelector((state) => state.digitaldocs);

  const outros = useMemo(() => checklist?.find(({ designacao }) => designacao === 'OUTROS'), [checklist]);
  const temFicha = useMemo(
    () => processo?.anexos?.find(({ nome, ativo }) => nome === 'Ficha de Análise e Parecer de Crédito.pdf' && ativo),
    [processo?.anexos]
  );

  useEffect(() => {
    dispatch(getFromParametrizacao('checklist', { fluxoId: processo?.fluxo_id, reset: { val: [] } }));
  }, [dispatch, processo?.fluxo_id]);

  const anexarNoProcesso = async () => {
    setGerando(true);
    try {
      const doc = <FichaPdf dados={{ ...dados, analista: cc?.nome, uo: cc?.uo_label }} />;
      const blob = await pdf(doc).toBlob();
      const arquivo = new File([blob], 'Ficha de Análise e Parecer de Crédito.pdf', { type: 'application/pdf' });

      const formData = new FormData();
      appendAnexos(formData, [arquivo], outros, []);

      const params = { id: processo?.id, estadoId: processo?.estado_atual_id, anexos: formData };
      dispatch(updateItem('adicionar-anexos', null, { ...params, msg: 'Ficha anexado', onClose }));
    } catch {
      enqueueSnackbar('Erro ao processar ficheiro', { variant: 'error' });
    } finally {
      setGerando(false);
    }
  };

  const onPreview = async () => {
    onOpen1();
    setGerando(true);
    try {
      const doc = <FichaPdf dados={{ ...dados, analista: cc?.nome, uo: cc?.uo_label }} />;
      const blob = await pdf(doc).toBlob();
      const blobUrl = URL.createObjectURL(blob);
      setUrl(blobUrl);
    } catch {
      enqueueSnackbar('Erro ao processar ficheiro', { variant: 'error' });
    } finally {
      setGerando(false);
    }
  };

  useEffect(
    () => () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    },
    [url]
  );

  return (
    <Stack direction="row" spacing={3} justifyContent="center" alignItems="center">
      <DefaultAction button icon="pdf" onClick={() => onPreview()} label="Pré-visualizar" />
      <DefaultAction button icon="pdf" onClick={onOpen} variant="contained" label="ANEXAR AO PROCESSO" />
      {open1 && (
        <DialogPreviewDoc
          onClose={onClose1}
          params={{ titulo: 'Ficha de Análise e Parecer de Crédito', isLoading: gerando, url }}
        />
      )}
      {open && (
        <DialogConfirmar
          color="success"
          onClose={onClose}
          title="Anexar Ficha"
          isSaving={gerando || isSaving}
          handleOk={anexarNoProcesso}
          content={
            <>
              <Typography>
                Deseja gerar e anexar automaticamente a <b>Ficha de Análise e Parecer de Crédito</b> ao processo?
              </Typography>
              {temFicha && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Já existe uma ficha anexada. Esta ação criará um novo registo no processo.
                </Alert>
              )}
            </>
          }
        />
      )}
    </Stack>
  );
}
