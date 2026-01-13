"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Button } from "react-bootstrap";
import FilterSidebar from "./FilterSidebar";

export default function MobileFilterModal({ products, city, subcategory }) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* Mobile Filter Button - Only visible on mobile */}
      <button
        onClick={() => setShowModal(true)}
        className="lg:hidden bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <span>🔍</span> Filters
      </button>

      {/* Mobile Filter Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        fullscreen="md-down"
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Filter Products</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <FilterSidebar products={products} />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              router.push(window.location.pathname, { scroll: false });
              setShowModal(false);
            }}
          >
            Clear All
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowModal(false)}
          >
            Apply Filters
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

