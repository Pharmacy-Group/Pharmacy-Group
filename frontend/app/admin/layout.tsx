import Sidebar from './compoments/Sidebar';
import Header from './compoments/Header';
import './admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Header />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
