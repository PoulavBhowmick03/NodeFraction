"use client"
import { useState } from 'react';

export default function RefundLastBatch() {
  const [message, setMessage] = useState('');

  const handleRefund = async () => {
    try {
      const response = await fetch('/api/refundLastBatch', {
        method: 'POST',
      });
      const data = await response.json();
      setMessage(data.message);
      console.log('Refund data:', data);
    } catch (error) {
      console.error('Failed to refund batch:', error);
      setMessage('Error refunding batch');
    }
  };

  return (
    <div>
      <button onClick={handleRefund} className="bg-red-500 text-white px-4 py-2 rounded">
        Refund Last Batch
      </button>
      <p>{message}</p>
    </div>
  );
}
