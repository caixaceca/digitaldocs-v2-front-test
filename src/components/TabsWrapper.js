import PropTypes from 'prop-types';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
// utils
import { setItemValue } from '../utils/formatObject';
//
import { Voltar } from './Actions';
import { TabsWrapperStyle } from './Panel';

// ----------------------------------------------------------------------

const TabsWrapperStyleSimple = styled('div')(({ theme }) => ({
  zIndex: 9,
  bottom: 0,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('md')]: { paddingRight: theme.spacing(2) },
}));

// ----------------------------------------------------------------------

TabsWrapper.propTypes = {
  tab: PropTypes.string,
  voltar: PropTypes.bool,
  title: PropTypes.string,
  changeTab: PropTypes.func,
  tabsList: PropTypes.array,
  currentTab: PropTypes.string,
};

export default function TabsWrapper({ title, tabsList, currentTab, changeTab, tab, voltar = false }) {
  return (
    <Card sx={{ mb: 3, position: 'relative' }}>
      <Stack
        spacing={1}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, mb: '42px', py: 1, minHeight: 50, color: 'common.white', bgcolor: 'primary.main' }}
      >
        <Typography variant="h5">{title}</Typography>
        {voltar && <Voltar />}
      </Stack>
      <TabsWrapperStyle>
        <Tabs
          value={currentTab}
          allowScrollButtonsMobile
          onChange={(event, newValue) => setItemValue(newValue, changeTab, tab)}
        >
          {tabsList.map(({ value, label }) => (
            <Tab key={value} sx={{ px: 0.64, pb: 1.5, pt: 1.75, mt: 0.25 }} value={value} label={label || value} />
          ))}
        </Tabs>
      </TabsWrapperStyle>
    </Card>
  );
}

// ----------------------------------------------------------------------

TabsWrapperSimple.propTypes = {
  sx: PropTypes.object,
  changeTab: PropTypes.func,
  tabsList: PropTypes.array,
  currentTab: PropTypes.string,
};

export function TabsWrapperSimple({ tabsList, currentTab, changeTab, sx }) {
  return (
    <Card sx={{ height: 45, mb: 3, ...sx, bgcolor: sx?.boxShadow === 'none' && 'background.neutral' }}>
      <TabsWrapperStyleSimple sx={{ bgcolor: 'transparent' }}>
        <Tabs value={currentTab} onChange={changeTab} allowScrollButtonsMobile>
          {tabsList.map((tab) => (
            <Tab key={tab.value} value={tab.value} sx={{ px: 0.64, mb: 0.32 }} label={tab.label || tab.value} />
          ))}
        </Tabs>
      </TabsWrapperStyleSimple>
    </Card>
  );
}

// ----------------------------------------------------------------------

TabCard.propTypes = { tabs: PropTypes.array, tipo: PropTypes.string, item: PropTypes.string, setTipo: PropTypes.func };

export function TabCard({ tabs, tipo, item = '', setTipo }) {
  return (
    <Tabs
      value={tipo}
      allowScrollButtonsMobile
      sx={{ px: 1.5, bgcolor: 'background.neutral' }}
      onChange={(event, newValue) => setItemValue(newValue, setTipo, item ? `tipo${item}` : '', false)}
    >
      {tabs.map((tab) => (
        <Tab disableRipple key={tab.value} value={tab.value} label={tab.value} sx={{ py: 2, px: 1 }} />
      ))}
    </Tabs>
  );
}
