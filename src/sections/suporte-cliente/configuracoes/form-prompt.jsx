// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { updateDados, resetDados } from '../../../redux/slices/stepper';
import { createInSuporte, updateInSuporte } from '../../../redux/slices/suporte-cliente';
// components
import Steps from '../../../components/Steps';
import { FormLoading } from '../../../components/skeleton';
import { ButtonsStepper } from '../../../components/Actions';
import { DialogTitleAlt } from '../../../components/CustomDialog';
import { FormProvider, RHFTextField } from '../../../components/hook-form';
import { SearchNotFoundSmall } from '../../../components/table/SearchNotFound';
//
import { usePromptStep, schemaContexto, schemaInstrucoes, schemaResposta } from './utils';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormPrompt({ onClose }) {
  const dispatch = useDispatch();
  const { dadosStepper, activeStep } = useSelector((s) => s.stepper);
  const { selectedItem, isLoading, isEdit } = useSelector((s) => s.suporte);

  const handleClose = () => {
    dispatch(resetDados());
    onClose();
  };

  const goBack = (values) => dispatch(updateDados({ backward: true, dados: values }));
  const mergeDados = (values) => dispatch(updateDados({ forward: true, dados: values }));

  const save = (values) => {
    const formData = JSON.stringify({ ...dadosStepper, ...values });
    const params = { msg: `Prompt ${isEdit ? 'atualizado' : 'adicionado'}`, id: selectedItem?.id };
    dispatch((isEdit ? updateInSuporte : createInSuporte)('prompts', formData, { ...params, onClose: handleClose }));
  };

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitleAlt
        onClose={handleClose}
        title="Prompt para varredura de email"
        content={<Steps activeStep={activeStep} steps={['Contexto', 'Instruções', 'Resposta']} sx={{ mt: 3, mb: 0 }} />}
      />

      <DialogContent>
        {isEdit && isLoading ? (
          <FormLoading rows={2} />
        ) : (
          <>
            {isEdit && !selectedItem ? (
              <SearchNotFoundSmall message="Item não disponível..." />
            ) : (
              <>
                {activeStep === 0 && (
                  <Contexto
                    dados={{
                      keywords: dadosStepper?.keywords || selectedItem?.keywords || '',
                      preset_name: dadosStepper?.preset_name || selectedItem?.preset_name || '',
                      prompt_context: dadosStepper?.prompt_context || selectedItem?.prompt_context || '',
                    }}
                    onForward={mergeDados}
                    onClose={handleClose}
                  />
                )}

                {activeStep === 1 && (
                  <Instrucoes
                    dados={{
                      prompt_instructions: dadosStepper?.prompt_instructions || selectedItem?.prompt_instructions || '',
                      negative_prompt_instructions:
                        dadosStepper?.negative_prompt_instructions || selectedItem?.negative_prompt_instructions || '',
                    }}
                    onForward={mergeDados}
                    onBack={goBack}
                  />
                )}

                {activeStep === 2 && (
                  <Resposta
                    isEdit={isEdit}
                    dados={{
                      prompt_response_example:
                        dadosStepper?.prompt_response_example || selectedItem?.prompt_response_example || '',
                      negative_prompt_response_example:
                        dadosStepper?.negative_prompt_response_example ||
                        selectedItem?.negative_prompt_response_example ||
                        '',
                    }}
                    onSave={save}
                    onBack={goBack}
                  />
                )}
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Contexto({ dados, onForward, onClose }) {
  const { methods, handle } = usePromptStep(schemaContexto, dados, onForward);

  return (
    <FormProvider methods={methods} onSubmit={handle}>
      <Stack spacing={3} sx={{ pt: 1 }}>
        <RHFTextField name="preset_name" label="Nome" />
        <RHFTextField name="keywords" label="Palavras-chave" multiline rows={2} />
        <RHFTextField name="prompt_context" label="Contexto" multiline rows={7} />
      </Stack>

      <ButtonsStepper onClose={onClose} labelCancel="Cancelar" />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Instrucoes({ dados, onForward, onBack }) {
  const { methods, handle } = usePromptStep(schemaInstrucoes, dados, onForward);

  return (
    <FormProvider methods={methods} onSubmit={handle}>
      <Stack spacing={3} sx={{ pt: 1 }}>
        <RHFTextField name="prompt_instructions" label="Instruções" multiline rows={8} />
        <RHFTextField name="negative_prompt_instructions" label="Instruções negativas" multiline rows={4} />
      </Stack>

      <ButtonsStepper onClose={onBack} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Resposta({ dados, onBack, onSave, isEdit }) {
  const { methods, handle } = usePromptStep(schemaResposta, dados, onSave);

  return (
    <FormProvider methods={methods} onSubmit={handle}>
      <Stack spacing={3} sx={{ pt: 1 }}>
        <RHFTextField name="prompt_response_example" label="Exemplo de resposta" multiline rows={8} />
        <RHFTextField name="negative_prompt_response_example" label="Exemplo negativo" multiline rows={4} />
      </Stack>

      <ButtonsStepper onClose={onBack} label={isEdit ? 'Guardar' : 'Adicionar'} />
    </FormProvider>
  );
}
