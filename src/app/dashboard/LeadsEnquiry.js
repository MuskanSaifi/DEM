"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaUser, FaStore } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PRESET_REMARKS = ["Follow up","Called","Emailed","Resolved","Closed","Spam","Not interested"];

const LeadsEnquiry = () => {

const [leads,setLeads] = useState([]);
const [searchTerm,setSearchTerm] = useState("");
const [loading,setLoading] = useState(true);
const [modalOpen,setModalOpen] = useState(false);
const [selectedLead,setSelectedLead] = useState(null);
const [startDate,setStartDate] = useState("");
const [endDate,setEndDate] = useState("");

const [currentPage,setCurrentPage] = useState(1);
const leadsPerPage = 8;

const [remarkModal,setRemarkModal] = useState({open:false,leadId:null});
const [customRemark,setCustomRemark] = useState("");
const [addingRemark,setAddingRemark] = useState(false);

const customRemarkInputRef = useRef(null);

const fetchLeads = async ()=>{
try{

const res = await fetch("/api/admin/leadandwnquiry");
const data = await res.json();

if(data.success){
setLeads((data.data || []).reverse());
}

}catch(err){
console.log(err);
}finally{
setLoading(false);
}
};

useEffect(()=>{
fetchLeads();
},[]);


const addRemark = async (leadId,text)=>{

if(!text?.trim()) return;

setAddingRemark(true);

try{

const res = await fetch(`/api/admin/leadandwnquiry/${leadId}`,{
method:"PATCH",
headers:{ "Content-Type":"application/json"},
body:JSON.stringify({remark:text.trim(),addedBy:"Admin"})
});

const data = await res.json();

if(data.success){

setRemarkModal({open:false,leadId:null});
setCustomRemark("");

await fetchLeads();

}

}catch(err){
console.log(err);
}
finally{
setAddingRemark(false);
}

};


const filteredLeads = leads.filter((lead)=>{

const term = searchTerm.toLowerCase();

const createdAt = new Date(lead.createdAt);

const isWithinDateRange =
(!startDate || createdAt >= new Date(startDate)) &&
(!endDate || createdAt <= new Date(endDate+"T23:59:59"));

const matchesSearch =
lead?.buyer?.fullname?.toLowerCase().includes(term) ||
lead?.seller?.fullname?.toLowerCase().includes(term) ||
lead?.buyer?.mobileNumber?.toLowerCase().includes(term) ||
lead?.seller?.mobileNumber?.toLowerCase().includes(term) ||
lead?.product?.name?.toLowerCase().includes(term);

return matchesSearch && isWithinDateRange;

});


/* Pagination Logic */

const indexOfLastLead = currentPage * leadsPerPage;
const indexOfFirstLead = indexOfLastLead - leadsPerPage;

const currentLeads = filteredLeads.slice(indexOfFirstLead,indexOfLastLead);

const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

const changePage = (page)=>{
setCurrentPage(page);
};


return (

<div className="max-w-7xl mx-auto p-6">

<h2 className="text-3xl font-extrabold text-indigo-600 mb-4 text-center">
Leads Enquiry
</h2>

{/* Search */}

<div className="sticky top-0 z-10 mb-6 bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 md:items-center md:justify-between">

<input
type="text"
placeholder="Search by buyer, seller, phone, or product..."
className="w-full md:w-1/2 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
value={searchTerm}
onChange={(e)=>{
setSearchTerm(e.target.value);
setCurrentPage(1);
}}
/>

<div className="flex items-center gap-2">

<div>
<label className="text-xs text-gray-600 block mb-1">
From Date
</label>

<input
type="date"
value={startDate}
onChange={(e)=>setStartDate(e.target.value)}
className="border border-gray-300 rounded-lg px-2 py-2 text-sm"
/>

</div>

<div>
<label className="text-xs text-gray-600 block mb-1">
To Date
</label>

<input
type="date"
value={endDate}
onChange={(e)=>setEndDate(e.target.value)}
className="border border-gray-300 rounded-lg px-2 py-2 text-sm"
/>
</div>

</div>

</div>


{/* Table */}

<div className="bg-white rounded-xl shadow border border-gray-200">

<div className="overflow-x-auto h-[600px] overflow-y-auto">

<table className="min-w-full">

<thead className="bg-indigo-600 text-white sticky top-0">

<tr>

<th className="px-4 py-3 text-left text-xs">Buyer</th>
<th className="px-4 py-3 text-left text-xs">Seller</th>
<th className="px-4 py-3 text-left text-xs">Product</th>
<th className="px-4 py-3 text-left text-xs">Qty</th>
{/* <th className="px-4 py-3 text-left text-xs">Frequency</th> */}
{/* <th className="px-4 py-3 text-left text-xs">Created</th> */}
<th className="px-4 py-3 text-left text-xs">Remarks</th>
<th className="px-4 py-3 text-center text-xs">Action</th>

</tr>

</thead>

<tbody>

{loading ? (

Array(6).fill().map((_,i)=>(

<tr key={i}>
<td className="px-4 py-3"><Skeleton/></td>
<td className="px-4 py-3"><Skeleton/></td>
<td className="px-4 py-3"><Skeleton/></td>
<td className="px-4 py-3"><Skeleton/></td>
<td className="px-4 py-3"><Skeleton/></td>
<td className="px-4 py-3"><Skeleton/></td>
<td className="px-4 py-3"><Skeleton/></td>
<td className="px-4 py-3"><Skeleton/></td>
</tr>

))

) : (

currentLeads.map((lead,i)=>(

<tr key={lead._id || i} className="border-t hover:bg-gray-50">

<td className="px-4 py-3">

<div className="flex items-center gap-2">
<FaUser className="text-indigo-500"/>

<div>

<p className="font-medium text-sm">
{lead.buyer?.fullname}
</p>

<p className="text-xs text-gray-500">
{lead.buyer?.mobileNumber}
</p>

</div>

</div>

</td>


<td className="px-4 py-3">

<div className="flex items-center gap-2">
<FaStore className="text-pink-500"/>

<div>

<p className="font-medium text-sm">
{lead.seller?.fullname}
</p>

<p className="text-xs text-gray-500">
{lead.seller?.mobileNumber}
</p>

</div>

</div>

</td>


<td className="px-4 py-3">

<div className="flex items-center gap-2">

{lead.product?.images?.[0]?.url && (

<Image
src={lead.product.images[0].url}
alt=""
width={45}
height={45}
className="rounded border"
/>

)}

<p className="text-sm">
{lead.product?.name}
</p>

</div>

</td>


<td className="px-4 py-3 text-sm">
{lead.quantity}
</td>

{/* <td className="px-4 py-3 text-sm">
{lead.requirementFrequency}
</td> */}

{/* <td className="px-4 py-3 text-xs text-gray-500">

{new Date(lead.createdAt).toLocaleString()}

</td> */}
<td className="px-4 py-3 text-center align-middle">

<div className="flex flex-col items-center gap-1">

{lead.remarks && lead.remarks.length > 0 ? (

<ul className="space-y-1 text-xs">

{lead.remarks.map((r,index)=>(

<li
key={index}
className="bg-gray-100 rounded px-2 py-1 text-center"
>

<span className="text-gray-800">
{r.text}
</span>

{r.addedAt && (
<span className="text-gray-500 ml-1">
{new Date(r.addedAt).toLocaleDateString()}
</span>
)}

</li>

))}

</ul>

) : (

<span className="text-gray-400 text-xs text-center">
No remarks
</span>

)}

<button
onClick={()=>setRemarkModal({open:true,leadId:lead._id})}
className="text-indigo-600 hover:text-indigo-800 text-xs font-medium mt-1"
>

+ Add remark

</button>

</div>

</td>

<td className="px-4 py-3 text-center">

<button
onClick={()=>{
setSelectedLead(lead);
setModalOpen(true);
}}
className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm"
>

View Details

</button>

</td>




</tr>

))

)}

</tbody>

</table>

</div>

</div>


{/* Pagination */}

{totalPages > 1 && (

<div className="flex justify-center mt-6">

<nav className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">

<button
onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
className="px-3 py-1 text-sm rounded hover:bg-gray-200"
>
‹
</button>

{(() => {

const pages = [];

const start = Math.max(currentPage - 2, 1);
const end = Math.min(currentPage + 2, totalPages);

if (start > 1) {

pages.push(
<button
key={1}
onClick={() => setCurrentPage(1)}
className="px-3 py-1 text-sm rounded hover:bg-gray-200"
>
1
</button>
);

if (start > 2) {
pages.push(<span key="dots-start" className="px-2">...</span>);
}

}

for (let i = start; i <= end; i++) {

pages.push(
<button
key={i}
onClick={() => setCurrentPage(i)}
className={`px-3 py-1 text-sm rounded ${
currentPage === i
? "bg-indigo-600 text-white"
: "hover:bg-gray-200"
}`}
>
{i}
</button>
);

}

if (end < totalPages) {

if (end < totalPages - 1) {
pages.push(<span key="dots-end" className="px-2">...</span>);
}

pages.push(
<button
key={totalPages}
onClick={() => setCurrentPage(totalPages)}
className="px-3 py-1 text-sm rounded hover:bg-gray-200"
>
{totalPages}
</button>
);

}

return pages;

})()}

<button
onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
className="px-3 py-1 text-sm rounded hover:bg-gray-200"
>
›
</button>

</nav>

</div>

)}


{modalOpen && selectedLead && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-[400px]">

      <h3 className="text-lg font-bold mb-3">Lead Details</h3>

      <p><b>Buyer:</b> {selectedLead?.buyer?.fullname}</p>
      <p><b>Seller:</b> {selectedLead?.seller?.fullname}</p>
      <p><b>Product:</b> {selectedLead?.product?.name}</p>
      <p><b>Quantity:</b> {selectedLead?.quantity}</p>

      <button
        onClick={()=>setModalOpen(false)}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
      >
        Close
      </button>

    </div>
  </div>
)}

{remarkModal.open && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    
    <div className="bg-white rounded-xl p-6 w-[400px]">

      <h3 className="text-lg font-bold mb-3">Add Remark</h3>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {PRESET_REMARKS.map((r,i)=>(
          <button
            key={i}
            onClick={()=>addRemark(remarkModal.leadId,r)}
            className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
          >
            {r}
          </button>
        ))}
      </div>

      {/* Custom remark */}
      <input
        type="text"
        placeholder="Custom remark..."
        value={customRemark}
        onChange={(e)=>setCustomRemark(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-3"
      />

      <button
        onClick={()=>addRemark(remarkModal.leadId,customRemark)}
        disabled={addingRemark}
        className="w-full bg-indigo-600 text-white py-2 rounded"
      >
        {addingRemark ? "Adding..." : "Submit"}
      </button>

      <button
        onClick={()=>setRemarkModal({open:false,leadId:null})}
        className="mt-2 w-full bg-gray-300 py-2 rounded"
      >
        Cancel
      </button>

    </div>

  </div>
)}

</div>

);

};

export default LeadsEnquiry;