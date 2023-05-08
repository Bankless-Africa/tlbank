import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import Script from 'next/script'
import theme from 'config/theme'
import 'tailwindcss/tailwind.css'
import '../styles/index.css'
import PageContainer from 'components/_common/page-container'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { goerli, sepolia, mainnet, polygon } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'

const chains = [goerli, sepolia, mainnet, polygon]

const { provider } = configureChains(chains, [publicProvider()])

const wagmiClient = createClient({
  autoConnect: true,
  provider,
})

//const ethereumClient = new EthereumClient(wagmiClient, chains);

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
    </>
  )
}

export default MyApp
