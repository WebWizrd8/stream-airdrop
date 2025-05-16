export interface Airdrop {
    name: string;
    mint: string;
    address: string;
    maxNumNodes: number;
}

export interface AirdropDetailType {
    numNodesClaimed: number;
    cliamedTokenAmount: number;
    totalTokenAmount: number;
    type: string;
}

export interface ClaimDataType {
    amountUnlocked: number;
    amountLocked: number;
    proof: number[][];
}