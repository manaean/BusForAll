import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function CommuterLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <Navbar />
      <Outlet />
    </div>
  );
}
