'use client';

import { motion } from 'framer-motion';
import { LoaderIcon } from './icons';

interface ToolExecutionProps {
  toolName: string;
  args?: Record<string, any>;
}

const getToolDisplayInfo = (toolName: string, args?: Record<string, any>) => {
  switch (toolName) {
    case 'openSeaSearch':
      return {
        description: `Searching OpenSea${args?.query ? ` for "${args.query}"` : ''}`,
      };
    case 'fetchEntity':
      return {
        description: `Fetching ${args?.entity_type || 'entity'} details`,
      };
    case 'searchCollections':
      return {
        description: `Searching collections${args?.query ? ` for "${args.query}"` : ''}`,
      };
    case 'getCollection':
      return {
        description: 'Getting collection details',
      };
    case 'searchItems':
      return {
        description: 'Searching NFT items',
      };
    case 'getItem':
      return {
        description: 'Getting NFT item details',
      };
    case 'searchTokens':
      return {
        description: 'Searching tokens',
      };
    case 'getToken':
      return {
        description: 'Getting token information',
      };
    case 'getTokenSwapQuote':
      return {
        description: 'Getting swap quote',
      };
    case 'getTokenBalances':
      return {
        description: 'Checking token balances',
      };
    default:
      return {
        description: `Using ${toolName}`,
      };
  }
};

export function ToolExecution({ toolName, args }: ToolExecutionProps) {
  const { description } = getToolDisplayInfo(toolName, args);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="flex items-center gap-3 px-3 py-2 bg-muted/30 rounded-md border text-sm text-muted-foreground"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      >
        <LoaderIcon size={14} />
      </motion.div>
      
      <span>{description}</span>
    </motion.div>
  );
} 