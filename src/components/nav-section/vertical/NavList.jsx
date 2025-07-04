import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// @mui
import List from '@mui/material/List';
import Link from '@mui/material/Link';
import Collapse from '@mui/material/Collapse';
//
import NavItem from './NavItem';
import { getActive, isExternalLink } from '..';

// ---------------------------------------------------------------------------------------------------------------------

export default function NavList({ data, depth, hasChildren, isCollapse = false }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = getActive(data.path, pathname);
  const [open, setOpen] = useState(active);

  const handleClickItem = () => {
    if (!hasChildren) navigate(data.path);
    setOpen(!open);
  };

  return (
    <>
      {isExternalLink(data.path) ? (
        <>
          {data.path === 'https://intranet.caixa.cv' || data.path === 'https://intranet.caixa.cv/portal/perfil' ? (
            <Link href={data.path} underline="none">
              <NavItem item={data} depth={depth} open={open} active={active} isCollapse={isCollapse} />
            </Link>
          ) : (
            <Link href={data.path} target="_blank" rel="noopener" underline="none">
              <NavItem item={data} depth={depth} open={open} active={active} isCollapse={isCollapse} />
            </Link>
          )}
        </>
      ) : (
        <NavItem
          item={data}
          depth={depth}
          open={open}
          active={active}
          isCollapse={isCollapse}
          onClick={handleClickItem}
        />
      )}

      {!isCollapse && hasChildren && (
        <Collapse in={open} unmountOnExit>
          <List component="div" disablePadding>
            <NavSubList data={data.children} depth={depth} />
          </List>
        </Collapse>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function NavSubList({ data, depth }) {
  return (
    <>
      {data.map((list) => (
        <NavList key={list.title + list.path} data={list} depth={depth + 1} hasChildren={!!list.children} />
      ))}
    </>
  );
}
