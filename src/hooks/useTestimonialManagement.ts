import { useState, useCallback } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase";

export interface Testimonial {
  id: string;
  rating: number;
  text: string;
  author: string;
  date: string;
  createdAt: Timestamp | Date;
  userId?: string;
  approved?: boolean;
}

export const useTestimonialManagement = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all testimonials
  const fetchTestimonials = useCallback(async (approvedOnly = true) => {
    try {
      setLoading(true);
      setError(null);

      let q;
      if (approvedOnly) {
        q = query(
          collection(db, "testimonials"),
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(
          collection(db, "testimonials"),
          orderBy("createdAt", "desc")
        );
      }

      const snapshot = await getDocs(q);
      const fetchedTestimonials: Testimonial[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (approvedOnly && !data.approved) {
          return;
        }
        fetchedTestimonials.push({
          id: docSnap.id,
          ...data,
        } as Testimonial);
      });

      setTestimonials(fetchedTestimonials);
      return fetchedTestimonials;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching testimonials";
      setError(message);
      console.error("Error fetching testimonials:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new testimonial
  const addTestimonial = useCallback(
    async (data: Omit<Testimonial, "id" | "createdAt">) => {
      try {
        setLoading(true);
        setError(null);

        const testimonialData = {
          ...data,
          createdAt: Timestamp.now(),
          approved: false, // Require admin approval
        };

        const docRef = await addDoc(
          collection(db, "testimonials"),
          testimonialData
        );

        const newTestimonial: Testimonial = {
          id: docRef.id,
          ...testimonialData,
        };

        setTestimonials((prev) => [newTestimonial, ...prev]);
        return newTestimonial;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error adding testimonial";
        setError(message);
        console.error("Error adding testimonial:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update testimonial (admin approval)
  const updateTestimonial = useCallback(
    async (id: string, updates: Partial<Testimonial>) => {
      try {
        setLoading(true);
        setError(null);

        await updateDoc(doc(db, "testimonials", id), updates);

        setTestimonials((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
        );
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error updating testimonial";
        setError(message);
        console.error("Error updating testimonial:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Delete testimonial
  const deleteTestimonial = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      await deleteDoc(doc(db, "testimonials", id));

      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error deleting testimonial";
      setError(message);
      console.error("Error deleting testimonial:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    testimonials,
    loading,
    error,
    fetchTestimonials,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
  };
};
