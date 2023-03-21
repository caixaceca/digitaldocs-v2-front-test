// @mui
import * as React from 'react';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import {
  Radio,
  Stack,
  Tooltip,
  RadioGroup,
  IconButton,
  DialogTitle,
  DialogContent,
  FormControlLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { createDisposicao, closeDisposicao } from '../redux/slices/disposicao';
// components
import DialogAnimate from '../components/animate/DialogAnimate';
// sections
import FraseContent from '../sections/home/FraseContent';

// ----------------------------------------------------------------------

const options = ['desmotivado', 'neutro', 'motivado', 'radiante'];

const BpIcon = styled('span')(({ icon }) => ({
  width: 60,
  height: 60,
  backgroundImage: `url(/assets/illustrations/${icon}.png)`,
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  filter: 'grayscale(100%)',
  'input:hover ~ &': {
    filter: 'grayscale(40%)',
    transform: 'scale(1.15)',
  },
}));

const BpCheckedIcon = styled('span')(({ icon }) => ({
  width: 60,
  height: 60,
  transform: 'scale(1.3)',
  backgroundImage: `url(/assets/${icon}.png)`,
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  'input:hover ~ &': {
    filter: 'grayscale(20%)',
    transform: 'scale(1.15)',
  },
  filter: 'grayscale(0%)',
}));

// ----------------------------------------------------------------------

BpRadio.propTypes = {
  value: PropTypes.string,
};

function BpRadio(props) {
  return (
    <Radio
      sx={{
        '&:hover': {
          bgcolor: 'transparent',
        },
      }}
      disableRipple
      color="default"
      checkedIcon={<BpCheckedIcon icon={props.value} />}
      icon={<BpIcon icon={props.value} />}
      {...props}
    />
  );
}

// ----------------------------------------------------------------------

export default function Disposicao() {
  const { enqueueSnackbar } = useSnackbar();
  const { done, error } = useSelector((state) => state.disposicao);

  useEffect(() => {
    if (done === 'disposicao') {
      enqueueSnackbar('Obrigado(a) por partilhares a sua disposição connosco.', { variant: 'success' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error[0]?.msg || error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return <DisposicaoDialog id="disposicao-dialog" keepMounted />;
}

// ----------------------------------------------------------------------

function DisposicaoDialog() {
  const dispatch = useDispatch();
  const value = React.useState(null);
  const radioGroupRef = React.useRef(null);
  const { frase } = useSelector((state) => state.frase);
  const { mail } = useSelector((state) => state.colaborador);
  const { isOpenDisposicao } = useSelector((state) => state.disposicao);

  const handleEntering = () => {
    if (radioGroupRef.current != null) {
      radioGroupRef.current.focus();
    }
  };

  const handleChange = (event) => {
    const values = { disposicao: event.target.value };
    const formData = JSON.stringify(values);
    dispatch(createDisposicao(formData, mail));
  };

  const handleClose = () => {
    dispatch(closeDisposicao());
  };

  return (
    <DialogAnimate
      // sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="sm"
      TransitionProps={{ onEntering: handleEntering }}
      open={isOpenDisposicao}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          Como te sentes hoje?
          <IconButton size="small" onClick={handleClose}>
            <CloseOutlinedIcon sx={{ width: 18, opacity: 0.75 }} />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ mt: 3, pb: 1 }}>
        <Stack direction="row" justifyContent="center" sx={{ pb: 3 }}>
          <RadioGroup
            ref={radioGroupRef}
            aria-label="disposicao"
            name="disposicao"
            value={value}
            onChange={handleChange}
            row
            justifyContent="center"
          >
            {options.map((option) => (
              <Tooltip key={option} title={option.toUpperCase()} arrow>
                <FormControlLabel value={option} control={<BpRadio />} label={false} />
              </Tooltip>
            ))}
          </RadioGroup>
        </Stack>
        <Stack direction="row" justifyContent="center">
          <FraseContent frase={frase} img="" origem="disposicao" />
        </Stack>
      </DialogContent>
    </DialogAnimate>
  );
}
