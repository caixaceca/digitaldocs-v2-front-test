import { memo } from 'react';
// @mui
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

function ComingSoonIllustration({ ...other }) {
  const theme = useTheme();

  const PRIMARY_LIGHT = theme.palette.primary.light;

  const PRIMARY_MAIN = theme.palette.primary.main;

  const PRIMARY_DARK = theme.palette.primary.dark;

  const PRIMARY_DARKER = theme.palette.primary.darker;

  return (
    <Box {...other}>
      <svg width="100%" height="100%" viewBox="0 0 325 325" xmlns="http://www.w3.org/2000/svg">
        {/* <BackgroundIllustration /> */}

        <path
          fill="url(#paint0_linear_1_79)"
          d="M290.378 112.9v127.8c0 .8-.2 1.6-.5 2.4-.3.8-.8 1.4-1.3 2-.6.6-1.3 1-2 1.3-.8.3-1.6.5-2.4.5h-166.7c-.8 0-1.7-.1-2.4-.5s-1.4-.8-2-1.4c-.6-.6-1-1.4-1.2-2.1-.2-.8-.3-1.6-.2-2.5V112.6c-.4-3.1 2.3-5.9 5.8-5.9h166.7c.8 0 1.6.2 2.4.5.8.3 1.4.8 2 1.3.6.6 1 1.3 1.4 2 .2.7.4 1.6.4 2.4z"
        />

        <path
          fill={PRIMARY_DARKER}
          d="M210.879 284.9c62.5 0 113.2-4.4 113.2-9.8s-50.7-9.8-113.2-9.8-113.2 4.4-113.2 9.8 50.7 9.8 113.2 9.8z"
          opacity="0.24"
        />

        <path fill={PRIMARY_DARK} d="M58.778 79.4l14.6-6 80.2 7.5v7.6l-94.8.3v-9.4z" />
        <path fill={PRIMARY_MAIN} d="M85.279 71h-14.4v215.5h14.4V71z" />
        <path
          fill="#fff"
          d="M182.079 239.7h-5.1c-.6 0-1 .4-1 1V289c0 .6.4 1 1 1h5.2c.6 0 1-.4 1-1v-48.3c-.1-.5-.5-1-1.1-1zM130.978 239.7h-5.2c-.6 0-1 .4-1 1v46.7c0 .6.4 1 1 1h5.2c.6 0 1-.4 1-1v-46.6c0-.6-.4-1.1-1-1.1z"
        />

        <path fill="#C4CDD5" d="M175.779 266h7.2v-24.7h-7.4l.2 24.7zm-50.9 0h7.2v-24.7h-7.4l.2 24.7z" opacity="0.5" />

        <path
          fill={PRIMARY_LIGHT}
          d="M277.778 126h-56.9c-1.7 0-3 1.3-3 3v83.9c0 1.7 1.3 3 3 3h56.9c1.7 0 3-1.3 3-3V129c0-1.7-1.4-3-3-3zm-70.1 0c1.7 0 3 1.3 3 3v83.9c0 1.7-1.3 3-3 3h-56.9c-1.7 0-3-1.3-3-3v-.3c0-1.7 1.3-3 3-3h29.5c1.7 0 3-1.3 3-3V129c0-1.7 1.3-3 3-3h21.4z"
          opacity="0.24"
        />

        <path
          fill={PRIMARY_DARKER}
          d="M182.079 119.7h-56.9c-1.7 0-3 1.3-3 3V205c0 1.7 1.3 3 3 3h56.9c1.7 0 3-1.3 3-3v-82.3c0-1.6-1.4-3-3-3z"
        />

        <path
          fill="#fff"
          d="M149.979 88.4h1v25c9.1-.1 20 1.1 32.3 5 .5.2.8.7.6 1.3-.2.5-.7.8-1.3.6-17.2-5.6-31.8-5.6-42.1-4.2-5.1.7-9.2 1.7-12 2.6-1.4.4-2.4.8-3.2 1.1-.4.1-.6.2-.8.3-.1 0-.2.1-.2.1-.5.2-1.1 0-1.3-.5-.2-.5 0-1.1.5-1.3l.5 1-.4-.9h.1c.1 0 .1-.1.2-.1.2-.1.5-.2.9-.4.8-.3 1.9-.7 3.3-1.1 2.9-.9 7-2 12.3-2.7 2.9-.4 6.1-.7 9.7-.8v-25h-.1z"
        />

        <path
          fill={PRIMARY_DARK}
          d="M165.378 125.4h-37c-.9 0-1.6.7-1.6 1.6 0 .9.7 1.6 1.6 1.6h37c.9 0 1.6-.7 1.6-1.6-.1-.9-.8-1.6-1.6-1.6zm-17.2 5.6h-20.5c-.5 0-.9.4-.9.9s.4.9.9.9h20.5c.5 0 .9-.4.9-.9s-.4-.9-.9-.9zm9.3 4.4h-20.5c-.5 0-.9.4-.9.9s.4.9.9.9h20.5c.5 0 .9-.4.9-.9s-.4-.9-.9-.9zm-3.9-4.4h-1.5c-.5 0-.9.4-.9.9s.4.9.9.9h1.5c.5 0 .9-.4.9-.9s-.4-.9-.9-.9zm4.7 0h-1.5c-.5 0-.9.4-.9.9s.4.9.9.9h1.5c.5 0 .9-.4.9-.9s-.4-.9-.9-.9zm-26.7 4.4h-1.5c-.5 0-.9.4-.9.9s.4.9.9.9h1.5c.5 0 .9-.4.9-.9s-.4-.9-.9-.9zm31.5-4.4h-1.5c-.5 0-.9.4-.9.9s.4.9.9.9h1.5c.5 0 .9-.4.9-.9-.1-.5-.5-.9-.9-.9z"
        />

        <path
          fill={PRIMARY_DARKER}
          d="M178.379 224c0-1.1-.9-2-2-2h-55.5c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h55.5c1.1 0 2-.9 2-2v-5z"
          opacity="0.48"
        />

        <path fill={PRIMARY_MAIN} d="M188.179 244h-70v18.2h70V244z" />
        <path
          fill="#fff"
          d="M118.479 243.3c-1.1 0-2 .9-2 2v15.8c0 1.1.9 2 2 2l69.7-.1c1.1 0 2-.9 2-2l-.4-15.6c0-1.1-.9-2-2-2l-69.3-.1zm-.1 4.5c0-1.1.9-2 2-2h5.2c1.7 0 2.6 1.9 1.6 3.2l-8.4 11.2c0 .1-.1.1-.2.1s-.2-.1-.2-.2v-12.3zm17.4-1.2c.4-.5 1-.8 1.6-.8h2.2c1.6 0 2.6 1.9 1.6 3.2l-7.8 10.5c-.4.5-1 .8-1.6.8h-2.2c-1.6 0-2.6-1.9-1.6-3.2l7.8-10.5zm13.9 0c.4-.5 1-.8 1.6-.8h2.2c1.6 0 2.6 1.9 1.6 3.2l-7.8 10.5c-.4.5-1 .8-1.6.8h-2.1c-1.6 0-2.6-1.9-1.6-3.2l7.7-10.5zm14.1 0c.4-.5 1-.8 1.6-.8h2.2c1.7 0 2.6 1.9 1.6 3.2l-7.9 10.5c-.4.5-1 .8-1.6.8h-2.1c-1.6 0-2.6-1.9-1.6-3.2l7.8-10.5zm13.9 0c.4-.5 1-.8 1.6-.8h2.2c1.6 0 2.6 1.9 1.6 3.2l-7.8 10.5c-.4.5-1 .8-1.6.8h-2.1c-1.6 0-2.6-1.9-1.6-3.2l7.7-10.5zm9.9 11.7c0 1.1-.9 2-2 2-1.6 0-2.6-1.9-1.6-3.2 1.1-1.6 3.6-.7 3.6 1.2z"
        />

        <defs>
          <linearGradient
            id="paint0_linear_1_79"
            x1="296.527"
            x2="105.126"
            y1="186.371"
            y2="167.19"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={PRIMARY_MAIN} />
            <stop offset="1" stopColor={PRIMARY_DARK} />
          </linearGradient>
        </defs>
      </svg>
    </Box>
  );
}

export default memo(ComingSoonIllustration);
