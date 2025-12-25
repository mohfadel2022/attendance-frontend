import { withTamagui } from '@tamagui/next-plugin'
import type { NextConfig } from "next";

const tamaguiPlugin = withTamagui({
  config: './tamagui.config.ts',
  components: ['tamagui'],
  disableExtraction: process.env.NODE_ENV === 'development',
})

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Tamagui requires this for now in some setups to avoid issues with react-native-web
  transpilePackages: ['react-native-web'], 
};

export default tamaguiPlugin(nextConfig);
