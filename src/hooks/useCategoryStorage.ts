"use client";
import { useState, useEffect } from "react";
import { db } from "@/src/context/authProvider";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { uploadToCloudinary } from "@/src/server/services/cloudinary.service";
import type { Category } from "@/src/server/models/category.model";

export const useCategoryStorage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Category, "id">),
      }));
      setCategories(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addCategory = async (name: string, imageFile?: File, imageUrl?: string) => {
    if (!name.trim()) return;

    let finalImageUrl = "";

    if (imageFile) {
      finalImageUrl = await uploadToCloudinary(imageFile, "categories");
    } else if (imageUrl) {
      finalImageUrl = imageUrl;
    }

    await addDoc(collection(db, "categories"), {
      name: name.trim(),
      imageUrl: finalImageUrl,
    });
  };

  const updateCategory = async (
    id: string,
    name: string,
    imageFile?: File,
    imageUrl?: string
  ) => {
    const categoryRef = doc(db, "categories", id);
    const category = categories.find((c) => c.id === id);

    let finalImageUrl = category?.imageUrl || "";

    if (imageFile) {
      finalImageUrl = await uploadToCloudinary(imageFile, "categories");
    } else if (imageUrl && imageUrl !== category?.imageUrl) {
      finalImageUrl = imageUrl;
    }

    await updateDoc(categoryRef, {
      name: name.trim(),
      imageUrl: finalImageUrl,
    });
  };

  const deleteCategory = async (id: string) => {
    const categoryRef = doc(db, "categories", id);
    await deleteDoc(categoryRef);
  };

  return {
    categories,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};