import { useState, useRef, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Trash, Download } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";

function Documents() {
  const { user, accessToken, login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState("resume");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    refreshFiles();
  }, []);

  const refreshFiles = async () => {
    const res = await api.get("accounts/files/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setFiles(res.data);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

const handleUpload = async () => {
  if (!selectedFile) {
    return toast({ title: "No file selected", variant: "destructive" });
  }

  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("file_type", fileType);

  try {
    await api.post("accounts/files/", formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "multipart/form-data",
      },
    });

    toast({
      title: "Upload Successful",
      description: `${selectedFile.name} uploaded as ${fileType}.`,
    });

    setSelectedFile(null);
    refreshFiles();
  } catch (err: any) {
    // Attempt to extract error message
    const errorData = err.response?.data;
    const errorMessages = errorData?.file?.join(", ") || "Upload failed.";

    toast({
      title: "Upload Error",
      description: errorMessages,
      variant: "destructive",
    });
  }
};

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`accounts/files/${id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast({ title: "Deleted" });
      refreshFiles();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };
  const  formatFileName = (filename: string)=> {
  const parts = filename.split("_");
  return parts.slice(2).join("_").toLowerCase(); // from index 3 onward
}

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents & Files</CardTitle>
        <CardDescription>Upload resume, certificates, or other documents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed rounded-lg p-6 text-center bg-gray-50">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500 mb-2">Drag and drop files here, or</p>
          <Button variant="outline" onClick={handleChooseFile}>Choose File</Button>

          {selectedFile && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Selected: <span className="font-medium">{selectedFile.name}</span>
              </p>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="mt-2 border rounded px-3 py-1"
              >
                <option value="resume">Resume</option>
                <option value="certificate">Certificate</option>
                <option value="transcript">Transcript</option>
                <option value="other">Other</option>
              </select>
              <Button className="ml-4" onClick={handleUpload}>Upload</Button>
            </div>
          )}
        </div>

        <div>
          <h4 className="font-medium mb-3">Uploaded Files</h4>
          <div className="space-y-2">
            {files.map((f: any) => (
              <div key={f.id} className="flex justify-between items-center p-3 border rounded-lg bg-white shadow-sm">
                <div>
                  <p className="font-medium">{formatFileName(f.file.split("/").pop())}</p>
                  <p className="text-xs text-gray-500">{f.file_type} • {new Date(f.uploaded_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <a href={f.file} download={f.file} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </a>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(f.id)}>
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default Documents;
