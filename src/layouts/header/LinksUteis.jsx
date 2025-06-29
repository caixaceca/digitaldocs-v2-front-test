import { useState } from 'react';
// @mui
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// utils
import { BASEURL } from '../../utils/apisUrl';
// redux
import { useSelector } from '../../redux/store';
// components
import { IconButtonHeader } from '.';
import Scrollbar from '../../components/Scrollbar';
import MenuPopover from '../../components/MenuPopover';

// ---------------------------------------------------------------------------------------------------------------------

const LogoApp = styled(Avatar)(() => ({ p: 0.5, width: '33px', height: '33px' }));

// ---------------------------------------------------------------------------------------------------------------------

export default function LinksUteis() {
  const [open, setOpen] = useState(null);
  const { links } = useSelector((state) => state.intranet);

  return (
    <>
      <IconButtonHeader title="Links úteis" open={open} setOpen={setOpen} />
      <MenuPopover
        anchorEl={open}
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        sx={{ width: 360, p: 0, pb: 1, mt: 1.5, ml: 0.75, overflow: 'inherit' }}
      >
        <Typography variant="subtitle1" sx={{ p: 2 }}>
          Links úteis
        </Typography>
        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar sx={{ maxHeight: 'calc(100vh - 150px)' }}>
          {links.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
              Sem links disponíveis
            </Typography>
          ) : (
            links?.map(({ link, nome, logo_disco: logo }) => (
              <Link target="_blank" key={link} href={link} rel="noreferrer">
                <MenuItem divider sx={{ py: 1.25, px: 2.5, borderStyle: 'dotted' }}>
                  <ListItemIcon>
                    <LogoApp variant="rounded" alt={nome} src={`${BASEURL}/aplicacao/logo/${logo}`} />
                  </ListItemIcon>
                  <ListItemText primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}>
                    {nome}
                  </ListItemText>
                </MenuItem>
              </Link>
            ))
          )}
        </Scrollbar>
      </MenuPopover>
    </>
  );
}
