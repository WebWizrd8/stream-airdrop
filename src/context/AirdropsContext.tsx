import { createContext, useContext, useEffect, useState } from "react";
import { type Airdrop, type AirdropResponseItem } from "../type";
import { getAllAirdrops } from "../service/api";

interface AirdropContextType {
    airdrops: Airdrop[];
    isLoading: boolean;
    error: string | null;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    fetchAirdrops: () => Promise<void>;
}

const AirdropContext = createContext<AirdropContextType | undefined>(undefined);

interface AirdropProviderProps {
    children: React.ReactNode;
}

export const AirdropProvider: React.FC<AirdropProviderProps> = ({ children }) => {
    const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const fetchAirdrops = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getAllAirdrops();

            const formattedAirdrops: Airdrop[] = data.items.map((item: AirdropResponseItem) => ({
                name: item.name,
                address: item.address,
                maxNumNodes: parseInt(item.maxNumNodes),
                mint: item.mint,
            }));

            setAirdrops(formattedAirdrops);
        } catch (error) {
            console.error("Error fetching airdrops:", error);
            setError("Failed to fetch airdrops");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchAirdrops();
    }, []);

    return (
        <AirdropContext.Provider value={{ airdrops, isLoading, error, setIsLoading, setError, fetchAirdrops }}>
            {children}
        </AirdropContext.Provider>
    );
}

export const useAirdrops = () => {
    const context = useContext(AirdropContext);
    if (!context) {
        throw new Error("useAirdrops must be used within an AirdropProvider");
    }
    return context;
}