import { useState } from "react";
import toast from "react-hot-toast";

const ProductTags = ({ productId, existingTags = {} }) => {
  const [modaltag, setModaltag] = useState(false);
  const defaultTags = {
    trending: false,
    upcoming: false,
    diwaliOffer: false,
    holiOffer: false,
  };

  // Ensure valid tag states
  const [tags, setTags] = useState(() => ({ ...defaultTags, ...existingTags }));

  const handleTagChange = (tag) => {
    setTags((prevTags) => ({
      ...prevTags,
      [tag]: !prevTags[tag],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/adminprofile/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update tags");
      }

      toast.success("Tags updated successfully");
      setModaltag(false); // Close modal on success
    } catch (error) {
      toast.error(error.message || "Error updating tags");
    }
  };

  return (
    <div>
      <button 
        className="btn btn-primary mt-3" 
        onClick={() => setModaltag(true)}
      >
        Update Tags
      </button>

      {modaltag && (
        <div className="Tags">
          <div className="common-shad p-2 rounded-2 mt-2">
            <form className="p-3 border rounded" onSubmit={handleSubmit}>
              <h4 className="mb-3">Select Product Tags</h4>

              {/* Use flexbox for single-line checkboxes */}
              <div className="d-flex flex-wrap gap-3">
                {Object.keys(tags).map((tag) => (
                  <div key={tag} className="form-check d-flex align-items-center">
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      id={tag}
                      checked={tags[tag]}
                      onChange={() => handleTagChange(tag)}
                    />
                    <label className="form-check-label" htmlFor={tag}>
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </label>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between mt-3">
                <button type="submit" className="btn btn-success">Save Tags</button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => setModaltag(false)}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTags;
