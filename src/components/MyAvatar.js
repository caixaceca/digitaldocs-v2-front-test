import PropTypes from 'prop-types';
import { forwardRef } from 'react';
// @mui
import Avatar from '@mui/material/Avatar';

// ----------------------------------------------------------------------

const CustomAvatar = forwardRef(({ name, ...other }, ref) => {
  const renderContent = (
    <Avatar ref={ref} {...other}>
      {name?.charAt(0)?.toUpperCase()}
    </Avatar>
  );

  return renderContent;
});

export default CustomAvatar;

CustomAvatar.propTypes = { sx: PropTypes.object, name: PropTypes.string };
