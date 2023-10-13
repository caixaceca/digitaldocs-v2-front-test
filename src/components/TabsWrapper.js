import PropTypes from 'prop-types';
// @mui
import { alpha, styled } from '@mui/material/styles';
import { Box, Tab, Tabs, Card, Typography } from '@mui/material';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100%',
  backgroundColor: alpha(theme.palette.primary.main, 1),
}));

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
  title: PropTypes.string,
  changeTab: PropTypes.func,
  tabsList: PropTypes.array,
  currentTab: PropTypes.string,
};

export default function TabsWrapper({ title, tabsList, currentTab, changeTab }) {
  return (
    <Card sx={{ mb: 3, height: 100, position: 'relative' }}>
      <RootStyle>
        <Box sx={{ px: 2, py: 1, color: 'common.white', textAlign: { md: 'left' } }}>
          <Typography variant="h4">{title}</Typography>
        </Box>
      </RootStyle>
      <TabsWrapperStyle>
        <Tabs
          value={currentTab}
          onChange={changeTab}
          scrollButtons="auto"
          variant="scrollable"
          allowScrollButtonsMobile
        >
          {tabsList.map((tab) => (
            <Tab
              disableRipple
              key={tab?.value}
              icon={tab?.icon}
              value={tab?.value}
              label={tab?.label || tab?.value}
              sx={{ typography: 'subtitle2', px: 0.5, mt: 0.5 }}
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
    <Card sx={{ height: 50, position: 'relative', ...sx }}>
      <TabsWrapperStyleSimple>
        <Tabs
          value={currentTab}
          scrollButtons="auto"
          variant="scrollable"
          allowScrollButtonsMobile
          onChange={changeTab}
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
