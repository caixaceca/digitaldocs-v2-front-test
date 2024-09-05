import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
// @mui
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
// utils
import { ptDate } from '../../../utils/formatTime';
import { newLineText } from '../../../utils/formatText';
import { fCurrency, fPercent } from '../../../utils/formatNumber';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { updateItemCC, gotoStep, backStep } from '../../../redux/slices/cc';
// components
import { DefaultAction } from '../../../components/Actions';

// ----------------------------------------------------------------------

PedidoCompleto.propTypes = { open: PropTypes.bool };

export default function PedidoCompleto({ open }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId, cc } = useSelector((state) => state.intranet);
  const { pedidoForm, pedidoCC, isSaving } = useSelector((state) => state.cc);
  const anexosAtivos = pedidoCC?.anexos?.filter((item) => item.ativo) || [];

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('cliente', pedidoForm?.cliente);
      formData.append('salario', pedidoForm?.salario);
      formData.append('fluxo_id', pedidoForm?.fluxo_id);
      formData.append('linha_id', pedidoForm?.linha?.id);
      formData.append('perfil_id', pedidoForm?.perfil_id);
      formData.append('taxa_juros', pedidoForm?.taxa_juros);
      formData.append('finalidade', pedidoForm?.finalidade);
      formData.append('uo_origem_id', pedidoForm?.uo_origem_id);
      formData.append('conta_salario', pedidoForm?.conta_salario);
      formData.append('categoria_nivel', pedidoForm?.categoria_nivel);
      formData.append('setor_atividade', pedidoForm?.setor_atividade);
      formData.append('estado_origem_id', pedidoForm?.estado_origem_id);
      formData.append('prazo_amortizacao', pedidoForm?.prazo_amortizacao);
      formData.append('montante_solicitado', pedidoForm?.montante_solicitado);
      if (pedidoForm?.observacao) {
        formData.append('observacao', pedidoForm?.observacao);
      }
      if (pedidoForm?.salario_conjuge) {
        formData.append('salario_conjuge', pedidoForm?.salario_conjuge);
      }
      if (pedidoForm?.entidade_patronal_conjuge) {
        formData.append('entidade_patronal_conjuge', pedidoForm?.entidade_patronal_conjuge);
      }
      pedidoForm?.anexos?.forEach((row, index) => {
        if (row?.anexo instanceof File) {
          if (row?.idItem) {
            formData.append(`anexos[${index}].id`, row?.idItem);
          }
          formData.append(`anexos[${index}].anexo`, row?.anexo);
          formData.append(`anexos[${index}].designacao_id`, row?.descricao?.id);
          formData.append(
            `anexos[${index}].data_validade`,
            row?.data_validade ? format(row.data_validade, 'yyyy-MM-dd') : null
          );
        }
      });
      pedidoForm?.despesas?.forEach((row, index) => {
        if (row?.idItem) {
          formData.append(`despesas[${index}].id`, row?.idItem);
        }
        formData.append(`despesas[${index}].valor`, row?.valor);
        formData.append(`despesas[${index}].designacao_id`, row?.despesa?.id);
      });
      pedidoForm?.responsabilidades?.forEach((row, index) => {
        if (row?.idItem) {
          formData.append(`outros_creditos[${index}].id`, row?.idItem);
        }
        formData.append(`outros_creditos[${index}].na_caixa`, row?.na_caixa);
        formData.append(`outros_creditos[${index}].montante`, row?.montante);
        formData.append(`outros_creditos[${index}].taxa_juro`, row?.taxa_juro);
        formData.append(`outros_creditos[${index}].prazo_restante`, row?.prazo_restante);
        formData.append(`outros_creditos[${index}].capital_em_divida`, row?.capital_em_divida);
        formData.append(`outros_creditos[${index}].prazo_amortizacao`, row?.prazo_amortizacao);
      });
      pedidoForm?.garantias?.forEach((row, index) => {
        if (row?.idItem) {
          formData.append(`garantias[${index}].id`, row?.idItem);
        }
        formData.append(`garantias[${index}].tipo`, row?.tipo);
        formData.append(`garantias[${index}].conta_dp`, row?.conta_dp);
        formData.append(`garantias[${index}].descritivo`, row?.descritivo);
        formData.append(`garantias[${index}].is_colaborador`, row?.is_colaborador);
        formData.append(`garantias[${index}].numero_hipoteca`, row?.numero_hipoteca);
        row?.anexos?.forEach((item, index1) => {
          if (item?.anexo instanceof File) {
            if (row?.idItem) {
              formData.append(`garantias[${index}].id`, item?.idItem);
            }
            formData.append(`garantias[${index}].anexos[${index1}].anexo`, item?.anexo);
            formData.append(`garantias[${index}].anexos[${index1}].designacao_id`, item?.descricao?.id);
            formData.append(
              `garantias[${index}].anexos[${index1}].data_validade`,
              item?.data_validade ? format(item.data_validade, 'yyyy-MM-dd') : null
            );
          }
        });
      });
      pedidoForm?.entidades?.forEach((row, index) => {
        if (row?.idItem) {
          formData.append(`entidades[${index}].id`, row?.idItem);
        }
        if (!row?.titularidade && row?.is_cliente) {
          formData.append(`entidades[${index}].entidade`, row?.entidade);
        } else if (!row?.titularidade && !row?.is_cliente) {
          formData.append(`entidades[${index}].nome`, row?.nome);
          if (row?.relacao) {
            formData.append(`entidades[${index}].relacao`, row?.relacao);
          }
          if (row?.nif) {
            formData.append(`entidades[${index}].nif`, row?.nif);
          }
          if (row?.email) {
            formData.append(`entidades[${index}].email`, row?.email);
          }
          if (row?.doc_id) {
            formData.append(`entidades[${index}].doc_id`, row?.doc_id);
          }
          if (row?.morada) {
            formData.append(`entidades[${index}].morada`, row?.morada);
          }
          if (row?.telefone) {
            formData.append(`entidades[${index}].telefone`, row?.telefone);
          }
          if (row?.telefone_sec) {
            formData.append(`entidades[${index}].telefone_sec`, row?.telefone_sec);
          }
          if (row?.estado_civil) {
            formData.append(`entidades[${index}].estado_civil`, row?.estado_civil);
          }
          if (row?.regime_casamento) {
            formData.append(`entidades[${index}].regime_casamento`, row?.regime_casamento);
          }
          if (row?.data_nascimento) {
            formData.append(`entidades[${index}].data_nascimento`, format(row.data_nascimento, 'yyyy-MM-dd'));
          }
          if (row?.doc_data_emissao) {
            formData.append(`entidades[${index}].doc_data_emissao`, format(row.doc_data_emissao, 'yyyy-MM-dd'));
          }
          if (row?.doc_data_validade) {
            formData.append(`entidades[${index}].doc_data_validade`, format(row.doc_data_validade, 'yyyy-MM-dd'));
          }
        }
        row?.anexos?.forEach((item, index1) => {
          if (item?.anexo instanceof File) {
            if (row?.idItem) {
              formData.append(`entidades[${index}].id`, item?.idItem);
            }
            formData.append(`entidades[${index}].anexos[${index1}].anexo`, item?.anexo);
            formData.append(`entidades[${index}].anexos[${index1}].designacao_id`, item?.descricao?.id);
            formData.append(
              `entidades[${index}].anexos[${index1}].data_validade`,
              item?.data_validade ? format(item.data_validade, 'yyyy-MM-dd') : null
            );
          }
        });
      });

      dispatch(
        updateItemCC('pedido credito', formData, {
          mail,
          perfilId,
          id: pedidoCC?.id,
          msg: 'Pedido atualizado',
          estadoId: pedidoCC?.ultimo_estado_id,
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleBack = () => {
    dispatch(backStep());
  };

  return (
    <Dialog
      fullScreen
      open={open}
      PaperProps={{ sx: { maxWidth: { md: 'calc(100% - 48px)' }, maxHeight: { md: 'calc(100% - 48px)' } } }}
    >
      <Stack spacing={3} direction="column" sx={{ m: 'auto', p: { xs: 1, sm: 3 } }}>
        <Typography variant="h4" sx={{ textAlign: 'center' }}>
          Resumo do pedido
        </Typography>
        <Table size="small">
          <TableHeadItem label="1. Dados Gerais" step={0} />
          <TableBody>
            <TableRowItem label="Nome" value={cc?.perfil?.displayName} />
            {pedidoForm?.cliente && <TableRowItem label="Nº de cliente" value={pedidoForm?.cliente} />}
            {pedidoForm?.conta_salario && <TableRowItem label="Nº conta salário" value={pedidoForm?.conta_salario} />}
            {pedidoForm?.categoria_nivel && (
              <TableRowItem label="Categoria/Nível" value={pedidoForm?.categoria_nivel} />
            )}
            {pedidoForm?.setor_atividade && (
              <TableRowItem label="Entidade patronal" value={pedidoForm?.setor_atividade} />
            )}
            {pedidoForm?.salario && <TableRowItem label="Salário" value={fCurrency(pedidoForm?.salario)} />}
            {pedidoForm?.salario_conjuge && (
              <TableRowItem label="Salário conjuge" value={fCurrency(pedidoForm?.salario_conjuge)} />
            )}
            {pedidoForm?.entidade_patronal_conjuge && (
              <TableRowItem label="Entidade patronal conjuge" value={pedidoForm?.entidade_patronal_conjuge} />
            )}
            {pedidoForm?.linha?.label && <TableRowItem label="Linha de Crédito" value={pedidoForm?.linha?.label} />}
            {pedidoForm?.montante_solicitado && (
              <TableRowItem label="Capital pretendido" value={fCurrency(pedidoForm?.montante_solicitado)} />
            )}
            {pedidoForm?.prazo_amortizacao && (
              <TableRowItem label="Prazo de amotização" value={`${pedidoForm?.prazo_amortizacao} meses`} />
            )}
            {pedidoForm?.taxa_juros && <TableRowItem label="Taxa de juros" value={fPercent(pedidoForm?.taxa_juros)} />}
            {pedidoForm?.finalidade && <TableRowItem label="Finalidade" value={pedidoForm?.finalidade} />}
            {pedidoForm?.observacao && <TableRowItem label="Observação" value={pedidoForm?.observacao} />}
          </TableBody>

          <TableHeadItem label="2. Anexos do processo" step={1} />
          <TableBody>
            {pedidoForm?.anexos?.map((row, index) => (
              <TableRowItem
                key={`anexo_${index}`}
                label={`Anexo ${index + 1}`}
                value={`${row?.descricao?.label}${
                  row?.data_validade ? ` (Validade: ${ptDate(row?.data_validade)} )` : ''
                }`}
              />
            ))}
            {anexosAtivos?.map((row, index) => (
              <TableRowItem
                key={`anexo_${index + pedidoForm?.anexos?.length}`}
                label={`Anexo ${index + pedidoForm?.anexos?.length + 1}`}
                value={`${row?.designacao}${row?.data_validade ? ` (Validade: ${ptDate(row?.data_validade)} )` : ''}`}
              />
            ))}
            {pedidoForm?.anexos?.length === 0 && anexosAtivos?.length === 0 && <SemDados />}
          </TableBody>

          <TableHeadItem label="3. Despesas" step={2} />
          <TableBody>
            {pedidoForm?.despesas?.map((row, index) => (
              <TableRowItem
                key={`despesa_${index}`}
                label={`Despesa ${index + 1}`}
                value={`${row?.despesa?.label} (${fCurrency(row?.valor)})`}
              />
            ))}
            {pedidoForm?.despesas?.length === 0 && <SemDados />}
          </TableBody>

          <TableHeadItem label="4. Responsabilidades" step={3} />
          <TableBody>
            {pedidoForm?.responsabilidades?.map((row, index) => (
              <TableRowItem
                key={`responsabilidade_${index}`}
                label={`Responsabilidade ${index + 1}`}
                value={`${
                  row?.na_caixa ? 'Responsabilidade na Caixa' : 'Responsabilidade fora da Caixa'
                }\nCapital inicial: ${fCurrency(row?.montante)}\nCapital em dívida: ${fCurrency(
                  row?.capital_em_divida
                )}\nTaxa de juros: ${fPercent(row?.taxa_juro)}\nPrazo de amortização: ${
                  row?.prazo_amortizacao
                } meses\nPrazo restante: ${row?.prazo_restante} meses`}
              />
            ))}
            {pedidoForm?.responsabilidades?.length === 0 && <SemDados />}
          </TableBody>

          <TableHeadItem label="5. Garantias" step={4} />
          <TableBody>
            {pedidoForm?.garantias?.map((row, index) => (
              <TableRowItem
                key={`garantia_${index}`}
                label={`Garantia ${index + 1}`}
                value={`${row?.tipo}\n${
                  row?.descritivo
                    ? `${row?.descritivo}${
                        row?.tipo === 'Fiança' && row?.is_colaborador ? ' (colaborador da Caixa)' : ''
                      }\n`
                    : ''
                }${row?.conta_dp ? `Conta DP: ${row?.conta_dp}\n` : ''}${
                  row?.numero_hipoteca ? `Nº de hipoteca: ${row?.numero_hipoteca}\n` : ''
                }`}
              />
            ))}
            {pedidoForm?.garantias?.length === 0 && <SemDados />}
          </TableBody>

          {pedidoForm?.entidades && (
            <>
              <TableHeadItem label="6. Entidades" step={5} />
              <TableBody>
                {pedidoForm?.entidades?.map((row, index) => (
                  <TableRowItem
                    key={`estidade_${index}`}
                    label={`Entidade ${index + 1}`}
                    value={`${row?.nome}\n${
                      row?.entidade
                        ? `Nº ${row?.entidade}${row?.titularidade ? ` (Titularidade: ${row?.titularidade})` : ''}\n`
                        : ''
                    }`}
                  />
                ))}
                {pedidoForm?.entidades?.length === 0 && <SemDados />}
              </TableBody>
            </>
          )}
        </Table>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack spacing={5} justifyContent="space-between" direction="row" alignItems="center">
          <Button
            size="large"
            sx={{ px: 5 }}
            variant="soft"
            color="inherit"
            onClick={handleBack}
            startIcon={<ArrowBackIosIcon icon="eva:arrow-ios-back-fill" sx={{ width: 18 }} />}
          >
            Voltar
          </Button>

          <LoadingButton size="large" sx={{ px: 5 }} loading={isSaving} variant="contained" onClick={onSubmit}>
            Guardar
          </LoadingButton>
        </Stack>
      </Stack>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

TableHeadItem.propTypes = { label: PropTypes.string, step: PropTypes.number };

function TableHeadItem({ label, step }) {
  const dispatch = useDispatch();
  const handleGo = () => {
    dispatch(gotoStep(step));
  };
  return (
    <TableHead>
      <TableRow>
        <TableCell colSpan={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
            {label}
            <DefaultAction color="warning" label="EDITAR" small handleClick={handleGo} />
          </Stack>
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

// ----------------------------------------------------------------------

TableRowItem.propTypes = { label: PropTypes.string, value: PropTypes.string };

function TableRowItem({ label, value }) {
  const isDesktop = useResponsive('up', 'sm');
  return (
    <TableRow hover>
      {isDesktop && (
        <TableCell align="right" sx={{ color: 'text.secondary' }}>
          {label}
        </TableCell>
      )}
      <TableCell sx={{ typography: 'body1' }}>
        {!isDesktop && <Typography sx={{ color: 'text.secondary', mb: 0.75, typography: 'body2' }}>{label}</Typography>}
        {value && newLineText(value)}
      </TableCell>
    </TableRow>
  );
}

// ----------------------------------------------------------------------

function SemDados() {
  return (
    <TableRow>
      <TableCell colSpan={2} sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
        Não foi introduzido nenhum registo...
      </TableCell>
    </TableRow>
  );
}
