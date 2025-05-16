import { useAirdrops } from "../context/AirdropsContext";
import { useNavigate } from "react-router-dom";
import { PATH } from "../constant";

export const AirdropList = () => {
    const { airdrops, isLoading, error } = useAirdrops();
    const navigate = useNavigate();

    const handleNavigateToDetail = (address: string) => {
        navigate(`${PATH.AIRDROP}/${address}`);
    };

    if (isLoading) {
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

    if (airdrops.length === 0) {
        return (
            <div className="text-gray-500 text-center p-4">
                No airdrops available
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {airdrops.map((airdrop) => (
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
                    </div>
                </div>
            ))}
        </div>
    );
};