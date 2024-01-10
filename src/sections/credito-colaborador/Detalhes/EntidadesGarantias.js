import { useState } from 'react';
import PropTypes from 'prop-types';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// utils
import { ptDate, ptDateTime } from '../../../utils/formatTime';
// components
import Label from '../../../components/Label';
import { Criado } from '../../../components/Panel';
import Scrollbar from '../../../components/Scrollbar';
import { SearchNotFoundSmall } from '../../../components/table';
//
import { TextItem } from './DadosGerais';
import TableDetalhes from './TableDetalhes';

// ----------------------------------------------------------------------

EntidadesGarantias.propTypes = { item: PropTypes.string, dados: PropTypes.array };

export default function EntidadesGarantias({ item, dados }) {
  const [accord, setAccord] = useState(`${item}_0`);

  const handleAccord = (panel) => (event, isExpanded) => {
    setAccord(isExpanded ? panel : '');
  };

  return (
    <>
      {dados?.length === 0 ? (
        <Stack sx={{ mt: 5 }}>
          <SearchNotFoundSmall message="Não foi encontrado nenhum registo disponível..." />
        </Stack>
      ) : (
        <Scrollbar sx={{ p: 3 }}>
          {dados?.map((row, index) => (
            <Accordion
              key={`${item}_${index}`}
              expanded={accord === `${item}_${index}`}
              onChange={handleAccord(`${item}_${index}`)}
            >
              <AccordionSummary expandIcon={<KeyboardArrowDownIcon />} sx={{ py: 0.75 }}>
                <Stack direction="row" justifyContent="left" alignItems="center" sx={{ pr: 2 }} spacing={1}>
                  <Typography variant="subtitle1">
                    {item === 'entidades' ? `${row?.nome} ${row?.entidade ? ` - ${row?.entidade}` : ''}` : row?.tipo}
                  </Typography>
                  {item === 'garantias' && (
                    <Label color={row?.ativo ? 'success' : 'error'}>{row?.ativo ? 'Ativo' : 'Inativo'}</Label>
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={row?.anexos?.length > 0 ? 5 : 12}>
                    {item === 'entidades' ? (
                      <>
                        {row?.titularidade && <TextItem title="Titularidade:" text={row?.titularidade} />}
                        {row?.relacao && <TextItem title="Relação:" text={row?.relacao} />}
                        {row?.nif && <TextItem title="NIF:" text={row?.nif} />}
                        {row?.doc_id && <TextItem title="Doc. identificação:" text={row?.doc_id} />}
                        {row?.doc_data_emissao && (
                          <TextItem title="Data emissão Doc. Ident.:" text={ptDate(row?.doc_data_emissao)} />
                        )}
                        {row?.doc_data_validade && (
                          <TextItem title="Data validade Doc. Ident.:" text={ptDate(row?.doc_data_validade)} />
                        )}
                        {row?.data_nascimento && (
                          <TextItem title="Data nascimento:" text={ptDate(row?.data_nascimento)} />
                        )}
                        {row?.estado_civil && <TextItem title="Estado civil:" text={row?.estado_civil} />}
                        {row?.email && <TextItem title="Email:" text={row?.email} />}
                        {row?.telefone && <TextItem title="Telefone:" text={row?.telefone} />}
                        {row?.telefone_sec && <TextItem title="Telefone secundário:" text={row?.telefone_sec} />}
                        {row?.morada && <TextItem title="Morada:" text={row?.morada} />}
                        {row?.regime_casamento && (
                          <TextItem title="Regime de casamento:" text={row?.regime_casamento} />
                        )}
                      </>
                    ) : (
                      <>
                        {row?.tipo === 'Fiança' && (
                          <TextItem
                            title="Colaborador da Caixa:"
                            label={
                              <Label color={row?.is_colaborador ? 'success' : 'default'}>
                                {row?.is_colaborador ? 'Sim' : 'Não'}
                              </Label>
                            }
                          />
                        )}
                        {row?.conta_dp && <TextItem title="Conta DP:" text={row?.conta_dp} />}
                        {row?.numero_hipoteca && <TextItem title="Nº da hipoteca:" text={row?.numero_hipoteca} />}
                        {row?.descritivo && <TextItem title="Descritivo:" text={row?.descritivo} />}
                        <TextItem
                          title="Adicionado:"
                          text={
                            <>
                              <Criado value={row?.criador} />
                              <Criado tipo="data" value={ptDateTime(row?.criado_em)} />
                            </>
                          }
                        />
                        {(row?.modificador || row?.modificado_em) && (
                          <TextItem
                            title="Modificado:"
                            text={
                              <>
                                {row?.modificador && <Criado value={row?.modificador} />}
                                {row?.modificado_em && <Criado tipo="data" value={ptDateTime(row?.modificado_em)} />}
                              </>
                            }
                          />
                        )}
                      </>
                    )}
                  </Grid>
                  {row?.anexos?.length > 0 && (
                    <Grid item xs={12} md={7}>
                      <TableDetalhes item={`anexos ${item}`} anexosList={row?.anexos} />
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Scrollbar>
      )}
    </>
  );
}
