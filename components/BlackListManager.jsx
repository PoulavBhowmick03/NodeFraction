import React, { useState } from "react";
import { ethers } from "ethers";
import { FractionalizedNodeLicense } from "@/utils/ethereum";

const BlacklistManager = () => {
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState(true);
  const [message, setMessage] = useState("");

  const handleBlacklist = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        FractionalizedNodeLicense.address,
        FractionalizedNodeLicense.abi,
        signer
      );

      const tx = await contract.updateBlacklist(address, status);
      await tx.wait();

      setMessage(
        `Successfully ${status ? "added" : "removed"} ${address} ${
          status ? "to" : "from"
        } the blacklist`
      );
    } catch (error) {
      console.error("Blacklist error:", error);
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleBlacklist} className="text-black space-y-2 flex flex-col">
      <h2 className="text-2xl font-bold flex justify-center">
        Manage Blacklist
      </h2>
      <div className="flex justify-center">
        <div>
          <label htmlFor="address" className="mb-2">
            Address:
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-auto p-2 border rounded text-black bg-purple-200"
            placeholder="0x..."
          />
        </div>{" "}
      </div>

      <div className="flex justify-center items-center p-1">
        <label className="mb-2 p-2">
          <input
            type="checkbox"
            checked={status}
            onChange={(e) => setStatus(e.target.checked)}
            className="mr-2"
          />
          Add to blacklist
        </label>
        <button
          type="submit"
          className="w-auto bg-purple-500 text-white p-2 rounded"
        >
          Update Blacklist
        </button>{" "}
      </div>
      {message && <p className="text-center">{message}</p>}
    </form>
  );
};

export default BlacklistManager;