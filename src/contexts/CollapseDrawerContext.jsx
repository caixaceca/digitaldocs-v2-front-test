import { createContext, useState, useMemo, useCallback } from 'react';
// hooks
import useResponsive from '../hooks/useResponsive';

// ---------------------------------------------------------------------------------------------------------------------

const initialState = {
  isCollapse: false,
  collapseClick: false,
  collapseHover: false,
  onToggleCollapse: () => {},
  onHoverEnter: () => {},
  onHoverLeave: () => {},
};

const CollapseDrawerContext = createContext(initialState);

// ---------------------------------------------------------------------------------------------------------------------

function CollapseDrawerProvider({ children }) {
  const isDesktop = useResponsive('up', 'lg');

  const [collapse, setCollapse] = useState({ click: false, hover: false });

  const activeClick = isDesktop ? collapse.click : false;
  const activeHover = isDesktop ? collapse.hover : false;

  const handleToggleCollapse = useCallback(() => {
    setCollapse((prev) => ({ ...prev, click: !prev.click }));
  }, []);

  const handleHoverEnter = useCallback(() => {
    setCollapse((prev) => (prev.click ? { ...prev, hover: true } : prev));
  }, []);

  const handleHoverLeave = useCallback(() => {
    setCollapse((prev) => ({ ...prev, hover: false }));
  }, []);

  const value = useMemo(
    () => ({
      isCollapse: activeClick && !activeHover,
      collapseClick: activeClick,
      collapseHover: activeHover,
      onToggleCollapse: handleToggleCollapse,
      onHoverEnter: handleHoverEnter,
      onHoverLeave: handleHoverLeave,
    }),
    [activeClick, activeHover, handleToggleCollapse, handleHoverEnter, handleHoverLeave]
  );

  return <CollapseDrawerContext.Provider value={value}>{children}</CollapseDrawerContext.Provider>;
}

export { CollapseDrawerProvider, CollapseDrawerContext };
