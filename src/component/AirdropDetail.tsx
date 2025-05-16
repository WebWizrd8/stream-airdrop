import { useParams, useNavigate } from "react-router-dom";
import { getClaimData } from "../service/api";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState, useMemo } from "react";
import { SolanaDistributorClient } from "@streamflow/distributor/solana";
import { SOLANA_CLUSTER_URL } from "../constant";
import { ICluster } from "@streamflow/stream";
import { type Airdrop, type AirdropDetailType, type ClaimDataType } from "../type";
import { useAirdrops } from "../context/AirdropsContext";
import { Connection, PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { formatTokenAmount, getBNValue } from "../utils";
import BN from "bn.js";
import { ConfirmDialog } from "./ConfirmDialog";

export const AirdropDetail = () => {
    const { address } = useParams();
    const navigate = useNavigate();
    const wallet = useWallet();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isClaiming, setIsClaiming] = useState<boolean>(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
    const [isFetchingClaimData, setIsFetchingClaimData] = useState<boolean>(false);

    const [userClaimableAmount, setUserClaimableAmount] = useState<number>(0);
    const [decimals, setDecimals] = useState<number>(0);

    const { airdrops } = useAirdrops();
    const [airdrop, setAirdrop] = useState<Airdrop | null>(null);
    const [userClaimData, setUserClaimData] = useState<ClaimDataType | null>(null);

    const connection = useMemo(() => new Connection(SOLANA_CLUSTER_URL), []);
    const distributorClient = useMemo(() => new SolanaDistributorClient({
        clusterUrl: SOLANA_CLUSTER_URL,
        cluster: ICluster.Devnet
    }), []);

    const [distributorDetail, setDistributorDetail] = useState<AirdropDetailType | null>(null);

    useEffect(() => {
        if (address && airdrops.length > 0) {
            const foundAirdrop = airdrops.find(item => item.address === address) || null;
            setAirdrop(foundAirdrop);
        }
    }, [airdrops]);

    useEffect(() => {
        const fetchDistributor = async () => {
            if (!address || !airdrop) return;
            setIsLoading(true);
            try {
                const distributor = await distributorClient.getDistributors({ ids: [address] });
                if (distributor && distributor.length > 0) {
                    const mintInfo = await getMint(connection, new PublicKey(airdrop.mint));
                    setDecimals(mintInfo.decimals);
                    setDistributorDetail({
                        numNodesClaimed: getBNValue(distributor[0]?.numNodesClaimed),
                        cliamedTokenAmount: getBNValue(distributor[0]?.totalAmountClaimed),
                        totalTokenAmount: getBNValue(distributor[0]?.maxTotalClaim),
                        type: getBNValue(distributor[0]?.unlockPeriod) > 1 ? 'VESTED' : 'INSTANT',
                    });
                }
            } catch (error) {
                console.error('Error fetching distributor: ', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDistributor();
    }, [address, airdrop]);

    useEffect(() => {
        const getUserClaimableAmount = async () => {
            if (!address || !wallet.publicKey) {
                return;
            }
            
            setIsFetchingClaimData(true);
            try {
                const cliamData = await getClaimData(address, wallet.publicKey?.toBase58() || '');

                setUserClaimData(cliamData);

                if (cliamData.amountUnlocked > 0 || cliamData.amountLocked > 0) {
                    setUserClaimableAmount(cliamData.amountUnlocked > 0 ? cliamData.amountUnlocked : cliamData.amountLocked);
                }
            } catch (error) {
                console.error('Error fetching claim data: ', error);
            } finally {
                setIsFetchingClaimData(false);
            }
        }

        getUserClaimableAmount();
    }, [address, wallet.publicKey]);

    const handleClaim = async () => {
        if (!address || !wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
            return;
        }
        
        setIsClaiming(true);
        try {
            const claimResult = await distributorClient.claim({
                id: address,
                amountLocked: new BN(userClaimData?.amountLocked || 0),
                amountUnlocked: new BN(userClaimData?.amountUnlocked || 0),
                proof: userClaimData?.proof || [],
            }, {
                invoker: {
                    publicKey: wallet.publicKey,
                    signTransaction: wallet.signTransaction,
                    signAllTransactions: wallet.signAllTransactions,
                } as any
            });

            console.log('claimResult', claimResult);
            setShowConfirmDialog(false);
        } catch (error: any) {
            console.error("Error claiming airdrop:", error);
            let errorMessage = "Unknown error";
            
            if (error?.message?.includes("User rejected")) {
              errorMessage = "Transaction was rejected by the user";
            } else if (error?.message?.includes("simulation")) {
              errorMessage = "Transaction failed in simulation. You may need SOL for fees or the airdrop may not be claimable yet.";
            } else if (error?.message) {
              errorMessage = error.message;
            }
            
            alert(`Failed to claim airdrop: ${errorMessage}`);
        } finally {
            setIsClaiming(false);
        }
    }

    const handleBackToHome = () => {
        navigate('/');
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 max-w-4xl flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                    <p className="text-gray-600 text-lg font-medium">Loading airdrop details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <button
                onClick={handleBackToHome}
                className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer"
            >
                <svg 
                    className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                    />
                </svg>
                Back to Homepage
            </button>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                    <h1 className="text-4xl font-bold mb-3">{airdrop?.name || 'Airdrop Detail'}</h1>
                    <div className="flex items-center space-x-3">
                        <span className="px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                            {distributorDetail?.type || 'Unknown Type'}
                        </span>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            <div className="bg-gray-50 rounded-xl p-6 transition-all duration-300 hover:shadow-md border border-gray-100">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Recipients</h3>
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 text-center">
                                        <span className="text-3xl font-bold text-gray-900">
                                            {distributorDetail?.numNodesClaimed || '0'}
                                        </span>
                                        <p className="text-sm text-gray-500 mt-1">Claimed</p>
                                    </div>
                                    <div className="w-8 h-8 flex items-center justify-center">
                                        <div className="w-0.5 h-6 bg-gray-300"></div>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <span className="text-3xl font-bold text-gray-900">
                                            {airdrop?.maxNumNodes || '0'}
                                        </span>
                                        <p className="text-sm text-gray-500 mt-1">Total</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 transition-all duration-300 hover:shadow-md border border-gray-100">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Token Amount</h3>
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 text-center">
                                        <span className="text-3xl font-bold text-gray-900">
                                            {formatTokenAmount(distributorDetail?.cliamedTokenAmount || 0, decimals)}
                                        </span>
                                        <p className="text-sm text-gray-500 mt-1">Claimed</p>
                                    </div>
                                    <div className="w-8 h-8 flex items-center justify-center">
                                        <div className="w-0.5 h-6 bg-gray-300"></div>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <span className="text-3xl font-bold text-gray-900">
                                            {formatTokenAmount(distributorDetail?.totalTokenAmount || 0, decimals)}
                                        </span>
                                        <p className="text-sm text-gray-500 mt-1">Total</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-gray-50 rounded-xl p-6 transition-all duration-300 hover:shadow-md border border-gray-100">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Your Claimable Amount</h3>
                                <div className="text-3xl font-bold text-gray-900">
                                    {isFetchingClaimData ? (
                                        <div className="flex items-center justify-center space-x-3">
                                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                                            <span className="text-gray-500">Loading...</span>
                                        </div>
                                    ) : (
                                        formatTokenAmount(userClaimableAmount, decimals)
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => setShowConfirmDialog(true)}
                                disabled={userClaimableAmount === 0 || isClaiming || isFetchingClaimData}
                                className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-300 ${
                                    userClaimableAmount === 0 || isClaiming || isFetchingClaimData
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-[1.02] hover:shadow-lg cursor-pointer'
                                }`}
                            >
                                {isClaiming ? (
                                    <div className="flex items-center justify-center space-x-3">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>Claiming...</span>
                                    </div>
                                ) : (
                                    'Claim Tokens'
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Airdrop Address</h3>
                        <p className="text-gray-900 font-mono break-all bg-gray-50 p-4 rounded-lg border border-gray-100">
                            {address}
                        </p>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handleClaim}
                title="Confirm Claim"
                message={`Are you sure you want to claim ${formatTokenAmount(userClaimableAmount, decimals)} tokens?`}
                isLoading={isClaiming}
            />
        </div>
    );
}