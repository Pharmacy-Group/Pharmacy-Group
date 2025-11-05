export default function Header() {
  return (
    <header className="admin-topbar">
      <div className="breadcrumb">Quản lí đơn hàng / Danh sách sản phẩm</div>
      <div className="admin-user">
        <span className="admin-name">Admin Món lèo</span>
        <img
          src="https://i.pravatar.cc/40"
          alt="Admin avatar"
          className="avatar"
        />
      </div>
    </header>
  );
}
