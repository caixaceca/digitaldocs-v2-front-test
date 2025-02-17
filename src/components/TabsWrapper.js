import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
// utils
import { setItemValue } from '../utils/formatObject';

// ----------------------------------------------------------------------

const TabsWrapperStyle = styled('div')(({ theme }) => ({
  zIndex: 9,
  bottom: 0,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('sm')]: { justifyContent: 'center' },
  [theme.breakpoints.up('md')]: { justifyContent: 'flex-end', paddingRight: theme.spacing(3) },
}));

const TabsWrapperStyleSimple = styled('div')(({ theme }) => ({
  zIndex: 9,
  bottom: 0,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  justifyContent: 'center',
  paddingRight: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
}));

// ----------------------------------------------------------------------

TabsWrapper.propTypes = {
  tab: PropTypes.string,
  title: PropTypes.string,
  changeTab: PropTypes.func,
  tabsList: PropTypes.array,
  currentTab: PropTypes.string,
};

export default function TabsWrapper({ title, tabsList, currentTab, changeTab, tab }) {
  return (
    <Card sx={{ mb: 3, height: 100, position: 'relative' }}>
      <Box sx={{ px: 2, py: 1, color: 'common.white', backgroundColor: 'primary.main' }}>
        <Typography variant="h4">{title}</Typography>
      </Box>
      <TabsWrapperStyle>
        <Tabs
          value={currentTab}
          scrollButtons="auto"
          variant="scrollable"
          allowScrollButtonsMobile
          onChange={(event, newValue) => setItemValue(newValue, changeTab, tab)}
        >
          {tabsList.map((tab) => (
            <Tab
              disableRipple
              key={tab?.value}
              icon={tab?.icon}
              value={tab?.value}
              sx={{ px: 0.75, mt: 0.5 }}
              label={tab?.label || tab?.value}
            />
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
    <Card sx={{ height: 50, position: 'relative', mb: 3, ...sx }}>
      <TabsWrapperStyleSimple sx={{ bgcolor: sx?.boxShadow === 'none' && 'background.neutral' }}>
        <Tabs
          value={currentTab}
          scrollButtons="auto"
          variant="scrollable"
          onChange={changeTab}
          allowScrollButtonsMobile
        >
          {tabsList.map((tab) => (
            <Tab
              disableRipple
              key={tab.value}
              icon={tab.icon}
              value={tab.value}
              sx={{ px: 0.5, mt: 0.5 }}
              label={tab?.label || tab?.value}
            />
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
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={{ px: 2, pt: 0.5, bgcolor: 'background.neutral' }}
      onChange={(event, newValue) => setItemValue(newValue, setTipo, item ? `tipo${item}` : '', false)}
    >
      {tabs.map((tab) => (
        <Tab disableRipple key={tab.value} value={tab.value} label={tab.value} sx={{ px: 1 }} />
      ))}
    </Tabs>
  );
}
