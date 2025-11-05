import ProductTable from './compoments/ProductTable';

export default function AdminPage() {
  return (
    <div>
      <div className="admin-header">
        <h1>Sản phẩm</h1>
        <button className="btn-add">Thêm sản phẩm</button>
      </div>
      <ProductTable />
    </div>
  );
}
