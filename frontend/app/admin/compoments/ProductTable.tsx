"use client";

import { useState } from "react";
import useProducts from "@/hooks/useProducts";
import { Trash2, Edit2, Plus } from "lucide-react";

export default function ProductTable() {
  const { products, createProduct, updateProduct, deleteProduct } =
    useProducts();

  const [search, setSearch] = useState("");
  const [unit, setUnit] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  const filtered = (products ?? []).filter(
    (p: any) =>
      (p?.name ?? "").toLowerCase().includes((search ?? "").toLowerCase()) &&
      (unit ? p.unit === unit : true)
  );

  const getPageList = (total: number, current: number) => {
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

  const start = (page - 1) * limit;
  const end = start + limit;
  const display = filtered.slice(start, end);
  const totalPages = Math.ceil(filtered.length / limit);

  const submit = async (e: any) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", e.target.name.value);
    form.append("desc", e.target.desc.value);
    form.append("price", e.target.price.value);
    form.append("unit", e.target.unit.value);
    form.append("discount", e.target.discount.value);
    if (e.target.image.files[0]) form.append("image", e.target.image.files[0]);

    if (editing) {
      await updateProduct(editing._id, form, true);
    } else {
      await createProduct(form, true);
    }

    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-full overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4 text-green-600">Danh sách sản phẩm </h2>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative w-full md:w-80">
            <input
              className="border px-3 py-2 pr-10 rounded w-full border-gray-300 focus:ring-2 focus:ring-green-400 outline-none bg-white"
              placeholder="Tìm sản phẩm..."
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
          

          <select
            className="border px-3 py-2 rounded bg-white border-gray-300 focus:ring-2 focus:ring-green-400 outline-none cursor-pointer"
            onChange={(e) => setUnit(e.target.value)}
          >
            <option value="">Đơn vị</option>
            <option value="Vỉ">Vỉ</option>
            <option value="Hộp">Hộp</option>
            <option value="Chai">Chai</option>
            <option value="Gói">Gói</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="border px-2 py-1 rounded border-gray-300 focus:ring-2 focus:ring-green-400 outline-none bg-white  cursor-pointer"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5/sp</option>
            <option value={10}>10/sp</option>
            <option value={20}>20/sp</option>
            <option value={50}>50/sp</option>
          </select>

          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer"
          >
            <Plus size={18} /> Thêm sản phẩm
          </button>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white shadow border border-gray-300 table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Ảnh</th>
              <th className="border p-2">Tên</th>
              <th className="border p-2">Giá</th>
              <th className="border p-2">Giảm</th>
              <th className="border p-2">Đơn vị</th>
              <th className="border p-2">Sửa</th>
              <th className="border p-2">Xóa</th>
            </tr>
          </thead>
          <tbody>
            {display.map((p: any) => (
              <tr key={p._id} className="hover:bg-gray-50 text-center">
                <td className="border p-2">
                  <img
                    src={p.image}
                    className="w-14 h-14 object-cover rounded mx-auto"
                  />
                </td>
                <td className="border p-2">{p.name}</td>
                <td className="border p-2 text-teal-600 font-semibold">
                  {(p.price - (p.price * p.discount) / 100).toLocaleString()}₫
                  {p.discount > 0 && (
                    <span className="text-gray-400 line-through ml-1 text-sm">
                      {p.price.toLocaleString()}₫
                    </span>
                  )}
                </td>
                <td className="border p-2">{p.discount}%</td>
                <td className="border p-2">{p.unit}</td>
                <td className="border p-2">
                  <button
                    className="text-blue-600"
                    onClick={() => {
                      setEditing(p);
                      setShowForm(true);
                    }}
                  >
                    <Edit2 />
                  </button>
                </td>
                <td className="border p-2">
                  <button className="text-red-600" onClick={() => setDeleting(p)}>
                    <Trash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 gap-2 flex-wrap">
          <button
            className="px-2 py-1 bg-white border rounded disabled:opacity-50 border-gray-300 cursor-pointer"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
            </svg>

          </button>
          <button
            className="px-2 py-1 bg-white border rounded disabled:opacity-50 border-gray-300 cursor-pointer"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>

          </button>

          {getPageList(totalPages, page).map((item, idx) =>
            item === "..." ? (
              <span key={`dot-${idx}`} className="px-2">...</span>
            ) : (
              <button
                key={`page-${item}-${idx}`}
                onClick={() => setPage(item as number)}
                className={`px-3 py-1 rounded border ${page === item
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white border-gray-300"
                  }`}
              >
                {item}
              </button>
            )
          )}


          <button
            className="px-2 py-1 bg-white border rounded disabled:opacity-50 border-gray-300 cursor-pointer"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>

          </button>
          <button
            className="px-2 py-1 bg-white border rounded disabled:opacity-50 border-gray-300 cursor-pointer"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
            </svg>

          </button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <form
            onSubmit={submit}
            className="bg-white p-5 rounded-lg w-full max-w-md space-y-3"
          >
            <h2 className="text-xl font-bold">
              {editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}
            </h2>
            <input
              name="name"
              defaultValue={editing?.name}
              className="border p-2 w-full rounded"
              placeholder="Tên"
              required
            />
            <input
              name="desc"
              defaultValue={editing?.desc}
              className="border p-2 w-full rounded"
              placeholder="Mô tả"
              required
            />
            <input
              name="price"
              defaultValue={editing?.price}
              type="number"
              className="border p-2 w-full rounded"
              placeholder="Giá"
              required
            />
            <input
              name="discount"
              defaultValue={editing?.discount}
              type="number"
              className="border p-2 w-full rounded"
              placeholder="Giảm (%)"
              required
            />
            <input
              name="image"
              type="file"
              accept="image/*"
              className="border p-2 w-full rounded"
              required={!editing}
              onChange={(e) => {
                const file =
                  e.target.files && e.target.files.length > 0
                    ? e.target.files[0]
                    : null;
                setSelectedFile(file);
              }}
            />
            <select
              name="unit"
              defaultValue={editing?.unit}
              className="border p-2 w-full rounded cursor-pointer"
            >
              <option value="Vỉ">Vỉ</option>
              <option value="Hộp">Hộp</option>
              <option value="Chai">Chai</option>
              <option value="Gói">Gói</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded  cursor-pointer"
              >
                Hủy
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer">
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-5 rounded-lg w-full max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
            <p className="mb-4">
              Bạn có chắc muốn xóa <strong>{deleting.name}</strong> không?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2 border rounded cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  await deleteProduct(deleting._id);
                  setDeleting(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
