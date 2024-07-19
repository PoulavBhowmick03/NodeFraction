import { useState } from 'react';
import { ethers } from 'ethers';
import { FractionalizedNodeLicense } from '@/utils/ethereum';
import { useRouter } from 'next/navigation';

export default function MintButton({ purchaseId, totalCost, batchId, chainId }) {
  const [isMinting, setIsMinting] = useState(false);
  const router = useRouter();

  const handleMint = async () => {
    setIsMinting(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      
      const contract = new ethers.Contract(FractionalizedNodeLicense.address, FractionalizedNodeLicense.abi, signer);
      
      const isSaleActive = await contract.isSaleActive();
      if (!isSaleActive) {
        throw new Error('Sale is not active');
      }
      // Check if the user is whitelisted
      const address = await signer.getAddress();
      const isWhitelisted = await contract.whitelist(address);
      if (!isWhitelisted) {
        throw new Error('User is not whitelisted');
      }
      console.log('Contract address:', FractionalizedNodeLicense.address);
      console.log('Signer address:', await signer.getAddress());
      console.log('Purchase ID:', purchaseId);
      console.log('Total cost:', totalCost);

      const purchaseIdBytes32 = ethers.utils.formatBytes32String(purchaseId);
      const quantity = 1; 
      const chain = "ethereum"; 
      const chainId = 1; 

      const parsedTotalCost = ethers.utils.parseEther(totalCost.toString());

      const estimatedGas = await contract.estimateGas.mint(
        quantity,
        purchaseIdBytes32,
        chain,
        chainId,
        { value: parsedTotalCost }
      );

      console.log('Estimated gas:', estimatedGas.toString());

      const gasLimit = estimatedGas.mul(120).div(100);

      const tx = await contract.mint(
        quantity, 
        purchaseIdBytes32,
        chain,
        chainId,
        { 
          value: ethers.utils.parseEther(totalCost.toString()),
          gasLimit: gasLimit 
        }
      );

      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.transactionHash);

      const response = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          purchaseId, 
          transactionHash: receipt.transactionHash,
          contractAddress: FractionalizedNodeLicense.address,
          tokenId: receipt.events[0].args.tokenId.toNumber() 
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API response error:', response.status, response.statusText, errorData);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log('API response:', data);
  
      alert('Minting completed and recorded successfully!');
      router.refresh();
    } catch (error) {
      console.error('Minting error:', error);
      alert(`Minting failed: ${error.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <button
      onClick={handleMint}
      disabled={isMinting}
      className="w-full px-4 py-2 text-white bg-purple-500 rounded hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400"
    >
      {isMinting ? 'Minting...' : 'Mint NFTs'}
    </button>
  );
}