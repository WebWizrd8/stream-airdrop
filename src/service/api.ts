import { API_BASE_URL, getAllPayload } from "../constant/api"
import { type AirdropResponse, type ClaimDataType } from "../type";

export const getAllAirdrops = async (): Promise<AirdropResponse> => {
    const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getAllPayload)
    })

    const data = await response.json();
    return data;
}

export const getClaimData = async (address: string, publicKey: string): Promise<ClaimDataType> => {
    const response = await fetch(`${API_BASE_URL}/${address}/claimants/${publicKey}`)
    const data = await response.json();
    return data;
}

export const getClaimableAirdrops = async ( address: string) => {
    const response = await fetch(`${API_BASE_URL}/claimable/${address}/?limit=100&skimZeroValued=false`)
    const data = await response.json();
    return data;
}