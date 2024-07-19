import React, { useState } from "react";
import { ethers } from "ethers";
import { FractionalizedNodeLicense } from "@/utils/ethereum";

const SalePeriodForm = () => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSetSalePeriod = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        FractionalizedNodeLicense.address,
        FractionalizedNodeLicense.abi,
        signer
      );

      const startTimestamp = Math.floor(new Date(startTime).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000);

      const tx = await contract.setSalePeriod(startTimestamp, endTimestamp);
      await tx.wait();

      setSuccess("Successfully set sale period");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSetSalePeriod} className="space-y-4">
      <h2 className="text-black text-2xl font-bold text-center mb-4">Set Sale Period</h2>
      <div className="flex flex-col space-y-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
            Start Time:
          </label>
          <input
            type="datetime-local"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
            End Time:
          </label>
          <input
            type="datetime-local"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Set Sale Period
      </button>
      {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      {success && <p className="text-green-500 text-center mt-2">{success}</p>}
    </form>
  );
};

export default SalePeriodForm;