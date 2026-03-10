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

<div className="overflow-x-auto h-[400px] overflow-y-auto">

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

<div className="flex justify-center gap-2 mt-6">

<button
onClick={()=>setCurrentPage((p)=>Math.max(p-1,1))}
className="px-3 py-1 border rounded"
>

Prev

</button>

{Array.from({length:totalPages},(_,i)=>(

<button
key={i}
onClick={()=>changePage(i+1)}
className={`px-3 py-1 border rounded ${
currentPage===i+1 ? "bg-indigo-600 text-white":""
}`}
>

{i+1}

</button>

))}

<button
onClick={()=>setCurrentPage((p)=>Math.min(p+1,totalPages))}
className="px-3 py-1 border rounded"
>

Next

</button>
{/* View Lead Modal */}

{modalOpen && selectedLead && (

<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

<div className="bg-white rounded-xl shadow-xl p-6 w-[95%] max-w-2xl relative max-h-[90vh] overflow-y-auto">

<button
onClick={()=>setModalOpen(false)}
className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-2xl"
>
×
</button>

<h3 className="text-xl font-bold text-indigo-700 mb-4 text-center">
Lead Details
</h3>
<td className="px-4 py-3 text-xs text-gray-500">

{new Date(selectedLead.createdAt).toLocaleString()}

</td>

<div className="space-y-4">

{/* Buyer */}

<div className="bg-indigo-50 p-3 rounded-lg">

<p className="font-semibold text-indigo-700 mb-1">
Buyer Details
</p>

<p>{selectedLead.buyer?.fullname}</p>
<p>{selectedLead.buyer?.mobileNumber}</p>
<p>{selectedLead.buyer?.email || "N/A"}</p>

</div>


{/* Seller */}

<div className="bg-pink-50 p-3 rounded-lg">

<p className="font-semibold text-pink-700 mb-1">
Seller Details
</p>

<p>{selectedLead.seller?.fullname}</p>
<p>{selectedLead.seller?.mobileNumber}</p>
<p>{selectedLead.seller?.email || "N/A"}</p>

</div>


{/* Product */}

<div className="bg-blue-50 p-3 rounded-lg">

<p className="font-semibold text-blue-700 mb-2">
Product Details
</p>

{selectedLead.product?.images?.[0]?.url && (

<Image
src={selectedLead.product.images[0].url}
alt=""
width={120}
height={120}
className="rounded border mb-2"
/>

)}

<p>
<strong>Name :</strong> {selectedLead.product?.name}
</p>

<p>
<strong>Price :</strong> ₹{selectedLead.product?.price || "N/A"}
</p>

<p>
<strong>Description :</strong> {selectedLead.product?.description || "No description"}
</p>

</div>


{/* Quantity */}

<div className="bg-gray-50 p-3 rounded-lg">

<p>
<strong>Quantity :</strong> {selectedLead.quantity} {selectedLead.unit}
</p>

<p>
<strong>Frequency :</strong> {selectedLead.requirementFrequency}
</p>

</div>

</div>

</div>

</div>

)}


{/* Add Remark Modal */}

{remarkModal.open && (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">

<div className="bg-white rounded-xl shadow-xl p-6 w-[95%] max-w-md">

<h4 className="text-lg font-bold text-indigo-700 mb-4">
Add Remark
</h4>

<p className="text-sm text-gray-600 mb-2">
Preset remarks
</p>

<div className="flex flex-wrap gap-2 mb-4">

{PRESET_REMARKS.map((preset)=>(
<button
key={preset}
onClick={()=>addRemark(remarkModal.leadId,preset)}
className="px-3 py-1.5 rounded-lg border text-sm hover:bg-indigo-50"
>
{preset}
</button>
))}

</div>

<hr className="my-4"/>

<p className="text-sm text-gray-600 mb-2">
Custom Remark
</p>

<div className="flex gap-2">

<input
ref={customRemarkInputRef}
type="text"
placeholder="Type remark..."
value={customRemark}
onChange={(e)=>setCustomRemark(e.target.value)}
className="flex-1 border rounded-lg px-3 py-2 text-sm"
/>

<button
onClick={()=>addRemark(remarkModal.leadId,customRemark)}
disabled={addingRemark}
className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
>
{addingRemark ? "..." : "Add"}
</button>

</div>

<button
onClick={()=>setRemarkModal({open:false,leadId:null})}
className="mt-4 w-full border py-2 rounded-lg text-sm"
>
Close
</button>

</div>

</div>
)}
</div>

)}

</div>

);

};

export default LeadsEnquiry;