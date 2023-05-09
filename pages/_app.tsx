import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import Script from 'next/script'
import theme from 'config/theme'
import 'tailwindcss/tailwind.css'
import '../styles/index.css'
import PageContainer from 'components/_common/page-container'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { baseGoerli, goerli, sepolia, mainnet, polygon } from 'wagmi/chains'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'

const projectId = process.env.NEXT_PUBLIC_W3M_PROJECT_ID

const chains = [baseGoerli, goerli, sepolia, mainnet, polygon]

// Wagmi client
const { provider } = configureChains(chains, [w3mProvider({ projectId })])

const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({
    version: 1,
    chains,
    projectId,
  }),
  provider,
})

const ethereumClient = new EthereumClient(wagmiClient, chains)

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
        src='https://www.googletagmanager.com/gtag/js?id=G-PK78Y6EQDB'
        strategy='afterInteractive'
      />
      <Script id='google-analytics' strategy='afterInteractive'>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-PK78Y6EQDB');
        `}
      </Script>
      <WagmiConfig client={wagmiClient}>
        <ChakraProvider theme={theme}>
          <PageContainer>
            <Component {...pageProps} />
          </PageContainer>
        </ChakraProvider>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  )
}

export default MyApp
