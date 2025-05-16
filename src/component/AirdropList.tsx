import { useAirdrops } from "../context/AirdropsContext";
import { useNavigate } from "react-router-dom";
import { PATH } from "../constant";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getClaimData } from "../service/api";
import { type ClaimDataType } from "../type";

export const AirdropList = () => {
    const { airdrops, isLoading, error } = useAirdrops();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const wallet = useWallet();
    const [claimableAirdrops, setClaimableAirdrops] = useState<{[key: string]: ClaimDataType}>({});
    const [isCheckingClaimable, setIsCheckingClaimable] = useState(false);

    const handleNavigateToDetail = (address: string) => {
        navigate(`${PATH.AIRDROP}/${address}`);
    };

    useEffect(() => {
        const checkClaimableAirdrops = async () => {
            if (!wallet.publicKey) {
                setClaimableAirdrops({});
                return;
            }

            setIsCheckingClaimable(true);
            const claimableData: {[key: string]: ClaimDataType} = {};

            try {
                await Promise.all(
                    airdrops.map(async (airdrop) => {
                        try {
                            const publicKey = wallet.publicKey?.toBase58();
                            if (!publicKey) return;
                            
                            const claimData = await getClaimData(airdrop.address, publicKey);
                            if (claimData.amountUnlocked > 0 || claimData.amountLocked > 0) {
                                claimableData[airdrop.address] = claimData;
                            }
                        } catch (error) {
                            console.error(`Error checking claimable status for ${airdrop.address}:`, error);
                        }
                    })
                );
                setClaimableAirdrops(claimableData);
            } catch (error) {
                console.error("Error checking claimable airdrops:", error);
            } finally {
                setIsCheckingClaimable(false);
            }
        };

        checkClaimableAirdrops();
    }, [airdrops, wallet.publicKey]);

    const filteredAirdrops = airdrops.filter((airdrop) => {
        const matchesSearch = airdrop.address.toLowerCase().includes(searchTerm.toLowerCase());
        // Only filter by claimable status if wallet is connected
        const isClaimable = wallet.publicKey ? claimableAirdrops[airdrop.address] !== undefined : true;
        return matchesSearch && isClaimable;
    });

    if (isLoading || isCheckingClaimable) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center p-4">
                {error}
            </div>
        );
    }

    if (filteredAirdrops.length === 0) {
        return (
            <div className="text-gray-500 text-center p-4">
                {searchTerm ? "No matching airdrops found" : "No airdrops available"}
            </div>
        );
    }

    return (
        <div className="space-y-4 space-x-4">
            <div className="max-w-md mx-auto py-4">
                <input
                    type="text"
                    placeholder="Search by airdrop address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAirdrops.map((airdrop) => (
                    <div
                        key={airdrop.address}
                        onClick={() => handleNavigateToDetail(airdrop.address)}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer hover:bg-gray-50"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {airdrop.name}
                        </h3>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                                Address: {airdrop.address}
                            </p>
                            <p className="text-sm text-gray-600">
                                Number of Recipients: {airdrop.maxNumNodes}
                            </p>
                            {wallet.publicKey && claimableAirdrops[airdrop.address] && (
                                <div className="mt-2">
                                    <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                        Claimable
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};