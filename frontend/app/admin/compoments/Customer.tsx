"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Eye } from "lucide-react";
import CustomerDetailModal from "./CustomerDetailModal";

// CẬP NHẬT: Interface User dựa trên userSchema
interface User {
  _id: string; // ID MongoDB
  name: string;
  email: string;
  role: "user" | "admin";
  // Sử dụng createdAt thay cho date
  createdAt: string;
  // Các trường sau bị loại bỏ vì không có trong userSchema của bạn: id, status, city, gender, point, phone
}

interface UserTableProps {
  // Cần truyền totalPages từ Backend/props để component Pagination hoạt động
  totalPages?: number;
  currentPage?: number;
  totalCount?: number;
}

const getPageList = (total: number, current: number): (number | string)[] => {
  const range: (number | string)[] = [];
  const maxVisible = 4;

  if (total <= maxVisible + 2) {
    for (let i = 1; i <= total; i++) range.push(i);
  } else {
    range.push(1);
    if (current > maxVisible - 1) range.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) range.push(i);
    if (current < total - (maxVisible - 2)) range.push("...");
    range.push(total);
  }
  return range;
};

export default function CustomerTable({
  totalPages: externalTotalPages = 1, // Đổi tên để tránh nhầm lẫn
  currentPage: externalCurrentPage = 1,
  totalCount: externalTotalCount = 0,
}: UserTableProps) {
  // Đổi tên state để phản ánh dữ liệu là User
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState<number>(externalCurrentPage);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  // Sử dụng state riêng cho totalPages và totalCount nếu muốn Backend trả về dynamic
  const [totalPages, setTotalPages] = useState<number>(externalTotalPages);
  const [totalCount, setTotalCount] = useState<number>(externalTotalCount);

  // Fetch dữ liệu từ backend với cookie/session
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        // ✅ SỬA LỖI: Thêm page, limit và searchTerm vào URL
        const res = await fetch(
          `http://localhost:5000/api/users?page=${page}&limit=10&search=${searchTerm}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
  
        if (res.status === 401) {
          setError("Chưa đăng nhập. Vui lòng đăng nhập để xem dữ liệu.");
          setUsers([]);
          return;
        }
  
        if (!res.ok) {
          // Xử lý lỗi từ Server (ví dụ: 500 Internal Server Error)
          const errorData = await res.json();
          throw new Error(errorData.message || "Lỗi khi fetch dữ liệu người dùng");
        }
  
        const data = await res.json();
        setUsers(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
  
      } catch (err: any) {
        // Bắt lỗi mạng hoặc lỗi custom từ Server
        setError(err.message || "Lỗi khi fetch dữ liệu");
      } finally {
        setLoading(false);
      }
    };
  
    // Khi page hoặc searchTerm thay đổi, fetch lại dữ liệu
    fetchUsers();
  }, [page, searchTerm]);

  const pageList = useMemo(
    () => getPageList(totalPages, page),
    [totalPages, page]
  );

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset về trang 1 khi tìm kiếm
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-full">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Quản lý người dùng
      </h2>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <p className="text-lg font-medium text-gray-600 mb-3 md:mb-0">
          Tổng số người dùng:{" "}
          <strong className="text-green-600">
            {totalCount.toLocaleString()}
          </strong>{" "}
          người
        </p>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Tìm kiếm theo Tên..."
            className="border px-4 py-2 pl-10 rounded-full w-full focus:ring-green-500 focus:border-green-500 transition duration-150 border-gray-300"
            value={searchTerm}
            onChange={handleSearch}
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      </div>

      {loading && (
        <div className="text-center text-green-600 mb-4">
          Đang tải dữ liệu...
        </div>
      )}
      {error && <div className="text-center text-red-600 mb-4">{error}</div>}

      <div className="overflow-x-auto w-full rounded-lg shadow-lg">
        <table className="min-w-full bg-white table-auto border-collapse">
          <thead className="bg-gray-100 border-b-2 border-gray-300">
            <tr>
              <th className="p-3 text-center text-sm font-semibold text-gray-700 w-10">
                <input type="checkbox" />
              </th>
              <th className="p-3 text-center text-sm font-semibold text-gray-700 w-24">
                ID MongoDB
              </th>
              <th className="p-3 text-center text-sm font-semibold text-gray-700 w-60">
                Tên/Email
              </th>
              <th className="p-3 text-center text-sm font-semibold text-gray-700 w-40">
                Vai trò
              </th>
              <th className="p-3 text-center text-sm font-semibold text-gray-700 w-40">
                Ngày tạo
              </th>
              <th className="p-3 text-center text-sm font-semibold text-gray-700 w-16">
                Xem
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((c) => (
                <tr
                  key={c._id}
                  className="border-b hover:bg-green-50/50 transition duration-100"
                >
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-green-600 rounded"
                    />
                  </td>
                  <td className="p-3 text-center text-xs font-mono text-gray-500">
                    {c._id}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-blue-700">{c.name}</div>
                    <div className="text-xs mt-1 text-gray-500">
                      {c.email}
                    </div>
                  </td>
                  <td className="p-3 text-center font-semibold">
                    <span className={`px-3 py-1 text-xs rounded-full ${c.role === "admin" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                      {c.role === "admin" ? "Quản trị" : "Khách hàng"}
                    </span>
                  </td>
                  <td className="p-3 text-center text-sm text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedUser(c)} // Đổi thành setSelectedUser
                      className="text-green-600 hover:text-green-800"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6} // Cập nhật colspan
                  className="p-6 text-center text-lg text-gray-500"
                >
                  Không tìm thấy người dùng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2 flex-wrap">
          <button onClick={() => handlePageChange(1)} disabled={page === 1}>
            &laquo;
          </button>
          <button
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            &lsaquo;
          </button>
          {pageList.map((p, idx) =>
            p === "..." ? (
              <span key={idx}>...</span>
            ) : (
              <button
                key={idx}
                onClick={() => handlePageChange(p as number)}
                className={
                  p === page
                    ? "bg-green-600 text-white px-2 py-1 rounded"
                    : "px-2 py-1"
                }
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            &rsaquo;
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
          >
            &raquo;
          </button>
        </div>
      )}

      {selectedUser && ( // Đổi thành selectedUser
        <CustomerDetailModal
          customer={selectedUser} // Cần cập nhật CustomerDetailModal để chấp nhận User type
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}