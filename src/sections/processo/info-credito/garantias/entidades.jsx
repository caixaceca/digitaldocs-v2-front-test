import { useState, useEffect, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// utils
import { dispatch, useSelector } from '@/redux/store';
import { getFromIntranet } from '@/redux/slices/intranet';
import { extractClientes } from '../ficha-parecer/calculos';
// components
import { DefaultAction } from '@/components/Actions';
import { DialogTitleAlt } from '@/components/CustomDialog';
//
import ResumoFiador from './resumo-fiador';
import { SkeletonEntidade } from '@/components/skeleton';
import { AccordionItem } from '../ficha-parecer/fragments';
import Responsabilidades, { AvalesFiancas } from '../ficha-parecer/responsabilidades';
import { Saldos, Clientes, Mensagens, Identificcao, CentralRisco, Restruturacoes } from '../ficha-parecer/dados-ficha';

// ---------------------------------------------------------------------------------------------------------------------

export default function Entidades({ dados = [], title = '', showDetails = false }) {
  const [entidadeSel, setEntidadeSel] = useState(null);

  return (
    <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
      {title && (
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
          {title}
        </Typography>
      )}
      <Stack spacing={1} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
        {dados.map((row, index) => (
          <Stack key={`fiador_${index}`} direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
              <Typography variant="body2">
                <Box component="span" sx={{ fontWeight: 'bold' }}>
                  {row?.numero || row?.numero_entidade || '—'}
                </Box>
                {' - '}
                {row?.nome || row?.nome_entidade || '—'}
              </Typography>
            </Stack>
            {showDetails && <DefaultAction small label="DETALHES" onClick={() => setEntidadeSel(row)} />}
          </Stack>
        ))}
      </Stack>
      {entidadeSel && <InfoEntidade entidadeSel={entidadeSel} onClose={() => setEntidadeSel(null)} />}
    </Box>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function InfoEntidade({ entidadeSel, onClose }) {
  const { fichaFiador, isLoading } = useSelector((state) => state.intranet);
  const {
    saldos,
    titulos,
    dividas,
    clientes,
    restruturacoes,
    irregularidades,
    garantiasPrestadas,
    garantiasRecebidas,
    totalSaldoPorMoeda,
  } = useMemo(() => extractClientes(fichaFiador?.clientes || []), [fichaFiador?.clientes]);
  const { entidade = null, rendimento = null, fiancas, mensagens, central_risco: cr } = fichaFiador || {};

  const nome = entidadeSel?.nome || entidadeSel?.nome_entidade;
  const numero = entidadeSel?.numero || entidadeSel?.numero_entidade;

  useEffect(() => {
    const entidade = entidadeSel?.numero || entidadeSel?.numero_entidade;
    if (entidade) dispatch(getFromIntranet('fichaFiador', { entidade, reset: { dados: null } }));
  }, [entidadeSel]);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitleAlt onClose={onClose} title={`${numero} - ${nome ? nome : 'Informação da entidade'}`} />
      <DialogContent>
        {isLoading ? (
          <SkeletonEntidade />
        ) : (
          <Stack spacing={2} sx={{ pt: 2 }}>
            <ResumoFiador dados={{ clientes, entidade, fiancas, dividas, cr, irregularidades, mensagens }} />
            <AccordionItem
              title="1. Identificação"
              children={<Identificcao entidade={{ numero, ...entidade, ...rendimento }} />}
            />
            <AccordionItem title="2. Clientes associados" children={<Clientes dados={clientes} />} />
            <AccordionItem
              title="3. Saldos e Aplicações"
              children={<Saldos dados={saldos} titulos={titulos} totalMoedas={totalSaldoPorMoeda} />}
            />
            <AccordionItem title="4. Crédito e outras responsabilidades">
              <Responsabilidades
                responsabilidades={{ dividas, garantiasPrestadas, garantiasRecebidas, irregularidades }}
              />
            </AccordionItem>
            <AccordionItem
              title="5. Responsabilidades como Fiador/Avalista"
              children={<AvalesFiancas dados={{ fiancas }} />}
            />
            <AccordionItem title="6. Informações da central de riscos" children={<CentralRisco cr={cr} />} />
            <AccordionItem title="7. Mensagens pendentes" children={<Mensagens dados={mensagens} />} />
            <AccordionItem title="8. Restruturações" children={<Restruturacoes dados={restruturacoes} />} />
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
