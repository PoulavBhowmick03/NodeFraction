"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import PurchaseForm from "../components/PurchaseForm";
import MintButton from "../components/MintButton";
import SalePeriodForm from "@/components/SalePeriodForm";
import { FractionalizedNodeLicense } from "@/utils/ethereum";
import BlacklistManager from "@/components/BlackListManager";
import ContractInfo from "@/components/ContractInfo";
import useWallet from "@/hooks/useWallet";
import useContract from "@/hooks/useContract";
import ConnectWallet from "@/components/ConnectWallet";

export default function Home() {
  const [purchaseInfo, setPurchaseInfo] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isSaleActive, setIsSaleActive] = useState(false);
  const { account, provider, connect, disconnect, switchWallet } = useWallet();
  const contract = useContract();

  useEffect(() => {
    checkOwnerAndSaleStatus();
  }, []);

  const checkOwnerAndSaleStatus = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        FractionalizedNodeLicense.address,
        FractionalizedNodeLicense.abi,
        signer
      );

      const signerAddress = await signer.getAddress();
      const contractOwner = await contract.owner();
      setIsOwner(signerAddress.toLowerCase() === contractOwner.toLowerCase());

      const saleStatus = await contract.isSaleActive();
      setIsSaleActive(saleStatus);
    } catch (error) {
      console.error("Error checking owner and sale status:", error);
    }
  };

  const handlePurchase = (purchaseId, totalCost, batchId) => {
    console.log("Purchase info:", { purchaseId, totalCost, batchId });
    setPurchaseInfo({ purchaseId, totalCost, batchId });
  };

  return (
    <div className=" min-h-screen bg-gray-300 flex flex-col justify-center sm:py-8">
      <div className="relative sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-purple-50 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white h-4/5 shadow-lg sm:rounded-3xl sm:p-20">
          <ConnectWallet
            account={account}
            connect={connect}
            disconnect={disconnect}
            switchWallet={switchWallet}
          />

          {isOwner && (
            <div className="space-y-6 mt-6">
              <SalePeriodForm />
              <BlacklistManager />
              <ContractInfo contract={contract} />
            </div>
          )}

          {isSaleActive && !isOwner ? (
            !purchaseInfo ? (
              <PurchaseForm onPurchase={handlePurchase} />
            ) : (
              <div className="space-y-4 mt-6">
                <p className="text-gray-700">
                  Purchase ID: {purchaseInfo.purchaseId}
                </p>
                <p className="text-gray-700">
                  Total Cost: {purchaseInfo.totalCost} ETH
                </p>
                <p className="text-gray-700">
                  Batch ID: {purchaseInfo.batchId || "Not available"}
                </p>
                <MintButton
                  purchaseId={purchaseInfo.purchaseId}
                  totalCost={purchaseInfo.totalCost}
                  batchId={purchaseInfo.batchId}
                />
              </div>
            )
          ) : (
            <p className="text-center text-xl text-gray-700 mt-6">
              {isOwner ? "" : isSaleActive ? "" : "Sale period not active"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
