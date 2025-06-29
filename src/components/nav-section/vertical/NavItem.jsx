// @mui
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// guards
import RoleBasedGuard from '../../../guards/RoleBasedGuard';
//
import { ListItemStyle, ListItemTextStyle, ListItemIconStyle } from './style';

// ---------------------------------------------------------------------------------------------------------------------

export default function NavItem({ item, depth, active, open, isCollapse, ...other }) {
  const { title, icon, info, children, disabled, caption, roles } = item;

  const renderContent = (
    <ListItemStyle depth={depth} active={active} disabled={disabled} {...other}>
      {icon && <ListItemIconStyle>{icon}</ListItemIconStyle>}

      {depth !== 1 && <DotIcon active={active && depth !== 1} />}

      <ListItemTextStyle
        isCollapse={isCollapse}
        primary={title}
        secondary={
          caption && (
            <Tooltip title={caption} placement="top-start">
              <span>{caption}</span>
            </Tooltip>
          )
        }
        primaryTypographyProps={{
          noWrap: true,
          textTransform: 'none !important',
          variant: active ? 'subtitle2' : 'body2',
        }}
        secondaryTypographyProps={{ noWrap: true, variant: 'caption' }}
      />

      {!isCollapse && (
        <>
          {info && (
            <Box component="span" sx={{ lineHeight: 0 }}>
              {info}
            </Box>
          )}

          {!!children &&
            (open ? (
              <KeyboardArrowDownIcon sx={{ width: 16, height: 16, ml: 1, flexShrink: 0 }} />
            ) : (
              <ChevronRightIcon sx={{ width: 16, height: 16, ml: 1, flexShrink: 0 }} />
            ))}
        </>
      )}
    </ListItemStyle>
  );

  return <RoleBasedGuard roles={roles}>{renderContent}</RoleBasedGuard>;
}

// ---------------------------------------------------------------------------------------------------------------------

export function DotIcon({ active }) {
  return (
    <ListItemIconStyle>
      <Box
        component="span"
        sx={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          bgcolor: 'text.disabled',
          transition: (theme) =>
            theme.transitions.create('transform', { duration: theme.transitions.duration.shorter }),
          ...(active && { transform: 'scale(2)', bgcolor: 'primary.main' }),
        }}
      />
    </ListItemIconStyle>
  );
}
