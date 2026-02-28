import React, { useRef } from "react";
import picIon from "../assets/img-plus.svg";

type PhotoTYpes = {
  handleUpload: (blob: Blob) => void;
  clearImage: (blob: Blob) => void;
};

const PhotoUpload = ({ handleUpload, clearImage }: PhotoTYpes) => {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const inputFileChange = () => {
    const inputFile = inputFileRef.current!.files![0];
    handleUpload(inputFile);
  };

  return (
    <div className="w-max absolute bottom-0 right-4 z-20">
      <label className="cursor-pointer">
        <img src={picIon} alt="pic-img" width={30} height={30} />
        <input
          ref={inputFileRef}
          type="file"
          name="file-input"
          className="m-0 w-full hidden"
          id="document-input"
          // placeholder="Busque um arquivo"
          accept=".jpeg, .png"
          onChange={inputFileChange}
        />
      </label>
    </div>
  );
};

export default PhotoUpload;
