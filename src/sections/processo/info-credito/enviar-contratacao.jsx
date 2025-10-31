import { useEffect, useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
// utils
import useToggle from '../../../hooks/useToggle';
import { usePermissao } from '../../../hooks/useAcesso';
// redux
import { getFromGaji9 } from '../../../redux/slices/gaji9';
import { useSelector, useDispatch } from '../../../redux/store';
import { getFromDigitalDocs } from '../../../redux/slices/digitaldocs';
// components
import { DefaultAction } from '../../../components/Actions';

// ---------------------------------------------------------------------------------------------------------------------

export default function EnviarContratacao({ dados }) {
  const dispatch = useDispatch();
  const { temPermissao } = usePermissao();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { cc } = useSelector((state) => state.intranet);
  const { utilizador } = useSelector((state) => state.gaji9);

  useEffect(() => {
    if (!utilizador && cc?.ad_id) {
      dispatch(getFromGaji9('utilizador', { id: cc?.ad_id }));
    }
  }, [dispatch, utilizador, cc?.ad_id]);

  const podeEnviar = utilizador?._role === 'GERENTE' || temPermissao(['READ_CREDITO']);

  return (
    <>
      {podeEnviar && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }} spacing={2}>
          <DefaultAction button variant="contained" label="Enviar para GAJ-i9" onClick={onOpen} />
        </Stack>
      )}

      {open && <DialogEnvioContratacao dados={dados} onClose={onClose} />}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function DialogEnvioContratacao({ dados, onClose }) {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.digitaldocs);

  const erros = useMemo(() => {
    if (!dados) return ['Dados do processo não encontrados'];

    const falhas = [];

    const metadados = dados?.gaji9_metadados || {};

    const regras = [
      { cond: !dados?.numero_proposta, msg: 'Número de proposta não definido' },
      { cond: !dados?.componente_id, msg: 'Falta o componente do crédito' },
      { cond: !dados?.linha_id, msg: 'Falta indicar a linha de crédito' },
      { cond: !dados?.tipo_titular, msg: 'Falta indicar o tipo de titular' },
      {
        cond: !dados?.montante_aprovado || dados?.montante_aprovado <= 0,
        msg: 'Montante aprovado inválido ou não definido',
      },
      {
        cond: !Array.isArray(dados?.garantias) || dados?.garantias.length === 0,
        msg: 'É necessário pelo menos uma garantia',
      },
      { cond: !dados?.gaji9_metadados, msg: 'Metadados do GAJ-i9 não encontrados' },
      {
        cond:
          dados?.gaji9_metadados &&
          [
            'taxa_taeg',
            'valor_juro',
            'custo_total',
            'valor_prestacao',
            'numero_prestacao',
            'taxa_imposto_selo',
            'taxa_juro_precario',
            'valor_imposto_selo',
            'data_vencimento_prestacao1',
            'valor_prestacao_sem_desconto',
          ].some((key) => !metadados[key]),
        msg: 'Metadados do GAJ-i9 estão incompletos (faltam campos obrigatórios)',
      },
    ];

    regras.forEach((r) => {
      if (r.cond) falhas.push(r.msg);
    });

    return falhas;
  }, [dados]);

  const temErros = erros.length > 0;

  const onConfirmar = () => {
    if (temErros) return;
    const params = { id: dados?.id, notRest: true, msg: 'Processo enviado' };
    dispatch(getFromDigitalDocs('contratacao-gaji9', { ...params, onClose }));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Enviar para contratação</DialogTitle>
      <DialogContent sx={{ mt: 3 }}>
        {temErros ? (
          <DialogContentText sx={{ mb: 1 }}>
            Não é possível enviar o processo enquanto existirem as seguintes pendências:
            <Stack spacing={0.25} sx={{ pt: 2, pl: 2 }}>
              {erros.map((erro, i) => (
                <Typography key={`erro_${i}`} variant="body2" sx={{ color: 'error.main' }}>
                  • {erro}
                </Typography>
              ))}
            </Stack>
          </DialogContentText>
        ) : (
          <DialogContentText>
            Tens a certeza de que pretendes enviar este processo para o GAJ-i9 para proceder à geração do contrato?
          </DialogContentText>
        )}
      </DialogContent>

      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="soft" onClick={onConfirmar} disabled={temErros || isLoading} loading={isLoading}>
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
