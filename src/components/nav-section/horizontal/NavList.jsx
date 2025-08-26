import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// @mui
import Link from '@mui/material/Link';
//
import { PaperStyle } from './style';
import NavItem from './NavItem';
import { getActive, isExternalLink } from '..';

// ---------------------------------------------------------------------------------------------------------------------

export default function NavList({ data, depth, hasChildren }) {
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const active = getActive(data.path, pathname);

  useEffect(() => {
    if (open) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleClickItem = () => {
    if (!hasChildren) navigate(data.path);
  };

  return (
    <>
      {isExternalLink(data.path) ? (
        <>
          {data.path === 'https://intranet.caixa.cv' || data.path === 'https://intranet.caixa.cv/portal/perfil' ? (
            <Link href={data.path} underline="none">
              <NavItem item={data} depth={depth} open={open} active={active} />
            </Link>
          ) : (
            <Link href={data.path} target="_blank" rel="noopener" underline="none">
              <NavItem item={data} depth={depth} open={open} active={active} />
            </Link>
          )}
        </>
      ) : (
        <NavItem
          item={data}
          depth={depth}
          open={open}
          active={active}
          ref={menuRef}
          onClick={handleClickItem}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        />
      )}

      {hasChildren && (
        <PaperStyle
          open={open}
          anchorEl={menuRef.current}
          anchorOrigin={
            depth === 1 ? { vertical: 'bottom', horizontal: 'left' } : { vertical: 'center', horizontal: 'right' }
          }
          transformOrigin={
            depth === 1 ? { vertical: 'top', horizontal: 'left' } : { vertical: 'center', horizontal: 'left' }
          }
          PaperProps={{
            onMouseEnter: () => setOpen(true),
            onMouseLeave: () => setOpen(false),
          }}
        >
          <NavSubList data={data.children} depth={depth} />
        </PaperStyle>
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
