import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import Image from "next/image";

const AllSubcategory = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSubCategory, setEditSubCategory] = useState({
    _id: "",
    name: "",
    subcategoryslug: "",
    metatitle: "",
    metadescription: "",
    metakeyword: "",
  });

  const fetchSubCategories = async () => {
    try {
      const response = await axios.get(`/api/adminprofile/subcategory/allsubcategory`);
      setSubCategories(response.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubCategory = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the subcategory!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmDelete.isConfirmed) {
      try {
        await axios.delete(`/api/adminprofile/subcategory/allsubcategory?id=${id}`);
        Swal.fire("Deleted!", "Subcategory has been deleted.", "success");
        setSubCategories(subCategories.filter((subcategory) => subcategory._id !== id));
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        Swal.fire("Error!", "Failed to delete subcategory.", "error");
      }
    }
  };

  const handleEditClick = (subcategory) => {
    setEditSubCategory({
      _id: subcategory._id,
      name: subcategory.name || "",
      subcategoryslug: subcategory.subcategoryslug || "",
      metatitle: subcategory.metatitle || "",
      metadescription: subcategory.metadescription || "",
      metakeyword: subcategory.metakeyword || "",
    });
    setShowModal(true);
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const newSlug = generateSlug(value);
      setEditSubCategory((prev) => ({
        ...prev,
        name: value,
        subcategoryslug: newSlug,
      }));
    } else {
      setEditSubCategory((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    const { _id, name, subcategoryslug, metatitle, metadescription, metakeyword } = editSubCategory;

    if (!name || !subcategoryslug || !metatitle || !metadescription || !metakeyword) {
      return Swal.fire("Warning!", "All fields are required.", "warning");
    }

    try {
      await axios.patch(`/api/adminprofile/subcategory/meta`, {
        id: _id,
        name,
        subcategoryslug,
        metatitle,
        metadescription,
        metakeyword,
      });

      Swal.fire("Success!", "Subcategory updated successfully!", "success");
      setShowModal(false);
      fetchSubCategories(); // Refresh data
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire("Error!", "Failed to update subcategory.", "error");
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">All Subcategories</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="bg-dark text-white">
            <tr>
              <th>#</th>
              <th>Icon</th>
              <th>Name</th>
              <th>Category</th>
              <th>Products</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subCategories.length > 0 ? (
              subCategories.map((subcategory, index) => (
                <tr key={subcategory._id}>
                  <td>{index + 1}</td>
                                <td>
                                   {subcategory.icon && (
                                     <Image
                                       src={subcategory.icon}
                                       alt={subcategory.name}
                                       width={50}
                                       height={50}
                                     />
                                   )}
                                 </td>
                  <td>{subcategory.name} || {subcategory._id}</td>
                  <td>{subcategory.category?.name || "N/A"}</td>
                  <td>{subcategory.products?.length || 0}</td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2 w-100"
                      onClick={() => handleEditClick(subcategory)}
                    >
                      Update
                    </Button>
                    <Button
                      variant="danger"
                      className="w-100 mt-1"
                      size="sm"
                      onClick={() => deleteSubCategory(subcategory._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No subcategories found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Edit Subcategory - {editSubCategory.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Subcategory Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editSubCategory.name}
                onChange={handleChange}
                placeholder="Enter subcategory name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Slug</Form.Label>
              <Form.Control
                type="text"
                name="subcategoryslug"
                value={editSubCategory.subcategoryslug}
                onChange={handleChange}
                placeholder="Auto-generated slug"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Meta Title</Form.Label>
              <Form.Control
                type="text"
                name="metatitle"
                value={editSubCategory.metatitle}
                onChange={handleChange}
                placeholder="Enter meta title"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Meta Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="metadescription"
                value={editSubCategory.metadescription}
                onChange={handleChange}
                placeholder="Enter meta description"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Meta Keywords</Form.Label>
              <Form.Control
                type="text"
                name="metakeyword"
                value={editSubCategory.metakeyword}
                onChange={handleChange}
                placeholder="Enter meta keywords"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AllSubcategory;
