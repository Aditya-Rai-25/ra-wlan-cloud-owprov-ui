import React, { useEffect, useState } from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import DeviceRulesField from 'components/CustomFields/DeviceRulesField';
import IpDetectionModalField from 'components/CustomFields/IpDetectionModalField';
import SelectWithSearchField from 'components/FormFields/SelectWithSearchField';
import StringField from 'components/FormFields/StringField';
import { CreateOperatorSchema } from 'constants/formSchemas';
import { useGetEntities } from 'hooks/Network/Entity';
import { useCreateOperator } from 'hooks/Network/Operators';
import useMutationResult from 'hooks/useMutationResult';

const propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
  formRef: PropTypes.instanceOf(Object).isRequired,
};

const CreateOperatorForm = ({ isOpen, onClose, refresh, formRef }) => {
  const { t } = useTranslation();
  const [formKey, setFormKey] = useState(uuid());
  const { onSuccess, onError } = useMutationResult({
    objName: t('operator.one'),
    operationType: 'create',
    refresh,
    onClose,
  });
  const { data: entities } = useGetEntities();
  const create = useCreateOperator();
  const entityOptions = entities?.map((ent) => ({ value: ent.id, label: `${ent.name}${ent.description ? `: ${ent.description}` : ''}` })) ?? [];

  const createParameters = ({ name, description, note, sourceIP, deviceRules, firmwareRCOnly, registrationId, entityId }) => ({
    name,
    deviceRules,
    sourceIP,
    registrationId,
    entityId,
    description,
    firmwareRCOnly,
    notes: note.length > 0 ? [{ note }] : undefined,
  });

  useEffect(() => {
    setFormKey(uuid());
  }, [isOpen]);

  return (
    <Formik
      innerRef={formRef}
      key={formKey}
      initialValues={{
        name: '',
        description: '',
        deviceRules: {
          rrm: 'inherit',
          rcOnly: 'inherit',
          firmwareUpgrade: 'inherit',
        },
        registrationId: '',
        entityId: '',
        firmwareRCOnly: false,
        sourceIP: [],
        note: '',
      }}
      validationSchema={CreateOperatorSchema(t)}
      onSubmit={(formData, { setSubmitting, resetForm }) =>
        create.mutateAsync(createParameters(formData), {
          onSuccess: () => {
            onSuccess({ setSubmitting, resetForm });
          },
          onError: (e) => {
            onError(e, { resetForm });
          },
        })
      }
    >
      <Form>
        <SimpleGrid minChildWidth="300px" spacing="20px" mb={6}>
          <StringField name="name" label={t('common.name')} isRequired />
          <StringField name="description" label={t('common.description')} />
          <StringField name="registrationId" label={t('operator.registration_id')} isRequired />
          <SelectWithSearchField name="entityId" label={t('operator.associate_entity')} options={entityOptions} isRequired isPortal />
          <DeviceRulesField />
          <IpDetectionModalField name="sourceIP" />
          <StringField name="note" label={t('common.note')} />
        </SimpleGrid>
      </Form>
    </Formik>
  );
};

CreateOperatorForm.propTypes = propTypes;

export default CreateOperatorForm;
