// @mui
import * as React from 'react';
import PropTypes from 'prop-types';
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
import SentimentNeutralOutlinedIcon from '@mui/icons-material/SentimentNeutralOutlined';
import SentimentSatisfiedOutlinedIcon from '@mui/icons-material/SentimentSatisfiedOutlined';
import SentimentDissatisfiedOutlinedIcon from '@mui/icons-material/SentimentDissatisfiedOutlined';
import SentimentVerySatisfiedOutlinedIcon from '@mui/icons-material/SentimentVerySatisfiedOutlined';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { createItem, closeDisposicao } from '../redux/slices/intranet';
// components
import DialogAnimate from '../components/animate/DialogAnimate';
// sections
import FraseContent from '../sections/home/FraseContent';

// ----------------------------------------------------------------------

const whicon = { width: 65, height: 65 };

const disposicoes = [
  { value: 'desmotivado', cor: '#FF4842', icon: <SentimentDissatisfiedOutlinedIcon sx={whicon} /> },
  { value: 'neutro', cor: '#FFB107', icon: <SentimentNeutralOutlinedIcon sx={whicon} /> },
  { value: 'motivado', cor: '#1890FF', icon: <SentimentSatisfiedOutlinedIcon sx={whicon} /> },
  { value: 'radiante', cor: 'rgb(90, 170, 40)', icon: <SentimentVerySatisfiedOutlinedIcon sx={whicon} /> },
];

const BpIcon = styled('span')(({ color }) => ({
  filter: 'grayscale(100%)',
  'input:hover ~ &': { filter: 'grayscale(0%)', transform: 'scale(1.15)', color },
}));

const BpCheckedIcon = styled('span')(({ color }) => ({
  transform: 'scale(1.3)',
  filter: 'grayscale(50%)',
  'input:hover ~ &': { filter: 'grayscale(0%)', transform: 'scale(1.15)', color },
}));

// ----------------------------------------------------------------------

BpRadio.propTypes = { value: PropTypes.string, cor: PropTypes.string, icon1: PropTypes.node };

function BpRadio(props) {
  return (
    <Radio
      disableRipple
      color="default"
      sx={{ py: 0, mb: -1 }}
      checkedIcon={<BpCheckedIcon color={props.cor}>{props.icon1}</BpCheckedIcon>}
      icon={<BpIcon color={props.cor}>{props.icon1}</BpIcon>}
      {...props}
    />
  );
}

// ----------------------------------------------------------------------

export default function Disposicao() {
  return <DisposicaoDialog id="disposicao-dialog" keepMounted />;
}

// ----------------------------------------------------------------------

function DisposicaoDialog() {
  const dispatch = useDispatch();
  const value = React.useState(null);
  const radioGroupRef = React.useRef(null);
  const { isOpenDisposicao, mail, frase } = useSelector((state) => state.intranet);

  const handleEntering = () => {
    if (radioGroupRef.current != null) {
      radioGroupRef.current.focus();
    }
  };

  const handleChange = (event) => {
    const values = { disposicao: event.target.value };
    const formData = JSON.stringify(values);
    dispatch(createItem('disposicao', formData, { mail, msg: 'disposicao' }));
  };

  const handleClose = () => {
    dispatch(closeDisposicao());
  };

  return (
    <DialogAnimate maxWidth="sm" TransitionProps={{ onEntering: handleEntering }} open={isOpenDisposicao}>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          Como te sentes hoje?
          <IconButton size="small" onClick={handleClose}>
            <CloseOutlinedIcon sx={{ width: 18, opacity: 0.75 }} />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ mt: 3 }}>
        <Stack direction="row" justifyContent="center" sx={{ pb: 5 }}>
          <RadioGroup
            row
            value={value}
            name="disposicao"
            ref={radioGroupRef}
            justifyContent="center"
            aria-label="disposicao"
            onChange={handleChange}
          >
            {disposicoes.map((option) => (
              <Tooltip key={option.value} title={option.value.toUpperCase()} arrow>
                <FormControlLabel value={option.value} control={<BpRadio icon1={option.icon} cor={option.cor} />} />
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
