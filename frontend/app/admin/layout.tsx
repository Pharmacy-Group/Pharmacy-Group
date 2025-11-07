// @ts-ignore: side-effect CSS import without type declarations
import './admin.css';
import Header from './compoments/Header';
import Sidebar from './compoments/Sidebar';
import ProductTable from './compoments/ProductTable';

export const metadata = {
  title: "Admin | Benzen",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return ( 
    <div className="flex">
      <Sidebar />

      <div className="flex-1">
        <Header />
        <main>{children}</main>
        <ProductTable />
      </div>
    </div>
    
  );
}
