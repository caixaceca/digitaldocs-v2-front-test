import { useState, useEffect, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
// redux
import { getFromGaji9 } from '../../../redux/slices/gaji9';
import { useDispatch, useSelector } from '../../../redux/store';
//
import { sitClausulas } from '../../../_mock';
import { listaTitrulares, listaGarantias } from '../applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

export default function FiltrarClausulas({ inativos }) {
  const dispatch = useDispatch();
  const { segmentos, tiposTitulares, tiposGarantias } = useSelector((state) => state.gaji9);

  useEffect(() => {
    dispatch(getFromGaji9('tiposGarantias'));
  }, [dispatch]);

  const garantiasList = useMemo(() => listaGarantias(tiposGarantias), [tiposGarantias]);
  const titularesList = useMemo(() => listaTitrulares(tiposTitulares), [tiposTitulares]);
  const segmentosList = useMemo(() => segmentos?.map(({ id, designacao }) => ({ id, label: designacao })), [segmentos]);
  const seccoesList = [
    { id: 'solta', label: 'Solta' },
    { id: 'identificacao', label: 'Secção de identificação' },
    { id: 'caixa', label: 'Secção de identificação Caixa' },
  ];

  const getStoredValue = (key, list) =>
    list?.find(({ id }) => Number(id) === Number(localStorage.getItem(key))) || null;

  const [seccao, setSeccao] = useState(() => getStoredValue('seccaoCl', seccoesList));
  const [titular, setTitular] = useState(() => getStoredValue('titularCl', titularesList));
  const [garantia, setGarantia] = useState(() => getStoredValue('garantiaCl', garantiasList));
  const [segmento, setSegmento] = useState(() => getStoredValue('segmentoCl', segmentosList));
  const [situacao, setSituacao] = useState(
    () => sitClausulas?.find(({ id }) => id === localStorage.getItem('sitCl')) ?? { id: 'APROVADO', label: 'APROVADO' }
  );

  useEffect(() => {
    dispatch(
      getFromGaji9('clausulas', {
        inativos,
        titularId: titular?.id || null,
        solta: seccao?.label === 'Solta',
        garantiaId: garantia?.id || null,
        segmentoId: segmento?.id || null,
        situacao: situacao?.id || 'APROVADO',
        caixa: seccao?.label === 'Secção de identificação',
        identificacao: seccao?.label === 'Secção de identificação Caixa',
      })
    );
  }, [segmento?.id, situacao, dispatch, garantia?.id, inativos, seccao?.label, titular?.id]);

  return (
    <Card sx={{ p: 1.5, mb: 3 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ width: 1 }}>
          <SelectItem label="Situação" value={situacao} setItem={setSituacao} options={sitClausulas} />
          <SelectItem label="Secção" value={seccao} setItem={setSeccao} options={seccoesList} />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={1}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1} sx={{ width: 1 }}>
            <SelectItem label="Tipo de titular" value={titular} setItem={setTitular} options={titularesList} />
            <SelectItem label="Segmento" value={segmento} setItem={setSegmento} options={segmentosList} />
            <SelectItem label="Tipo de garantia" value={garantia} setItem={setGarantia} options={garantiasList} />
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function SelectItem({ label, value, setItem, options }) {
  const item =
    (label === 'Situação' && 'sitCl') ||
    (label === 'Secção' && 'seccaoCl') ||
    (label === 'Segmento' && 'segmentoCl') ||
    (label === 'Tipo de titular' && 'titularCl') ||
    (label === 'Tipo de garantia' && 'garantiaCl') ||
    '';
  return (
    <Autocomplete
      fullWidth
      size="small"
      value={value}
      options={options}
      disableClearable={label === 'Situação'}
      getOptionLabel={(option) => option?.label}
      isOptionEqualToValue={(option, val) => option?.id === val?.id}
      onChange={(_, newValue) => {
        setItem(newValue);
        if (item) localStorage.setItem(item, newValue?.id || '');
      }}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
}
