import React, { useState, useEffect, useContext } from 'react'
import Logo from '../tlUtils/tlBankLogo'
import Image from 'next/image'
import { getCurrentDate, formatWalletAddress } from '../tlUtils/tlUtil'
import { getUnlockDate } from '../tlUtils/tlUtil'
import { getUnlockDateRaw } from '../tlUtils/tlUtil'
import { IoWalletOutline } from 'react-icons/io5'
import { IoMdRadioButtonOff, IoMdRadioButtonOn } from 'react-icons/io'
import { FaEthereum } from 'react-icons/fa'
import { BiInfoCircle } from 'react-icons/bi'
import {
  VStack,
  Stack,
  Container,
  Flex,
  Text,
  Box,
  Icon,
  HStack,
  Button,
  Spacer,
  Heading,
  Divider,
  Input,
  SimpleGrid,
  FormControl,
  FormLabel,
  FormHelperText,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Hide,
} from '@chakra-ui/react'
import { useContractRead, useContractWrite } from 'wagmi'
import { BigNumber } from 'ethers'
import ConnectCustom from '../components/connectCustom/ConnectCustom'
import { useAccount } from 'wagmi'

function TlBank() {
  const [value, setValue] = useState(40000)
  const [active, setActive] = useState('40k')
  const [duration, setDuration] = useState('')
  const [lockDate, setLockDate] = useState('')
  const [unlockDate, setUnlockDate] = useState<any | null>(null)
  const [unlockDateRaw, setUnlockDateRaw] = useState<any | null>(null)
  const [endDate, setEndDate] = useState('')
  const [totalHolders, setTotalHolders] = useState('')
  const [totalLock, setTotalLock] = useState('')
  const [walletBalance, setWalletBalance] = useState('')

  const bankToken: `0x${string}` = '0xA07f49794E93f203bBE7Ad0F200B052275c8AeEF'
  const TLBankToken: `0x${string}` =
    '0x93b99F15561Df5a3FD95b6623D5142e200271bC2'

  const { address } = useAccount()

  const handleButton = (bankVal, btn, duration) => {
    setValue(bankVal)
    setActive(btn)
    setDuration(duration)
    const startDate = new Date()
    const endDate = getUnlockDate('-', startDate, duration)
    const endDateRaw = getUnlockDateRaw(startDate, duration)
    setUnlockDateRaw(endDateRaw)
    setUnlockDate(endDate)
    handleLock()
  }

  useEffect(() => {
    const date = getCurrentDate()
    const endDateRaw = getUnlockDateRaw(date, 6)
    setLockDate(date)
  }, [])

  // connected wallet balance
  const contractReadBalance = useContractRead({
    address: bankToken,
    abi: [
      {
        name: 'balanceOf',
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'balanceOf',
    watch: true,
    args: [address!],
    chainId: 84531,
  })
  console.log(contractReadBalance.data)

  // locked balance
  const contractReadLockBalance = useContractRead({
    address: TLBankToken,
    abi: [
      {
        name: 'lockedBalances',
        inputs: [{ internalType: 'address', name: 'holder', type: 'address' }],
        outputs: [
          { internalType: 'int256', name: 'lockedBalance', type: 'int256' },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'lockedBalances',
    watch: true,
    args: [address!],
    chainId: 84531,
  })
  console.log(contractReadLockBalance.data)

  // approved amount query
  const contractReadAllowance = useContractRead({
    address: bankToken,
    abi: [
      {
        name: 'allowance',
        inputs: [
          { internalType: 'address', name: 'owner', type: 'address' },
          { internalType: 'address', name: 'spender', type: 'address' },
        ],
        outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'allowance',
    watch: true,
    args: [address!, TLBankToken],
    chainId: 84531,
  })
  console.log(contractReadAllowance.data)

  const contractWriteAllowance = useContractWrite({
    mode: 'recklesslyUnprepared',
    address: bankToken,
    abi: [
      {
        name: 'approve',
        inputs: [
          { internalType: 'address', name: 'spender', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    functionName: 'approve',
    args: [TLBankToken, BigNumber.from(value)],
    chainId: 84531,
  })

  const contractWriteLock = useContractWrite({
    mode: 'recklesslyUnprepared',
    address: TLBankToken,
    abi: [
      {
        name: 'createNFT',
        inputs: [
          { internalType: 'address', name: 'recipient', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint256', name: 'unlockDate', type: 'uint256' },
        ],
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    functionName: 'createNFT',
    args: [address!, BigNumber.from(1), BigNumber.from(1)],
    chainId: 84531,
  })

  const handleLock = async () => {
    if (contractReadAllowance.data) {
      try {
        await contractWriteAllowance.writeAsync?.()
        if (contractWriteAllowance.isSuccess) {
          await contractWriteLock.writeAsync?.()
        }
      } catch (err) {
        console.log(err)
      }
    } else {
      try {
        await contractWriteLock.writeAsync?.()
      } catch (err) {
        console.log(err)
      }
    }
  }

  return (
    <Container maxW={'6xl'} mx='auto' p={0}>
      <Flex as='nav' py={'10px'}>
        {/* <Logo /> */}
        <Spacer />
        <HStack>
          <Button
            border='1px'
            borderColor='red.500'
            color={'white'}
            bgColor={'black'}
          >
            <Icon as={FaEthereum} />
          </Button>
          {/* {!account ? ( */}
          {/* 
          <Button
            border='1px'
            borderColor='red.500'
            color={'white'}
            bgColor={'black'}
          >
            {/* {account === '' ? 'Connect a wallet' : account} */}
          {/* Connect a Wallet*/}
          {/*   </Button>*/}
          <ConnectCustom />
          {/* ) : (
            <Button
              border='1px'
              borderColor='red.200'
              color={'white'}
              onClick={disconnect}
              bgColor={'black'}>connected
              {formatWalletAddress(account)}
            </Button>
           )} */}
        </HStack>
      </Flex>
      <Divider mb={10} />

      <Box as='section' display={'flex'} justifyContent={'space-between'}>
        <div>
          <Text fontSize={{ base: '8px', md: '12px' }}>
            Available on <Icon as={FaEthereum} /> Etherum Mainnet
          </Text>
          <HStack>
            <Image
              src='/images/bank-token-mobile.png'
              alt='bankToken'
              height={'50px'}
              width={'70px'}
            />
            <Text as='b' fontSize={{ base: '16px', md: '36px' }}>
              LOCK BANK
            </Text>
          </HStack>
        </div>
        <HStack>
          <VStack>
            <Heading
              fontSize={{ base: '10px', md: '14px' }}
              color='rgba(255, 255, 255, 0.7)'
            >
              Total BANKs Locked
            </Heading>
            <Heading
              color='white'
              as='b'
              fontSize={{ base: '16px', md: '22px' }}
            >
              {/* {totalLock}K BANK */}
              300K BANK
            </Heading>
          </VStack>
          <Divider orientation='vertical' />
          <VStack>
            <Heading
              fontSize={{ base: '10px', md: '14px' }}
              color='rgba(255, 255, 255, 0.7)'
            >
              Total BANKs Holders
            </Heading>
            <Heading
              color='white'
              as='b'
              fontSize={{ base: '16px', md: '22px' }}
            >
              {/* 300 Holders */}
              {totalHolders ? `${totalHolders} ` : '0 '}Holders
            </Heading>
          </VStack>
        </HStack>
      </Box>

      {/* <SimpleGrid templateColumns={'repeat(2, 1fr)'} gap={10} mt={10}> */}
      <SimpleGrid
        bg='rgba(1, 1, 1, 100.0)'
        columns={{ base: 1, lg: 2 }}
        gap={10}
        mt={10}
      >
        <Box
          maxW={'100%'}
          bgColor={'#111111'}
          p={5}
          border={'1px'}
          borderRadius={'5px'}
          borderColor={'gray.700'}
        >
          <Flex>
            <HStack>
              <IoWalletOutline
                fontSize={'24px'}
                color='rgba(255, 255, 255, 0.7)'
              />

              <Text fontSize={'14px'} color='rgba(255, 255, 255, 0.7)'>
                Wallet Balance
              </Text>
            </HStack>
            <Spacer />
            <Text fontSize={'14px'} fontWeight='600'>
              {walletBalance ? `${walletBalance} ` : '0.0 '}BANK
            </Text>
          </Flex>
          <Divider m={2} />

          <FormControl my='5'>
            <FormLabel fontSize={'14px'} color='rgba(255, 255, 255, 0.7)'>
              You lock
            </FormLabel>
            <Input
              color='white'
              value={value}
              readOnly
              borderRadius={0}
              bgColor={'#232323'}
              type='email'
              placeholder='Enter Amount'
            />
            <FormHelperText color='white' fontSize={'14px'}>
              Minimum: <span>40,000 BANK</span>
            </FormHelperText>
          </FormControl>

          <Box>
            <FormControl as='fieldset' gap={2}>
              <FormLabel
                as='legend'
                color='rgba(255, 255, 255, 0.7)'
                fontSize={'14px'}
                my='2'
              >
                Vesting term <Icon as={BiInfoCircle} />
              </FormLabel>
              <Stack
                spacing='24px'
                direction={{ base: 'column', md: 'column', xl: 'row' }}
              >
                <Button
                  onClick={() => handleButton(40000, '40k', 6)}
                  colorScheme='gray'
                  variant='outline'
                  color='white'
                  value='40k'
                  // fontSize={{ base: '8px', md: '14px' }}
                  fontSize={'14px'}
                  fontWeight={700}
                  w='full'
                  _hover={{ bg: 'none', svg: { fill: 'white' } }}
                >
                  {active === '40k' ? (
                    <IoMdRadioButtonOn />
                  ) : (
                    <IoMdRadioButtonOff />
                  )}{' '}
                  6 Months @ 40K BANK
                </Button>
                <Button
                  onClick={() => handleButton(80000, '80k', 12)}
                  colorScheme='gray'
                  variant='outline'
                  color='white'
                  value='80k'
                  // fontSize={{ base: '8px', md: '12px' }}
                  fontSize={'14px'}
                  fontWeight={700}
                  w='full'
                  _hover={{ bg: 'none', svg: { fill: 'white' } }}
                >
                  {active === '80k' ? (
                    <IoMdRadioButtonOn />
                  ) : (
                    <IoMdRadioButtonOff />
                  )}{' '}
                  1 Year @ 80K BANK
                </Button>
              </Stack>
            </FormControl>
          </Box>
          {/* <Divider my={10} /> */}

          <Accordion allowToggle defaultIndex={0} py={10}>
            <AccordionItem>
              <h2>
                <AccordionButton border={'none'} outline='none'>
                  <Box
                    fontSize={'14px'}
                    as='span'
                    flex='1'
                    textAlign='left'
                    color='rgba(255, 255, 255, 0.7)'
                  >
                    Summary
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} bg={'#232323'}>
                <Flex>
                  <Text fontSize={'14px'} color='rgba(255, 255, 255, 0.7)'>
                    Lock Date
                  </Text>
                  <Spacer />
                  {/* <Text fontSize={'14px'} >2023-04-01 09:49</Text> */}
                  <Text fontSize={'14px'}>{lockDate}</Text>
                </Flex>
                <Flex>
                  <Text fontSize={'14px'} color='rgba(255, 255, 255, 0.7)'>
                    Unlock Date
                  </Text>
                  <Spacer />
                  {/* <Text fontSize={'14px'} >2023-04-01 09:49</Text> */}
                  <Text fontSize={'14px'}>{unlockDate}</Text>
                </Flex>
              </AccordionPanel>
            </AccordionItem>
            <Divider />
          </Accordion>
          <Button
            borderRadius={0}
            // onClick={() => onConfirm()}
            bg='red.500'
            _hover={{ bg: 'red.500' }}
            w={'100%'}
          >
            Confirm
          </Button>
        </Box>
        <Hide below='lg'>
          <Box
            display='flex'
            justifyContent='center'
            bg='rgba(1, 1, 1, 100.0)'
            alignItems='center'
          >
            <Box
              display='flex'
              justifyContent='center'
              alignItems='center'
              pl={70}
              bg='radial-gradient(at center, rgba(255, 27, 1, 0.3),rgba(255, 27, 1, 0.2), rgba(1, 1, 1, 100.0), rgba(1, 1, 1, 100.0));'
            >
              <Image
                src='/images/bank-token.png'
                alt='bankToken'
                height={422}
                width={402}
              />
            </Box>
          </Box>
        </Hide>
      </SimpleGrid>
    </Container>
  )
}

export default TlBank
