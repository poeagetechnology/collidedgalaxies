'use client';

import { useEffect, useState } from 'react';
import { useTestimonialManagement } from '@/src/hooks/useTestimonialManagement';
import { Testimonial } from '@/src/hooks/useTestimonialManagement';
import { Check, X, Image as ImageIcon } from 'lucide-react';

export default function AdminTestimonials() {
  const { testimonials, loading, fetchTestimonials, updateTestimonial, deleteTestimonial } = 
    useTestimonialManagement();
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials(false); // Fetch all testimonials
  }, [fetchTestimonials]);

  const filteredTestimonials = testimonials.filter((t) => {
    if (filter === 'approved') return t.approved;
    if (filter === 'pending') return !t.approved;
    return true;
  });

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      await updateTestimonial(id, { approved: true });
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (id: string) => {
    setDeleting(id);
    try {
      await deleteTestimonial(id);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testimonials Management</h1>
          <p className="text-gray-600 mt-1">Manage customer testimonials and reviews</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-medium text-sm transition ${
              filter === f
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({filteredTestimonials.length})
          </button>
        ))}
      </div>

      {/* Testimonials List */}
      {filteredTestimonials.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-lg">No testimonials found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{testimonial.author}</h3>
                    <div className="flex gap-0.5">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{testimonial.date}</p>
                </div>
                <div className="flex gap-2">
                  {!testimonial.approved && (
                    <button
                      onClick={() => handleApprove(testimonial.id)}
                      disabled={approving === testimonial.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 transition text-sm"
                    >
                      <Check size={16} />
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleReject(testimonial.id)}
                    disabled={deleting === testimonial.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 transition text-sm"
                  >
                    <X size={16} />
                    Delete
                  </button>
                </div>
              </div>

              <p className="text-gray-700 mb-3">{testimonial.text}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>ID: {testimonial.id.slice(0, 8)}...</span>
                {testimonial.approved && (
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                    ✓ Approved
                  </span>
                )}
                {!testimonial.approved && (
                  <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                    ⏳ Pending
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
