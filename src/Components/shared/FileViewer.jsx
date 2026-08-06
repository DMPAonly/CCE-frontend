import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api2 } from "../../api/authApi";

function FileViewer() {
  const { id } = useParams();

  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchFile();
  }, []);

  const fetchFile = async () => {
    try {
      const response = await api2.get(`/${id}`);
      setFile(response.data.file);
    } catch (error) {
      console.error(error);
    }
  };

  if (!file) {
    return <div className="p-10 text-xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-2 text-3xl font-bold">{file.filename}</h1>

      <p className="mb-6 text-gray-600">{file.language}</p>

      <pre className="overflow-auto rounded-lg bg-gray-900 p-6 text-green-400">
        <code>{file.content}</code>
      </pre>
    </div>
  );
}

export default FileViewer;
