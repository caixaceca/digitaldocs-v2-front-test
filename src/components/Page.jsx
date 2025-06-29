import { Helmet } from 'react-helmet-async';
import { forwardRef } from 'react';
// @mui
import Box from '@mui/material/Box';

// ---------------------------------------------------------------------------------------------------------------------

const Page = forwardRef(({ children, title = '', meta, ...other }, ref) => (
  <>
    <Helmet>
      <title>{`${title} | Intranet`}</title>
      {meta}
    </Helmet>

    <Box ref={ref} {...other}>
      {children}
    </Box>
  </>
));

export default Page;
