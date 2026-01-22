import React from 'react';
import { Button } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const propTypes = {
  subscriberName: PropTypes.string,
  subscriberId: PropTypes.string,
};
const defaultProps = {
  subscriberName: '',
  subscriberId: '',
};

const SubscriberCell = ({ subscriberName, subscriberId }) => {
  const navigate = useNavigate();

  const goTo = () => navigate(`/subscriber/${subscriberId}`);

  if (subscriberName !== '' && subscriberId !== '') {
    return (
      <Button size="sm" variant="link" onClick={goTo}>
        {subscriberName}
      </Button>
    );
  }

  return null;
};

SubscriberCell.propTypes = propTypes;
SubscriberCell.defaultProps = defaultProps;
export default React.memo(SubscriberCell);
