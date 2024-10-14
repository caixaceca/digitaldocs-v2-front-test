import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import List from '@mui/material/List';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import CardHeader from '@mui/material/CardHeader';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
// utils
import { normalizeText } from '../utils/formatText';
//
import Scrollbar from './Scrollbar';
import { SearchField } from './SearchToolbar';

// ----------------------------------------------------------------------

function not(a, b) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a, b) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a, b) {
  return [...a, ...not(b, a)];
}

// ----------------------------------------------------------------------

ListSelect.propTypes = { disponiveis: PropTypes.array, atribuidos: PropTypes.array, changeFluxos: PropTypes.array };

export default function ListSelect({ disponiveis, atribuidos, changeFluxos }) {
  const [checked, setChecked] = useState([]);
  const [filterL, setFilterL] = useState('');
  const [filterR, setFilterR] = useState('');
  const [left, setLeft] = useState(disponiveis);
  const [right, setRight] = useState(atribuidos);
  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  useEffect(() => {
    changeFluxos(right);
  }, [right, changeFluxos]);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };

  const numberOfChecked = (items) => intersection(checked, items).length;

  const handleToggleAll = (items) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const customList = (title, items) => (
    <Card sx={{ borderRadius: 1.5 }}>
      <CardHeader
        avatar={
          <Checkbox
            disabled={items.length === 0}
            onClick={handleToggleAll(items)}
            checked={numberOfChecked(items) === items.length && items.length !== 0}
            indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
          />
        }
        sx={{ p: 1 }}
        title={title}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheaderTypographyProps={{ variant: 'caption' }}
        subheader={`${numberOfChecked(items)}/${items.length} selecionado`}
      />

      <Divider />
      <Stack sx={{ p: 0.5, pb: 0 }}>
        {title === 'Disponíveis' ? (
          <SearchField small filter={filterL} setFilter={setFilterL} />
        ) : (
          <SearchField small filter={filterR} setFilter={setFilterR} />
        )}
      </Stack>
      <List
        dense
        role="list"
        component="div"
        sx={{ maxWidth: { md: 320, xs: 250 }, minWidth: { md: 320, xs: 250 }, height: 300, overflow: 'auto' }}
      >
        <Scrollbar>
          {items.map((value) => (
            <ListItemButton key={value?.label} role="listitem" onClick={handleToggle(value)}>
              <ListItemIcon>
                <Checkbox size="small" tabIndex={-1} disableRipple checked={checked.indexOf(value) !== -1} />
              </ListItemIcon>
              <ListItemText primary={value?.label} primaryTypographyProps={{ typography: 'caption' }} />
            </ListItemButton>
          ))}
        </Scrollbar>
      </List>
    </Card>
  );

  return (
    <Scrollbar>
      <Grid container justifyContent="center" alignItems="center" sx={{ py: 3, minWidth: 660 }}>
        <Grid item>{customList('Disponíveis', filterDados(left, filterL))}</Grid>
        <Grid item>
          <Grid container direction="column" alignItems="center" sx={{ p: 1.5 }}>
            <Button
              size="small"
              color="inherit"
              variant="outlined"
              onClick={handleCheckedRight}
              sx={{ my: 1, minWidth: 48 }}
              disabled={leftChecked.length === 0}
            >
              <ArrowForwardIosOutlinedIcon sx={{ width: 18 }} />
            </Button>
            <Button
              size="small"
              color="inherit"
              variant="outlined"
              onClick={handleCheckedLeft}
              sx={{ my: 1, minWidth: 48 }}
              disabled={rightChecked.length === 0}
            >
              <ArrowBackIosNewOutlinedIcon sx={{ width: 18 }} />
            </Button>
          </Grid>
        </Grid>
        <Grid item>{customList('Atribuídos', filterDados(right, filterR))}</Grid>
      </Grid>
    </Scrollbar>
  );
}

// ----------------------------------------------------------------------

function filterDados(dados, filter) {
  return filter
    ? dados?.filter((row) => row?.label && normalizeText(row?.label).indexOf(normalizeText(filter)) !== -1)
    : dados;
}
