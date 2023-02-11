import { useMsal } from '@azure/msal-react';
import { useState } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Divider, Button, Typography, Stack, Link, MenuItem } from '@mui/material';
// components
import MyAvatar from '../../components/MyAvatar';
import MenuPopover from '../../components/MenuPopover';
import { IconButtonAnimate } from '../../components/animate';

// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  { label: 'Intranet', linkTo: 'https://intranet.caixa.cv' },
  { label: 'Portal do colaborador', linkTo: 'https://intranet.caixa.cv/portal' },
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const { accounts, instance } = useMsal();

  const handleLogout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: '/',
      mainWindowRedirectUri: '/',
    });
  };

  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  return (
    <>
      <IconButtonAnimate
        onClick={handleOpen}
        sx={{
          p: 0,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '110%',
              height: '110%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.5),
            },
          }),
        }}
      >
        <MyAvatar />
      </IconButtonAnimate>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{ p: 0, mt: 1.5, ml: 0.75, '& .MuiMenuItem-root': { typography: 'body2', borderRadius: 0.75 } }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            {accounts[0]?.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {accounts[0]?.username}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {MENU_OPTIONS.map((option) => (
            <Link href={option.linkTo} key={option.label} underline="none" sx={{ color: 'text.primary' }}>
              <MenuItem>{option.label}</MenuItem>
            </Link>
          ))}
        </Stack>
        <Stack sx={{ p: 1 }}>
          <Divider sx={{ borderStyle: 'dashed' }} />
          <Button variant="secondary" className="ml-auto" onClick={() => handleLogout('popup')}>
            Sair
          </Button>
        </Stack>
      </MenuPopover>
    </>
  );
}
