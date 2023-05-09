import { useWeb3Modal } from '@web3modal/react'
import { useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { Button } from '@chakra-ui/react'

export default function ConnectCustom() {
  const [loading, setLoading] = useState(false)
  const { open } = useWeb3Modal()
  const { isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const label = isConnected ? 'Disconnect' : 'Connect a Wallet'

  async function onOpen() {
    setLoading(true)
    await open()
    setLoading(false)
  }

  function onClick() {
    if (isConnected) {
      disconnect()
    } else {
      onOpen()
    }
  }

  return (
    <Button
      onClick={onClick}
      disabled={loading}
      border='1px'
      borderColor='red.500'
      color={'white'}
      bgColor={'black'}
    >
      {loading ? 'Loading...' : label}
    </Button>
  )
}
