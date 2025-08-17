import { motion } from 'framer-motion';
import { Logo } from './logo';

export const Greeting = () => {
  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col items-center justify-center text-center gap-3"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-3"
      >
        <Logo size={40} />
        <span className="text-3xl font-bold">smartinvest</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.55 }}
        className="text-base md:text-lg text-zinc-500"
      >
        Invest smarter with AI-powered insights on your wallet and industry.
      </motion.div>
    </div>
  );
};
