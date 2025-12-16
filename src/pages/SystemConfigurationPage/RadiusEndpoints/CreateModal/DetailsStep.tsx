import * as React from 'react';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { Formik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import NumberField from 'components/FormFields/NumberField';
import SelectField from 'components/FormFields/SelectField';
import StringField from 'components/FormFields/StringField';
import ToggleField from 'components/FormFields/ToggleField';
import { GlobalReachAccount } from 'hooks/Network/GlobalReach';
import { GoogleOrionAccount } from 'hooks/Network/GoogleOrion';
import {
  RADIUS_ENDPOINT_POOL_STRATEGIES,
  RADIUS_ENDPOINT_TYPES,
  useGetRadiusEndpoints,
} from 'hooks/Network/RadiusEndpoints';

const testString = (v: string | undefined) => {
  try {
    if (!v) return false;
    const split = v.split('.');

    if (split.length !== 4) {
      return false;
    }
    if (split[0] !== '0' || split[1] !== '0') {
      return false;
    }

    const num1 = parseInt(split[2] ?? '0', 10);
    const num2 = parseInt(split[3] ?? '0', 10);

    if (!num1 || num1 < 1 || num1 > 2) {
      return false;
    }
    if (!num2 || num2 < 1 || num2 > 254) {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
};

type Props = {
  formRef: React.Ref<FormikProps<Record<string, unknown>>> | undefined;
  finishStep: (v: Record<string, unknown>) => void;
  orionAccounts: GoogleOrionAccount[];
  globalReachAccounts: GlobalReachAccount[];
};

const CreateRadiusEndpointDetailsStep = ({ formRef, finishStep, orionAccounts, globalReachAccounts }: Props) => {
  const { t } = useTranslation();
  const getAccounts = useGetRadiusEndpoints();

  const testIndexIsUnused = React.useCallback(
    (v: string | undefined) => {
      if (!v) return false;
      if (!getAccounts.data) return true;

      return !getAccounts.data.find((a) => a.Index === v);
    },
    [getAccounts.data],
  );

  const FormSchema = React.useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .min(3, 'Must be between 3 and 32 characters')
          .max(32, 'Must be between 3 and 32 characters')
          .required(t('form.required'))
          .default(''),
        description: Yup.string().default(''),
        Type: Yup.string()
          .oneOf(RADIUS_ENDPOINT_TYPES as unknown as string[])
          .required(t('form.required'))
          .default('generic'),
        PoolStrategy: Yup.string()
          .oneOf(RADIUS_ENDPOINT_POOL_STRATEGIES as unknown as string[])
          .required(t('form.required'))
          .default('random'),
        UseGWProxy: Yup.boolean().default(true),
        Index: Yup.string()
          .test('index-value', 'Must be between 0.0.1.1 and 0.0.2.254', testString)
          .test('unique-index', 'Index must be unique and not used by other endpoints', testIndexIsUnused)
          .required(t('form.required'))
          .default('0.0.1.1'),
        NasIdentifier: Yup.string().default(''),
        AccountingInterval: Yup.number().min(0).max(65535).default(60),
      }),
    [t, testIndexIsUnused],
  );

  type FormValues = Yup.InferType<typeof FormSchema>;

  const initialValues: FormValues = FormSchema.cast({});

  const typeOptions = React.useMemo(() => {
    const options = [
      { value: 'generic', label: 'Generic' },
      { value: 'radsec', label: 'RadSec' },
    ];

    if (orionAccounts.length > 0) {
      options.push({ value: 'orion', label: 'Google Orion' });
    }

    if (globalReachAccounts.length > 0) {
      options.push({ value: 'globalreach', label: 'GlobalReach' });
    }

    return options;
  }, [t, orionAccounts, globalReachAccounts]);

  return (
    <Formik
      innerRef={formRef as (instance: FormikProps<FormValues> | null) => void}
      initialValues={initialValues}
      validateOnMount
      validationSchema={FormSchema}
      onSubmit={(values: FormValues) => {
        finishStep(values);
      }}
    >
      <Box>
        <Heading mb={4} size="md" textDecoration="underline">
          {t('common.details')}
        </Heading>
        <Flex mb={2}>
          <StringField name="name" label={t('common.name')} isRequired maxW="400px" />
        </Flex>
        <Box mb={2}>
          <StringField name="description" label={t('common.description')} h="80px" isArea />
        </Box>
        <Heading mb={4} size="md" textDecoration="underline">
          Endpoint
        </Heading>

        <Box w={{ base: '100%', md: 'max-content' }} mb={2}>
          <SelectField name="Type" label="Endpoint Type" w="100%" options={typeOptions} isRequired />
        </Box>

        <Flex my={2} wrap="wrap">
          <Box w={{ base: '100%', md: 'auto' }} mb={{ base: 2, md: 0 }}>
            <StringField name="Index" label="IP Index" isRequired w="100%" />
          </Box>
          <Box mx={{ base: 0, md: 4 }} w={{ base: '100%', md: '160px' }} mb={{ base: 2, md: 0 }}>
            <SelectField
              name="PoolStrategy"
              label="Pool Strategy"
              options={[
                { value: 'random', label: 'Random' },
                { value: 'round_robin', label: 'Round-Robin' },
                { value: 'weighted', label: 'Weighted' },
              ]}
              isRequired
            />
          </Box>
          <Box w={{ base: '100%', md: 'auto' }}>
            <ToggleField name="UseGWProxy" label="Use Gateway Proxy" />
          </Box>
        </Flex>

        <Flex my={2} wrap="wrap">
          <Box w={{ base: '100%', md: '300px' }} mb={{ base: 2, md: 0 }}>
            <StringField name="NasIdentifier" label="NAS Identifier" w="100%" />
          </Box>
          <Box mx={{ base: 0, md: 4 }} w={{ base: '100%', md: '260px' }}>
            <NumberField name="AccountingInterval" label="Accounting Interval" isRequired unit="s" w="100%" />
          </Box>
        </Flex>
      </Box>
    </Formik>
  );
};

export default CreateRadiusEndpointDetailsStep;