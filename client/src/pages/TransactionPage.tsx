// // client/src/pages/TransactionPage.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { API_URL } from '../constants';

// const ledgerGroups = {
//   'Sales Account': ['Sales'],
//   'Fixed Expenses': ['Salary', 'Travelling- Local', /*...*/],
//   // ... Add all other groups and their ledgers
// };

// function TransactionPage() {
//   const [formData, setFormData] = useState({
//     date: new Date().toISOString().split('T')[0],
//     ledgerGroup: '',
//     ledger: '',
//     costCenter: '',
//     amount: ''
//   });
//   const [costCenters, setCostCenters] = useState([]);

//   useEffect(() => {
//     axios.get(API_URL+'/cost-centers').then(res => setCostCenters(res.data));
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await axios.post(API_URL+'/transactions', formData);
//     // Reset form or show success message
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value}) />

//       <select value={formData.ledgerGroup} onChange={e => setFormData({...formData, ledgerGroup: e.target.value, ledger: ''})}>
//         <option value="">Select Group</option>
//         {Object.keys(ledgerGroups).map(group => (
//           <option key={group} value={group}>{group}</option>
//         ))}
//       </select>

//       <select value={formData.ledger} onChange={e => setFormData({...formData, ledger: e.target.value})}>
//         <option value="">Select Ledger</option>
//         {formData.ledgerGroup && ledgerGroups[formData.ledgerGroup].map(ledger => (
//           <option key={ledger} value={ledger}>{ledger}</option>
//         ))}
//       </select>

//       <select value={formData.costCenter} onChange={e => setFormData({...formData, costCenter: e.target.value})}>
//         {costCenters.map(cc => (
//           <option key={cc._id} value={cc._id}>{cc.name}</option>
//         ))}
//       </select>

//       <input type="number" step="0.01" placeholder="Amount"
//         value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
//       />

//       <button type="submit">Submit</button>
//     </form>
//   );
// }
