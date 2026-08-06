function UploadButton({ onFileSelect }) {
  return (
    <>
      <label
        htmlFor="file-upload"
        className="inline-block cursor-pointer rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
      >
        Upload File
      </label>

      <input
        id="file-upload"
        type="file"
        className="hidden"
        onChange={onFileSelect}
      />
    </>
  );
}

export default UploadButton;
