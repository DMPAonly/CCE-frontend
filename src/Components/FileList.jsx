import FileCard from "./FileCard";
import { useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";

function FileList({ files, onDelete }) {
    const navigate = useNavigate();

    const handleEdit = (fileId) => {
        const roomId = uuidV4();

        toast.success("Created a new room");

        navigate(`/editor/${roomId}/${fileId}`);
    };

    if (files.length === 0) {
        return (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white py-12 text-center">
                <h3>No files found</h3>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {files.map((file) => (
                <FileCard
                    key={file.file_id}
                    file={file}
                    onClick={() => navigate(`/file/${file.file_id}`)}
                    onEdit={() => handleEdit(file.file_id)}
                    onDelete={() => onDelete(file)}
                />
            ))}
        </div>
    );
}

export default FileList;