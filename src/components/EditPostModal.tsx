import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface EditPostModalProps {
  postId: number | null;
  open: boolean;
  onClose: () => void;
  onPostUpdated?: () => void;
}

const EditPostModal = ({
  postId,
  open,
  onClose,
  onPostUpdated,
}: EditPostModalProps) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "discussion",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open && postId) {
      fetchPost();
    }
  }, [open, postId]);

  const fetchPost = async () => {
    try {
      setInitialLoading(true);
      const res = await api.get(`/community-posts/${postId}/`);
      const post = res.data;

      setFormData({
        title: post.title || "",
        content: post.content || "",
        category: post.category || "discussion",
      });

      // Save existing images
      setExistingImages(post.images || []);
      setImagePreviews([]); // Clear previews for new uploads
      setImageFiles([]);

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not load the post for editing.",
        variant: "destructive",
      });
      onClose();
    } finally {
      setInitialLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files]);

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (imageId: number) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);
      data.append("category", formData.category);
      data.append("visibility", "public");

      imageFiles.forEach((file) => {
        data.append("images", file);
      });

      // Send list of images to keep (existing images not removed)
      const existingIds = existingImages.map((img) => img.id);
      data.append("existing_image_ids", JSON.stringify(existingIds));

      await api.patch(`/community-posts/${postId}/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: "Post updated successfully!",
      });

      onClose();
      onPostUpdated?.();

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not update the post.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Community Post</DialogTitle>
        </DialogHeader>

        {initialLoading ? (
          <p className="text-gray-500 py-8">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="postTitle">Title *</Label>
              <Input
                id="postTitle"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="What's your post about?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postCategory">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="discussion">Discussion</SelectItem>
                  <SelectItem value="job">Job Posting</SelectItem>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postContent">Content *</Label>
              <Textarea
                id="postContent"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Share your thoughts, ask questions, or start a discussion..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postImages">Attached Images</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {/* existing images */}
                {existingImages.length > 0 && (
                  <div className="space-y-4 mb-4">
                    <p className="text-gray-600 text-sm">Current images:</p>
                    <div className="grid grid-cols-2 gap-4">
                      {existingImages.map((img) => (
                        <div key={img.id} className="relative">
                          <img
                            src={img.image}
                            alt={`Existing image ${img.id}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => removeExistingImage(img.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* new uploads */}
                {imagePreviews.length > 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Post preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <label
                  htmlFor="postImages"
                  className="cursor-pointer flex flex-col items-center justify-center h-32"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">
                    Click to upload images
                  </span>
                  <Input
                    id="postImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditPostModal;
