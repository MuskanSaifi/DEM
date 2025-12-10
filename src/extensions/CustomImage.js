// src/extensions/CustomImage.js
import Image from "@tiptap/extension-image";

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent(), // Inherit existing attributes like src, alt, title
      publicId: {
        default: null,
        // How to parse HTML to get the publicId
        parseHTML: (element) => element.getAttribute("data-public-id"),
        // How to render HTML from the publicId attribute
        renderHTML: (attributes) => {
          if (!attributes.publicId) {
            return {};
          }
          return { "data-public-id": attributes.publicId };
        },
      },
    };
  },
});

export default CustomImage;