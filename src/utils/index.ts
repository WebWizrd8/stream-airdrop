import BN from 'bn.js';

export const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const formatTokenAmount = (amount: number, decimals: number) => {
    return (amount / 10 ** decimals);
};

export const getBNValue = (bnValue: BN | null | undefined): number => {
    if (!bnValue) {
        return 0;
    }

    try {
      return parseInt(bnValue.toString());
    } catch (e) {
      console.error("Error parsing BN value:", e);
      return 0;
    }
};