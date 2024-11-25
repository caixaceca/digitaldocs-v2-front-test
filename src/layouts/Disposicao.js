import * as React from 'react';
import PropTypes from 'prop-types';
// @mui
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import RadioGroup from '@mui/material/RadioGroup';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import SentimentNeutralOutlinedIcon from '@mui/icons-material/SentimentNeutralOutlined';
import SentimentSatisfiedOutlinedIcon from '@mui/icons-material/SentimentSatisfiedOutlined';
import SentimentDissatisfiedOutlinedIcon from '@mui/icons-material/SentimentDissatisfiedOutlined';
import SentimentVerySatisfiedOutlinedIcon from '@mui/icons-material/SentimentVerySatisfiedOutlined';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { createItem, getSuccess } from '../redux/slices/intranet';
// components
import { DTFechar } from '../components/Actions';
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
  const dispatch = useDispatch();
  const value = React.useState(null);
  const radioGroupRef = React.useRef(null);
  const { mail, frase } = useSelector((state) => state.intranet);

  const handleChange = (event) => {
    dispatch(createItem('disposicao', JSON.stringify({ disposicao: event.target.value }), { mail, msg: 'disposicao' }));
  };

  return (
    <Dialog fullWidth keepMounted maxWidth="sm" open>
      <DTFechar
        title="Como te sentes hoje?"
        handleClick={() => dispatch(getSuccess({ item: 'disposicao', dados: true }))}
      />
      <DialogContent sx={{ mt: 3 }}>
        <Stack direction="row" justifyContent="center" sx={{ pb: 5 }}>
          <RadioGroup row value={value} name="disposicao" ref={radioGroupRef} onChange={handleChange}>
            {disposicoes.map((option) => (
              <Tooltip key={option.value} title={option.value.toUpperCase()} arrow>
                <FormControlLabel value={option.value} control={<BpRadio icon1={option.icon} cor={option.cor} />} />
              </Tooltip>
            ))}
          </RadioGroup>
        </Stack>
        <Stack direction="row" justifyContent="center">
          <FraseContent frase={frase} />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
