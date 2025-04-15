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
// components
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

ListSelect.propTypes = { disponiveis: PropTypes.array, atribuidos: PropTypes.array, changeItems: PropTypes.func };

export default function ListSelect({ disponiveis, atribuidos, changeItems }) {
  const [checked, setChecked] = useState([]);
  const [filterL, setFilterL] = useState('');
  const [filterR, setFilterR] = useState('');
  const [left, setLeft] = useState(disponiveis);
  const [right, setRight] = useState(atribuidos);
  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  useEffect(() => {
    changeItems(right);
  }, [right, changeItems]);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) newChecked.push(value);
    else newChecked.splice(currentIndex, 1);

    setChecked(newChecked);
  };

  const numberOfChecked = (items) => intersection(checked, items).length;

  const handleToggleAll = (items) => () => {
    if (numberOfChecked(items) === items.length) setChecked(not(checked, items));
    else setChecked(union(checked, items));
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

  const searchField = (value, setValue) => (
    <SearchField
      size="small"
      filter={value}
      setFilter={setValue}
      sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'background.paper' } }}
    />
  );

  const buttonChange = (left, onClick, disabled) => (
    <Button size="small" variant="soft" onClick={onClick} disabled={disabled} sx={{ my: 1, minWidth: 48 }}>
      {left ? <ArrowForwardIosOutlinedIcon sx={{ width: 18 }} /> : <ArrowBackIosNewOutlinedIcon sx={{ width: 18 }} />}
    </Button>
  );

  const customList = (title, items) => (
    <Card sx={{ bgcolor: 'background.neutral', borderRadius: 1.5, boxShadow: (theme) => theme.customShadows.cardAlt }}>
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
      <Stack sx={{ p: 1, pb: 0 }}>
        {title === 'Disponíveis' ? searchField(filterL, setFilterL) : searchField(filterR, setFilterR)}
      </Stack>
      <List
        dense
        role="list"
        component="div"
        sx={{ maxWidth: { xs: 200, md: 320 }, minWidth: { xs: 200, md: 320 }, height: 300, overflow: 'auto' }}
      >
        <Scrollbar>
          {items.map((value) => (
            <ListItemButton key={value?.label} role="listitem" onClick={handleToggle(value)}>
              <ListItemIcon sx={{ mr: 0.75 }}>
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
      <Grid container justifyContent="center" alignItems="center" sx={{ py: 1, minWidth: 660 }}>
        <Grid item>{customList('Disponíveis', filterDados(left, filterL))}</Grid>
        <Grid item>
          <Grid container direction="column" alignItems="center" sx={{ p: 1.5 }}>
            {buttonChange(true, handleCheckedRight, leftChecked.length === 0)}
            {buttonChange(false, handleCheckedLeft, rightChecked.length === 0)}
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
