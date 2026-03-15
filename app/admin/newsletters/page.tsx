'use client';
import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/src/context/authProvider';
import { fetchUserData, isUserAdmin } from '@/src/server/services/user.service';
import { Mail, Trash2, Download, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface Newsletter {
  id: string;
  email: string;
  subscribedAt: any;
  source?: string;
}

export default function NewsletterPage() {
  const { user, loading: authLoading } = useAuth();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmails, setShowEmails] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      fetchUserData(user.uid, user.email).then((data) => {
        setUserRole(data.role);
        if (data.role !== 'admin') {
          toast.error('Unauthorized access', { style: { borderRadius: 0 } });
          window.location.href = '/';
        }
      });
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user || userRole !== 'admin') return;

    setIsLoading(true);
    const q = query(collection(db, 'newsletters'), orderBy('subscribedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Newsletter[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Newsletter);
      });
      setNewsletters(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, userRole]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subscriber?')) {
      try {
        await deleteDoc(doc(db, 'newsletters', id));
        toast.success('Subscriber removed', { style: { borderRadius: 0 } });
      } catch (error) {
        toast.error('Failed to delete', { style: { borderRadius: 0 } });
      }
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Email', 'Subscribed Date', 'Source'],
      ...newsletters.map(n => [
        n.email,
        new Date(n.subscribedAt?.toDate?.() || n.subscribedAt).toLocaleString(),
        n.source || 'popup'
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletters-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported!', { style: { borderRadius: 0 } });
  };

  const filteredNewsletters = newsletters.filter(n =>
    n.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">⚡</div>
          <p className="text-gray-600">Loading newsletters...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="text-blue-600" size={32} />
            <h1 className="text-4xl font-bold text-gray-900">Newsletter Subscribers</h1>
          </div>
          <p className="text-gray-600">Manage and view all email subscribers from your popup</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Subscribers</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{newsletters.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">This Month</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {newsletters.filter(n => {
                const date = n.subscribedAt?.toDate?.() || new Date(n.subscribedAt);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">This Week</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {newsletters.filter(n => {
                const date = n.subscribedAt?.toDate?.() || new Date(n.subscribedAt);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - date.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
              }).length}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-96">
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEmails(!showEmails)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                {showEmails ? <EyeOff size={18} /> : <Eye size={18} />}
                {showEmails ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Download size={18} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Subscribed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredNewsletters.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No subscribers found
                    </td>
                  </tr>
                ) : (
                  filteredNewsletters.map((newsletter) => (
                    <tr key={newsletter.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        {showEmails ? newsletter.email : newsletter.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(newsletter.subscribedAt?.toDate?.() || newsletter.subscribedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {newsletter.source || 'popup'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDelete(newsletter.id)}
                          className="text-red-600 hover:text-red-900 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
