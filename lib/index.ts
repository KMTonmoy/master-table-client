import axios from "axios";

export interface CloudinaryResponse {
  secure_url: string;
  url: string;
  public_id: string;
  asset_id: string;
  format: string;
  width: number;
  height: number;
}

const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

export const imageUpload = async (image: File): Promise<string> => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary env vars missing: set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET",
    );
  }

  if (!image || !(image instanceof File)) {
    throw new Error("imageUpload expects a File");
  }

  try {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const { data } = await axios.post<CloudinaryResponse>(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    if (data.secure_url) return data.secure_url;
    throw new Error("Cloudinary did not return secure_url");
  } catch (error) {
    console.error("Image upload error:", error);
    throw new Error("Failed to upload image");
  }
};
