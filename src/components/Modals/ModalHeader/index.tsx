import React from 'react';
import { HStack, ModalHeader as Header, Spacer, useColorModeValue, Flex } from '@chakra-ui/react';

interface ModalHeaderProps {
  title: string;
  left?: React.ReactNode;
  right: React.ReactNode;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ title, left, right }) => {
  const bg = useColorModeValue('blue.50', 'blue.700');

  return (
    <Header bg={bg} w="100%">
      <Flex
        w="100%"
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'flex-start', md: 'center' }}
        gap={{base: 2, md: 0}}
        pt={{base: 4, md: 0}}
        pb={{base: 4, md: 0}}
      >
        <Flex align="center" wrap="wrap" gap={2}>
          {title}
          {left ? (
            <HStack spacing={2} ml={2}>
              {left}
            </HStack>
          ) : null}
        </Flex>

        <Flex wrap="wrap" ml={{base: 0, md: 'auto'}}>
          {right}
        </Flex>
      </Flex>
    </Header>
  );
};

export default ModalHeader;
