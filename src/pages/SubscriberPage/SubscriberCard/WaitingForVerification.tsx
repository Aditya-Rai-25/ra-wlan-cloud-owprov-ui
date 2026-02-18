import React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import WarningButton from 'components/Buttons/WarningButton';
import { useSendSubscriberEmailValidation } from 'hooks/Network/Subscribers';
import { Subscriber } from 'models/Subscriber';
import { axiosProv } from 'utils/axiosInstances';

interface Props {
  subscriber?: Subscriber;
  isWaitingForEmailVerification?: boolean;
  isDisabled?: boolean;
  refresh: () => void;
}

const defaultProps = {
  subscriber: undefined,
  isWaitingForEmailVerification: false,
  isDisabled: false,
};

const WaitingForVerificationNotification = (
  {
    subscriber,
    isWaitingForEmailVerification,
    isDisabled,
    refresh
  }: Props
) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const onSuccess = () => {
    refresh();
    onClose();
  };
  const { mutateAsync: sendValidation, isLoading } = useSendSubscriberEmailValidation({ refresh: onSuccess });
  const { data: registrationId } = useQuery(
    ['subscriber-registration-id', subscriber?.owner],
    () =>
      axiosProv
        .get(`operator/${subscriber?.owner ?? ''}`)
        .then(({ data }: { data: { registrationId: string } }) => data.registrationId),
    {
      enabled: !!isWaitingForEmailVerification && !!subscriber?.owner,
      staleTime: 30000,
    },
  );
  const canSendValidation = !!subscriber?.email && !!registrationId;

  const handleValidationClick = () =>
    sendValidation({
      email: subscriber?.email ?? '',
      registrationId: registrationId ?? '',
    });

  if (!isWaitingForEmailVerification) return null;

  return (
    <>
      <WarningButton
        label={t('users.waitiing_for_email_verification')}
        ml={2}
        isDisabled={isDisabled}
        onClick={onOpen}
      />
      <AlertDialog isOpen={isOpen} onClose={onClose} isCentered leastDestructiveRef={undefined}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>{t('users.send_validation')}</AlertDialogHeader>
            <AlertDialogBody>{t('users.send_validation_explanation')}</AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onClose} mr={4}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleValidationClick}
                isLoading={isLoading}
                colorScheme="red"
                isDisabled={!canSendValidation}
              >
                {t('common.confirm')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

WaitingForVerificationNotification.defaultProps = defaultProps;
export default React.memo(WaitingForVerificationNotification);
