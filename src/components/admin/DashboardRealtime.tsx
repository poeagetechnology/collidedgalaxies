"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { db } from "@/src/context/authProvider";
import { collection, onSnapshot } from "firebase/firestore";

interface SalesInfo {
  productId: string;
  title?: string;
  image?: string;
  soldQty: number;
  revenue: number;
}

interface DashboardMetrics {
  totalRevenue: number;
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  monthlyOrders: number[];
  topSelling: SalesInfo | null;
  lowestSelling: SalesInfo | null;
  allProducts: SalesInfo[];
}

const ZERO_METRICS: DashboardMetrics = {
  totalRevenue: 0,
  totalProducts: 0,
  totalOrders: 0,
  totalCustomers: 0,
  monthlyOrders: new Array(12).fill(0),
  topSelling: null,
  lowestSelling: null,
  allProducts: [],
};

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function DashboardRealtime({
  initial,
}: {
  initial?: DashboardMetrics | null;
}) {
  const [metrics, setMetrics] = useState<DashboardMetrics>(
    initial ?? ZERO_METRICS
  );
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"quantity" | "revenue">("quantity");

  // 🔥 FIX: persist orders properly between renders
  const ordersRefStore = useRef<any[]>([]);

  const getOrderYear = useCallback((order: any): number => {
    if (order?.createdAt?.toDate)
      return order.createdAt.toDate().getFullYear();
    if (order?.createdAt instanceof Date) return order.createdAt.getFullYear();
    if (typeof order?.createdAt === "number")
      return new Date(order.createdAt).getFullYear();
    return new Date().getFullYear();
  }, []);

  const computeMetrics = useCallback(
    (year: number | "all") => {
      const allOrders = ordersRefStore.current;
      let productSales: Record<
        string,
        { qty: number; title?: string; image?: string; revenue: number }
      > = {};

      const newMetrics: DashboardMetrics = {
        totalRevenue: 0,
        totalProducts: metrics.totalProducts,
        totalOrders: 0,
        totalCustomers: metrics.totalCustomers,
        monthlyOrders: new Array(12).fill(0),
        topSelling: null,
        lowestSelling: null,
        allProducts: [],
      };

      const filteredOrders =
        year === "all"
          ? allOrders
          : allOrders.filter((order) => getOrderYear(order) === year);

      filteredOrders.forEach((order: any) => {
        if (typeof order?.amount === "number") {
          newMetrics.totalRevenue += order.amount;
        }

        let month: number | null = null;
        if (order?.createdAt?.toDate) month = order.createdAt.toDate().getMonth();
        else if (order?.createdAt instanceof Date)
          month = order.createdAt.getMonth();
        else if (typeof order?.createdAt === "number")
          month = new Date(order.createdAt).getMonth();

        if (month !== null && month >= 0 && month < 12) {
          newMetrics.monthlyOrders[month]++;
        }

        if (Array.isArray(order?.items)) {
          order.items.forEach((item: any) => {
            const productId = item.productId || item.id;
            if (!productId) return;
            if (!productSales[productId]) {
              productSales[productId] = {
                qty: 0,
                title: item.title || item.name,
                image: item.image || item.imageUrl,
                revenue: 0,
              };
            }
            productSales[productId].qty += item.quantity || 1;
            productSales[productId].revenue +=
              (item.price || 0) * (item.quantity || 1);
          });
        }

        newMetrics.totalOrders++;
      });

      const entries = Object.entries(productSales);
      if (entries.length > 0) {
        entries.sort((a, b) => b[1].qty - a[1].qty);

        const top = entries[0];
        const low = entries[entries.length - 1];

        newMetrics.topSelling = {
          productId: top[0],
          title: top[1].title,
          image: top[1].image,
          soldQty: top[1].qty,
          revenue: top[1].revenue,
        };
        newMetrics.lowestSelling = {
          productId: low[0],
          title: low[1].title,
          image: low[1].image,
          soldQty: low[1].qty,
          revenue: low[1].revenue,
        };

        newMetrics.allProducts = entries.map(([id, data]) => ({
          productId: id,
          title: data.title,
          image: data.image,
          soldQty: data.qty,
          revenue: data.revenue,
        }));
      }

      setMetrics(newMetrics);
    },
    [metrics.totalCustomers, metrics.totalProducts, getOrderYear]
  );

  useEffect(() => {
    if (!db) return;

    const ordersCol = collection(db, "orders");
    const productsCol = collection(db, "products");
    const usersCol = collection(db, "users");

    const unsubOrders = onSnapshot(
      ordersCol,
      (snap) => {
        ordersRefStore.current = snap.docs
          .map((d) => d.data())
          .filter((o) => o.status !== "cancelled");

        const years = [
          ...new Set(ordersRefStore.current.map((o) => getOrderYear(o))),
        ].sort((a, b) => b - a);
        setAvailableYears(years);

        computeMetrics(selectedYear); // 🔥 instant update
      },
      (err) => console.error("orders snapshot error:", err)
    );

    const unsubProducts = onSnapshot(
      productsCol,
      (snap) => {
        setMetrics((prev) => ({ ...prev, totalProducts: snap.size }));
      },
      (err) => console.error("products snapshot error:", err)
    );

    const unsubUsers = onSnapshot(
      usersCol,
      (snap) => {
        setMetrics((prev) => ({ ...prev, totalCustomers: snap.size }));
      },
      (err) => console.error("users snapshot error:", err)
    );

    return () => {
      unsubOrders();
      unsubProducts();
      unsubUsers();
    };
  }, [db, selectedYear, computeMetrics, getOrderYear]);

  const formatCurrency = (n: number) =>
    n?.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });

  const maxOrders = Math.max(...metrics.monthlyOrders, 1);

  const filteredProducts = metrics.allProducts
    .filter(
      (item) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortBy === "quantity" ? b.soldQty - a.soldQty : b.revenue - a.revenue
    );

  return (
    <div>
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-white shadow">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="text-2xl font-bold mt-1">{formatCurrency(metrics.totalRevenue)}</div>
        </div>

        <div className="p-4 bg-white shadow">
          <div className="text-sm text-gray-500">Total Products</div>
          <div className="text-2xl font-bold mt-1">{metrics.totalProducts}</div>
        </div>

        <div className="p-4 bg-white shadow">
          <div className="text-sm text-gray-500">Total Orders</div>
          <div className="text-2xl font-bold mt-1">{metrics.totalOrders}</div>
        </div>

        <div className="p-4 bg-white shadow">
          <div className="text-sm text-gray-500">Total Customers</div>
          <div className="text-2xl font-bold mt-1">{metrics.totalCustomers}</div>
        </div>
      </div>

      {/* Orders bar chart + top/bottom */}
      <div className="grid md:grid-cols-3 gap-6 items-start mb-8">
        <div className="md:col-span-2 h-full bg-white shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Orders (by month)</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="year-filter" className="text-sm text-gray-600">Year:</label>
              <select
                id="year-filter"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full h-48 flex items-end gap-2">
            {metrics.monthlyOrders.map((val, idx) => {
              const heightPct = Math.round((val / maxOrders) * 100);
              return (
                <div key={idx} className="flex-1 text-center group relative">
                  <div className="mx-auto" style={{ height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                    <div
                      className="mx-1 w-full transition-all duration-200 hover:opacity-80 cursor-pointer"
                      style={{
                        height: `${heightPct}%`,
                        background: '#0ea5e9',
                        minHeight: val > 0 ? '4px' : '0'
                      }}
                    />
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {monthLabels[idx]}: {val} orders
                  </div>

                  <div className="text-xs mt-2 text-gray-600">{monthLabels[idx]}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white shadow p-4">
          <h3 className="text-md font-semibold mb-2">Top & Low selling</h3>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Highest selling product</div>
              {metrics.topSelling ? (
                <div className="flex items-center gap-3 mt-2">
                  {metrics.topSelling.image ? (
                    <img
                      src={metrics.topSelling.image}
                      alt={metrics.topSelling.title || 'Product'}
                      width={56}
                      height={56}
                      className=" object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-100  flex items-center justify-center text-xs">No Image</div>
                  )}
                  <div>
                    <div className="font-semibold text-sm">{metrics.topSelling.title || metrics.topSelling.productId}</div>
                    <div className="text-xs text-gray-600">Sold: {metrics.topSelling.soldQty}</div>
                    <div className="text-xs text-gray-600">{formatCurrency(metrics.topSelling.revenue)}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600 mt-2">No sales data yet.</div>
              )}
            </div>

            <div>
              <div className="text-sm text-gray-500">Lowest selling product</div>
              {metrics.lowestSelling ? (
                <div className="flex items-center gap-3 mt-2">
                  {metrics.lowestSelling.image ? (
                    <img
                      src={metrics.lowestSelling.image}
                      alt={metrics.lowestSelling.title || 'Product'}
                      width={56}
                      height={56}
                      className=" object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-100  flex items-center justify-center text-xs">No Image</div>
                  )}
                  <div>
                    <div className="font-semibold text-sm">{metrics.lowestSelling.title || metrics.lowestSelling.productId}</div>
                    <div className="text-xs text-gray-600">Sold: {metrics.lowestSelling.soldQty}</div>
                    <div className="text-xs text-gray-600">{formatCurrency(metrics.lowestSelling.revenue)}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600 mt-2">No sales data yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Rankings Table */}
      <div className="bg-white  shadow p-4">
        <div className="flex w-full flex-col md:flex-row items-start md:items-center justify-between mb-4">
          <h2 className="w-full text-lg font-semibold mb-2 md:mb-0">Product Rankings</h2>

          <div className="flex w-full flex-col md:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 w-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'quantity' | 'revenue')}
              className="px-3 py-1 border w-full border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="quantity">Sort by Quantity</option>
              <option value="revenue">Sort by Revenue</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No products found matching your search.' : 'No product sales data available.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-semibold">#</th>
                  <th className="text-left p-3 font-semibold">Product</th>
                  <th className="text-right p-3 font-semibold">Units Sold</th>
                  <th className="text-right p-3 font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <tr key={product.productId} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-gray-600">{index + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title || 'Product'}
                            width={40}
                            height={40}
                            className=" object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100  flex items-center justify-center text-xs">
                            No Img
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{product.title || product.productId}</div>
                          <div className="text-xs text-gray-500">ID: {product.productId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right font-semibold">{product.soldQty}</td>
                    <td className="p-3 text-right font-semibold">{formatCurrency(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}