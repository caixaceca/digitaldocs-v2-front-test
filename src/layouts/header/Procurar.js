import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate, createSearchParams } from 'react-router-dom';
// @mui
import { styled, useTheme } from '@mui/material/styles';
import { Input, Slide, Button, InputAdornment, ClickAwayListener } from '@mui/material';
// utils
import cssStyles from '../../utils/cssStyles';
// components
import SvgIconStyle from '../../components/SvgIconStyle';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useToggle from '../../hooks/useToggle';
import useSettings from '../../hooks/useSettings';

// ----------------------------------------------------------------------

const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 92;

const ProcurarStyle = styled('div')(({ theme }) => ({
  ...cssStyles(theme).bgBlur(),
  top: 0,
  left: 0,
  zIndex: 99,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  alignItems: 'center',
  height: APPBAR_MOBILE,
  padding: theme.spacing(0, 3),
  boxShadow: theme.customShadows.z8,
  [theme.breakpoints.up('md')]: {
    height: APPBAR_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

// ----------------------------------------------------------------------

export default function Procurar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { themeMode } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState('');
  const { toggle: open, onOpen, onClose } = useToggle();

  const handleSearchGlobal = () => {
    navigate({
      pathname: PATH_DIGITALDOCS.processos.procurar,
      search: createSearchParams({ chave: searchQuery }).toString(),
    });
    onClose();
  };

  const handleKeyUpGlobal = (event) => {
    if (event.key === 'Enter') {
      if (searchQuery?.length > 2) {
        navigate({
          pathname: PATH_DIGITALDOCS.processos.procurar,
          search: createSearchParams({ chave: searchQuery }).toString(),
        });
        onClose();
      } else {
        enqueueSnackbar('Introduza pelo menos três (3) caratéres', { variant: 'info' });
      }
    }
  };

  return (
    <ClickAwayListener onClickAway={onClose}>
      <div>
        {!open && (
          <Button
            size="large"
            variant="text"
            onClick={onOpen}
            startIcon={<SvgIconStyle src="/assets/icons/search.svg" sx={{ width: 25, height: 25 }} />}
            sx={{ fontSize: { md: 20 } }}
          >
            Procurar...
          </Button>
        )}

        <Slide direction="down" in={open} mountOnEnter unmountOnExit>
          <ProcurarStyle
            sx={{
              backgroundColor: theme.palette.grey[themeMode === 'light' ? 50 : 800],
              color: theme.palette.grey[themeMode === 'light' ? 800 : 50],
            }}
          >
            <Input
              autoFocus
              fullWidth
              disableUnderline
              placeholder="Introduza uma palavra/texto chave..."
              value={searchQuery}
              onKeyUp={handleKeyUpGlobal}
              onChange={(event) => {
                setSearchQuery(event.target.value);
              }}
              startAdornment={
                <InputAdornment position="start">
                  <SvgIconStyle src="/assets/icons/search.svg" sx={{ color: 'text.success' }} />
                </InputAdornment>
              }
              sx={{ mr: 1, fontWeight: 'fontWeightBold' }}
            />
            {searchQuery.length > 2 && (
              <Button variant="contained" onClick={handleSearchGlobal}>
                Procurar
              </Button>
            )}
          </ProcurarStyle>
        </Slide>
      </div>
    </ClickAwayListener>
  );
}
