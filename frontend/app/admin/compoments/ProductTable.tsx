const products = [
  { id: 1, name: "Nat C 1000", code: "TPBS1", category: "Thực phẩm chức năng", unit: "Lọ", stock: 68, cost: "95.000đ", price: "105.000đ", image: "/product.jpg" },
  { id: 2, name: "Nat C 1000", code: "TPBS2", category: "Thực phẩm chức năng", unit: "Lọ", stock: 68, cost: "95.000đ", price: "105.000đ", image: "/product.jpg" },
];

export default function ProductTable() {
  return (
    <table className="product-table">
      <thead>
        <tr>
          <th>Ảnh</th>
          <th>Tên sản phẩm</th>
          <th>Mã sản phẩm</th>
          <th>Danh mục</th>
          <th>Đơn vị</th>
          <th>Tồn kho</th>
          <th>Giá gốc</th>
          <th>Giá bán</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id}>
            <td><img src={p.image} alt={p.name} className="thumb" /></td>
            <td>{p.name}</td>
            <td>{p.code}</td>
            <td>{p.category}</td>
            <td>{p.unit}</td>
            <td>{p.stock}</td>
            <td>{p.cost}</td>
            <td>{p.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
