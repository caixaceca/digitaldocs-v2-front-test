import { useState } from 'react';
import { useNavigate, createSearchParams } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { Input, Slide, Button, InputAdornment, ClickAwayListener } from '@mui/material';
// utils
import cssStyles from '../../utils/cssStyles';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useToggle from '../../hooks/useToggle';

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
  [theme.breakpoints.up('md')]: { height: APPBAR_DESKTOP, padding: theme.spacing(0, 5) },
}));

// ----------------------------------------------------------------------

export default function Procurar() {
  const navigate = useNavigate();
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
    if (event.key === 'Enter' && searchQuery.length > 0) {
      navigate({
        pathname: PATH_DIGITALDOCS.processos.procurar,
        search: createSearchParams({ chave: searchQuery }).toString(),
      });
      onClose();
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
            sx={{ fontSize: { md: 20 }, pr: { md: 10 } }}
            startIcon={<SearchIcon sx={{ width: 30, height: 30 }} />}
          >
            Procurar...
          </Button>
        )}

        <Slide direction="down" in={open} mountOnEnter unmountOnExit>
          <ProcurarStyle>
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
                  <SearchIcon sx={{ width: 30, height: 30, color: 'text.success' }} />
                </InputAdornment>
              }
              sx={{ mr: 1, fontWeight: 'fontWeightBold' }}
            />
            {searchQuery.length > 0 && (
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
