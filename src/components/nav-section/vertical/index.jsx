// @mui
import Box from '@mui/material/Box';
import List from '@mui/material/List';
//
import { ListSubheaderStyle } from './style';
import NavList from './NavList';

// ---------------------------------------------------------------------------------------------------------------------

export default function NavSectionVertical({ navConfig, isCollapse, ...other }) {
  return (
    <Box {...other}>
      {navConfig.map((group) => (
        <List key={group.subheader} disablePadding sx={{ px: 2 }}>
          <ListSubheaderStyle sx={{ ...(isCollapse && { display: 'none' }) }}>{group.subheader}</ListSubheaderStyle>

          {group.items.map((list) => (
            <NavList
              depth={1}
              data={list}
              isCollapse={isCollapse}
              key={list.title + list.path}
              hasChildren={!!list.children}
            />
          ))}
        </List>
      ))}
    </Box>
  );
}
