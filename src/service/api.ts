import { API_BASE_URL, getAllPayload } from "../constant/api"

export const getAllAirdrops = async () => {
    const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getAllPayload)
    })

    const data = await response.json();
    return data;
}

export const getClaimData = async (address: string, publicKey: string) => {
    const response = await fetch(`${API_BASE_URL}/${address}/claimants/${publicKey}`)
    const data = await response.json();
    return data;
}