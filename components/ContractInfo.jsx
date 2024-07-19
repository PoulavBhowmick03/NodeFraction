import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const ContractInfo = ({ contract }) => {
  const [info, setInfo] = useState({
    totalLicenses: 0,
    soldFractions: 0,
    fractionPrice: "",
    platformFee: "",
    saleStartTime: "",
    saleEndTime: "",
  });
  const [isSaleActive, setIsSaleActive] = useState(false);

  useEffect(() => {
    const fetchContractInfo = async () => {
      if (!contract) return;

      try {
        const saleActive = await contract.isSaleActive();
        setIsSaleActive(saleActive);
        if (saleActive) {
          const [
            totalLicenses,
            soldFractions,
            fractionPrice,
            platformFee,
            saleStartTime,
            saleEndTime,
          ] = await Promise.all([
            contract.TOTAL_LICENSES(),
            contract.soldFractions(),
            contract.FRACTION_PRICE(),
            contract.PLATFORM_FEE(),
            contract.saleStartTime(),
            contract.saleEndTime(),
          ]);

          setInfo({
            totalLicenses: totalLicenses.toNumber(),
            soldFractions: soldFractions.toNumber(),
            fractionPrice: ethers.utils.formatEther(fractionPrice),
            platformFee: ethers.utils.formatEther(platformFee),
            saleStartTime: new Date(saleStartTime.toNumber() * 1000).toLocaleString(),
            saleEndTime: new Date(saleEndTime.toNumber() * 1000).toLocaleString(),
          });
        }
      } catch (error) {
        console.error("Error fetching contract info:", error);
      }
    };

    fetchContractInfo();
  }, [contract]);

  if (!isSaleActive) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mt-8">
        <h2 className="text-black text-2xl font-bold text-center mb-6">Sale is not active</h2>
        <p className="text-center text-gray-600">Contract information is not available at this time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-8">
      <h2 className="text-black text-2xl font-bold text-center mb-6">Contract Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem label="Total Licenses" value={info.totalLicenses} />
        <InfoItem label="Sold Fractions" value={info.soldFractions} />
        <InfoItem label="Fraction Price" value={`${info.fractionPrice} ETH`} />
        <InfoItem label="Platform Fee" value={`${info.platformFee} ETH`} />
        <InfoItem label="Sale Start" value={info.saleStartTime} />
        <InfoItem label="Sale End" value={info.saleEndTime} />
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="bg-gray-100 rounded-md p-4">
    <h3 className="text-sm font-medium text-gray-500">{label}</h3>
    <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
  </div>
);

export default ContractInfo;