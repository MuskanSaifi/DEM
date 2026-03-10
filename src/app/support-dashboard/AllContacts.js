"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PRESET_REMARKS = ["Follow up","Called","Emailed","Resolved","Closed","Spam","Not interested"];

const AllContacts = ({ supportMember }) => {

const [contacts,setContacts] = useState([]);
const [filteredContacts,setFilteredContacts] = useState([]);
const [loading,setLoading] = useState(true);
const [error,setError] = useState(null);

const [searchName,setSearchName] = useState("");
const [searchEmail,setSearchEmail] = useState("");
const [searchPhone,setSearchPhone] = useState("");
const [filterDate,setFilterDate] = useState("");

const [remarkModal,setRemarkModal] = useState({open:false,contactId:null});
const [customRemark,setCustomRemark] = useState("");
const [addingRemark,setAddingRemark] = useState(false);

/* Pagination */
const [currentPage,setCurrentPage] = useState(1);
const rowsPerPage = 6;

const fetchContacts = async ()=>{

try{

const res = await axios.get("/api/contact");

const list = res.data.contacts || [];

const reversed = [...list].reverse();

setContacts(reversed);

}catch(err){

console.error(err);
setError("Failed to fetch contacts");

}
finally{
setLoading(false);
}

};

useEffect(()=>{
fetchContacts();
},[]);

/* Add Remark */

const addRemark = async(contactId,text)=>{

if(!text?.trim()) return;

setAddingRemark(true);

try{

const res = await axios.patch(`/api/contact/${contactId}`,{
remark:text.trim(),
addedBy:"Support"
});

if(res.data?.success){

setRemarkModal({open:false,contactId:null});
setCustomRemark("");

await fetchContacts();

}

}catch(err){
console.error(err);
}
finally{
setAddingRemark(false);
}

};

const openRemarkModal=(id)=>{
setRemarkModal({open:true,contactId:id});
setCustomRemark("");
};

const closeRemarkModal=()=>{
setRemarkModal({open:false,contactId:null});
};

/* Filters */

useEffect(()=>{

let filtered = contacts;

if(searchName){
filtered = filtered.filter(c =>
c.name.toLowerCase().includes(searchName.toLowerCase())
);
}

if(searchEmail){
filtered = filtered.filter(c =>
c.email.toLowerCase().includes(searchEmail.toLowerCase())
);
}

if(searchPhone){
filtered = filtered.filter(c =>
(c.phone || "").toLowerCase().includes(searchPhone.toLowerCase())
);
}

if(filterDate){
filtered = filtered.filter(c=>{
const date = new Date(c.createdAt).toISOString().split("T")[0];
return date === filterDate;
});
}

setFilteredContacts(filtered);
setCurrentPage(1);

},[searchName,searchEmail,searchPhone,filterDate,contacts]);

/* Pagination Logic */

const indexOfLast = currentPage * rowsPerPage;
const indexOfFirst = indexOfLast - rowsPerPage;
const currentContacts = filteredContacts.slice(indexOfFirst,indexOfLast);
const totalPages = Math.ceil(filteredContacts.length / rowsPerPage);

/* Date Format */

const formatDate=(date)=>{
return new Intl.DateTimeFormat("en-US",{
year:"numeric",
month:"short",
day:"2-digit",
hour:"2-digit",
minute:"2-digit",
second:"2-digit",
hour12:true
}).format(new Date(date));
};

if(!supportMember?.allContactAccess){

return(
<div className="max-w-7xl mx-auto p-6 text-center text-red-600 font-semibold">
Admin has not given you access to this page
</div>
);

}

return(

<div className="max-w-7xl mx-auto p-6 w-full">

<h1 className="text-2xl font-bold text-indigo-700 mb-4">
📞 All Contacts
</h1>

{/* Filters */}

<div className="mb-6 bg-white p-4 rounded-xl shadow-sm border flex gap-4 flex-wrap">

<input
type="text"
placeholder="Search by name"
className="flex-1 min-w-[160px] border rounded-lg px-3 py-2"
value={searchName}
onChange={(e)=>setSearchName(e.target.value)}
/>

<input
type="email"
placeholder="Search by email"
className="flex-1 min-w-[160px] border rounded-lg px-3 py-2"
value={searchEmail}
onChange={(e)=>setSearchEmail(e.target.value)}
/>

<input
type="text"
placeholder="Search by phone"
className="flex-1 min-w-[160px] border rounded-lg px-3 py-2"
value={searchPhone}
onChange={(e)=>setSearchPhone(e.target.value)}
/>

<input
type="date"
className="border rounded-lg px-3 py-2"
value={filterDate}
onChange={(e)=>setFilterDate(e.target.value)}
/>

</div>


{/* Table */}

<div className="bg-white rounded-xl shadow border w-full">

<div className="overflow-y-auto h-[500px]">

<table className="w-full">

<thead className="bg-indigo-600 text-white sticky top-0">

<tr>

<th className="px-4 py-3 text-left text-xs">Contact Details</th>
<th className="px-4 py-3 text-left text-xs">Message</th>
<th className="px-4 py-3 text-left text-xs">Created</th>
<th className="px-4 py-3 text-left text-xs">Remarks</th>

</tr>

</thead>

<tbody>

{loading ? (

Array(5).fill().map((_,i)=>(

<tr key={i}>
<td className="px-4 py-3"><Skeleton/></td>
<td className="px-4 py-3"><Skeleton/></td>
<td className="px-4 py-3"><Skeleton/></td>
<td className="px-4 py-3"><Skeleton/></td>
</tr>

))

) : (

currentContacts.map((contact)=>(

<tr key={contact._id} className="border-t hover:bg-gray-50">

<td className="px-4 py-3">

<div className="flex flex-col">

<span className="font-semibold">
{contact.name}
</span>

<span className="text-sm text-gray-600">
{contact.email}
</span>

<span className="text-sm text-gray-600">
{contact.phone || "—"}
</span>

</div>

</td>

<td className="px-4 py-3 text-sm max-w-[320px] break-words">
{contact.description || "—"}
</td>

<td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
{formatDate(contact.createdAt)}
</td>

<td className="px-4 py-3">

<div className="flex flex-col gap-1">

{contact.remarks?.length ? (

<ul className="space-y-1 text-xs">

{contact.remarks.map((r,i)=>(

<li key={i} className="bg-gray-100 rounded px-2 py-1">

{r.text}

</li>

))}

</ul>

):( 

<span className="text-gray-400 text-xs">
No remarks
</span>

)}

<button
onClick={()=>openRemarkModal(contact._id)}
className="text-indigo-600 text-xs mt-1"
>

+ Add remark

</button>

</div>

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


{/* Remark Modal */}

{remarkModal.open && (

<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

<div className="bg-white rounded-xl p-6 w-[500px]">

<h4 className="font-bold text-lg mb-3">
Add Remark
</h4>

<div className="flex flex-wrap gap-2 mb-4">

{PRESET_REMARKS.map((preset)=>(

<button
key={preset}
onClick={()=>addRemark(remarkModal.contactId,preset)}
className="border px-3 py-1 rounded text-sm"
>

{preset}

</button>

))}

</div>

<input
type="text"
value={customRemark}
onChange={(e)=>setCustomRemark(e.target.value)}
placeholder="Custom remark"
className="w-full border px-3 py-2 rounded mb-3"
/>

<button
onClick={()=>addRemark(remarkModal.contactId,customRemark)}
className="bg-indigo-600 text-white px-4 py-2 rounded w-full"
>

Add

</button>

<button
onClick={closeRemarkModal}
className="border px-4 py-2 rounded w-full mt-2"
>

Close

</button>

</div>

</div>

)}

</div>

);

};

export default AllContacts;