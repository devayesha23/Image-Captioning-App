import React, { useState } from "react";
import * as filestack from "filestack-js";

// Initialize Filestack client
const client = filestack.init(process.env.REACT_APP_FILESTACK_API_KEY);

const ImageUploader = () => {
  const [images, setImages] = useState([]);
  const [captions, setCaptions] = useState({});
  const [tags, setTags] = useState({});

  // Function to handle file uploads
  const handleUpload = () => {
    const options = {
      onUploadDone: (res) => {
        const uploadedFiles = res.filesUploaded;
        setImages(uploadedFiles);
        generateCaptions(uploadedFiles);
      },
      accept: "image/*",
      maxFiles: 10, // batch upload
    };
    client.picker(options).open();
  };

  // Generate captions for uploaded images
  const generateCaptions = async (uploadedFiles) => {
    const newCaptions = {};
    const newTags = {};

    await Promise.all(
      uploadedFiles.map(async (file) => {
        const url = `https://cdn.filestackcontent.com/security=p:eyJleHBpcnkiOjE3Mjc2NDE4MDAsImNhbGwiOlsicGljayIsInJlYWQiLCJzdGF0Iiwid3JpdGUiLCJ3cml0ZVVybCIsInN0b3JlIiwiY29udmVydCIsInJlbW92ZSIsImV4aWYiLCJydW5Xb3JrZmxvdyJdfQ==,s:f7de33be18bc983fc3c7a24f97c54b83a89a89e78ba35adb7b5cfd4d5e6d9afb/caption/${file.handle}`;

        try {
          const response = await fetch(url);
          const data = await response.json();
          newCaptions[file.url] = data.caption;
          newTags[file.url] = extractTags(data.caption);
        } catch (error) {
          console.error("Error fetching captions:", error);
        }
      })
    );
    setCaptions(newCaptions);
    setTags(newTags);
  };

  // Extract tags from captions (simple splitting by words for demonstration)
  const extractTags = (caption) => {
    return caption.split(" ").map((word) => word.toLowerCase());
  };

  return (
    <div className="App">
      <button onClick={handleUpload}>Upload Images</button>

      <div style={{ marginTop: "20px" }}>
        {images.map((image) => (
          <div className="image-container" key={image.url}>
            <img
              src={image.url}
              alt={captions[image.url] || "Uploaded Image"}
            />
            <p><strong>Caption:</strong> {captions[image.url]}</p>
            <p><strong>Tags:</strong> {tags[image.url]?.join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;
