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

export interface AirdropResponse {
    items: AirdropResponseItem[];
    total: number;
    limit: number;
    offset: number;
}

export interface AirdropResponseItem {
    name: string;
    mint: string;
    address: string;
    maxNumNodes: string;
    isOnChain: boolean;
    isActive: boolean;
    id: string;
    createdAt: string;
    updatedAt: string;
}