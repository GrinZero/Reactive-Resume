/* eslint-disable unicorn/prefer-add-event-listener */
import { useMutation } from "@tanstack/react-query";

export const file2base64 = async (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error("Failed to read the file"));
    };
    reader.readAsDataURL(file);
  });
};

export const uploadImage = async (file: File) => {
  const base64 = await file2base64(file);
  return { data: base64 };
};

export const useUploadImage = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: uploadImageFn,
  } = useMutation({
    mutationFn: uploadImage,
  });

  return { uploadImage: uploadImageFn, loading, error };
};
