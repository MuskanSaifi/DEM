import React, { useState, useEffect } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PRESET_REMARKS = ["Follow up","Called","Emailed","Resolved","Closed","Spam","Not interested"];

const AllContacts = () => {

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

const fetchContacts = async()=>{

try{

const response = await axios.get("/api/contact");

const list = response.data.contacts || [];

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
addedBy:"Admin"
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

const openRemarkModal=(contactId)=>{
setRemarkModal({open:true,contactId});
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


/* Loading */

if(loading){

return(

<div className="container mt-4">

<div className="card shadow p-4">

<h1 className="fs-4 fw-bold mb-4">📞 All Contacts</h1>

<div className="row g-3 mb-4">
{Array(4).fill().map((_,i)=>(
<div className="col-md-3" key={i}>
<Skeleton height={38}/>
</div>
))}
</div>

<div className="table-responsive">

<table className="table table-bordered">

<thead className="table-dark">
<tr>
<th><Skeleton/></th>
<th><Skeleton/></th>
<th><Skeleton/></th>
<th><Skeleton/></th>
</tr>
</thead>

<tbody>
{Array(5).fill().map((_,i)=>(
<tr key={i}>
<td><Skeleton/></td>
<td><Skeleton/></td>
<td><Skeleton/></td>
<td><Skeleton/></td>
</tr>
))}
</tbody>

</table>

</div>

</div>

</div>

);

}

if(error){
return <div className="container mt-4">{error}</div>;
}


return(

<div className="container mt-4">

<div className="card shadow p-4">

<h1 className="fs-4 fw-bold mb-4">📞 All Contacts</h1>


{/* Filters */}

<div className="row g-3 mb-4">

<div className="col-md-3">
<input
type="text"
className="form-control"
placeholder="Search by name"
value={searchName}
onChange={(e)=>setSearchName(e.target.value)}
/>
</div>

<div className="col-md-3">
<input
type="email"
className="form-control"
placeholder="Search by email"
value={searchEmail}
onChange={(e)=>setSearchEmail(e.target.value)}
/>
</div>

<div className="col-md-3">
<input
type="text"
className="form-control"
placeholder="Search by phone"
value={searchPhone}
onChange={(e)=>setSearchPhone(e.target.value)}
/>
</div>

<div className="col-md-3">
<input
type="date"
className="form-control"
value={filterDate}
onChange={(e)=>setFilterDate(e.target.value)}
/>
</div>

</div>


{/* Table */}

<div className="table-responsive">

<div style={{maxHeight:"500px",overflowY:"auto"}}>

<table className="table table-bordered table-hover">

<thead className="table-dark sticky-top">

<tr>

<th style={{width:"220px"}}>Contact Details</th>
<th>Message</th>
<th style={{width:"180px"}}>Created At</th>
<th style={{width:"220px"}}>Remarks</th>

</tr>

</thead>

<tbody>

{currentContacts.map((contact)=>(

<tr key={contact._id}>

<td>

<div className="d-flex flex-column">

<span className="fw-semibold">
{contact.name}
</span>

<span className="text-muted small">
{contact.email}
</span>

<span className="text-muted small">
{contact.phone || "—"}
</span>

</div>

</td>

<td style={{maxWidth:300}} className="text-break">
{contact.description}
</td>

<td>
{formatDate(contact.createdAt)}
</td>

<td>

<div className="d-flex flex-column gap-1">

{contact.remarks?.length ? (

<ul className="list-unstyled mb-1 small">

{contact.remarks.map((r,i)=>(
<li key={i} className="bg-light rounded px-2 py-1 mb-1">
{r.text}
</li>
))}

</ul>

):(

<span className="text-muted small">
No remarks
</span>

)}

<button
className="btn btn-sm btn-outline-primary align-self-start"
onClick={()=>openRemarkModal(contact._id)}
>
+ Add remark
</button>

</div>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>


{/* Pagination */}

{totalPages > 1 && (

<div className="d-flex justify-content-center mt-3">

<nav className="d-flex align-items-center gap-1 border rounded p-1 bg-light">

<button
className="btn btn-sm btn-light"
onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
className="btn btn-sm btn-light"
onClick={() => setCurrentPage(1)}
>
1
</button>

);

if (start > 2) {

pages.push(
<span key="dots-start" className="px-2">
...
</span>
);

}

}

for (let i = start; i <= end; i++) {

pages.push(

<button
key={i}
className={`btn btn-sm ${
currentPage === i
? "btn-primary"
: "btn-light"
}`}
onClick={() => setCurrentPage(i)}
>
{i}
</button>

);

}

if (end < totalPages) {

if (end < totalPages - 1) {

pages.push(
<span key="dots-end" className="px-2">
...
</span>
);

}

pages.push(

<button
key={totalPages}
className="btn btn-sm btn-light"
onClick={() => setCurrentPage(totalPages)}
>
{totalPages}
</button>

);

}

return pages;

})()}

<button
className="btn btn-sm btn-light"
onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
>
›
</button>

</nav>

</div>

)}



{/* Add Remark Modal */}

{remarkModal.open &&(

<div className="modal d-block bg-dark bg-opacity-25">

<div className="modal-dialog modal-dialog-centered">

<div className="modal-content">

<div className="modal-header">
<h5 className="modal-title">Add Remark</h5>
<button className="btn-close" onClick={closeRemarkModal}/>
</div>

<div className="modal-body">

<div className="d-flex flex-wrap gap-2 mb-3">

{PRESET_REMARKS.map((preset)=>(
<button
key={preset}
className="btn btn-sm btn-outline-secondary"
onClick={()=>addRemark(remarkModal.contactId,preset)}
>
{preset}
</button>
))}

</div>

<input
type="text"
className="form-control form-control-sm"
placeholder="Custom remark"
value={customRemark}
onChange={(e)=>setCustomRemark(e.target.value)}
/>

<button
className="btn btn-primary btn-sm mt-3"
onClick={()=>addRemark(remarkModal.contactId,customRemark)}
>
Add
</button>

</div>

</div>

</div>

</div>

)}

</div>

</div>

);

};

export default AllContacts;