import { useState } from 'react';
import { ethers } from 'ethers';
import { FractionalizedNodeLicense } from '@/utils/ethereum';
export default function PurchaseForm({ onPurchase }) {
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      // Call updateWhitelist function
      const contract = new ethers.Contract(FractionalizedNodeLicense.address, FractionalizedNodeLicense.abi, signer);

      const isWhitelisted = await contract.whitelist(address);
      if (!isWhitelisted) {
        const tx = await contract.updateWhitelist(address, true);
        await tx.wait();
        console.log('Whitelisted user:', address);
        }

      
      console.log('Chain id', network);
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: address, 
          quantity,
          chainId: network.chainId
        }),
      });

      if (!response.ok) throw new Error('Purchase failed');

      const { purchaseId, totalCost, batchId, chainId } = await response.json();
      onPurchase(purchaseId, totalCost, batchId, chainId);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-black">
      <h2 className="text-2xl font-bold mb-4 text-center">Buy 1/10 Fractionalized NFT</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity:
          </label>
          <input
            type="number"
            id="quantity"
            min="1"
            max="10"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Purchase
        </button>
      </form>
    </div>
  );
}