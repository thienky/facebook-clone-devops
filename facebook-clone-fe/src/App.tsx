import { Link, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import './App.css';

export default function App() {
  return (
    <div className="layout">
      <header className="header">
        <h1>Facebook Clone</h1>
        <nav>
          <Link to="/">Trang chủ</Link>
          <Link to="/login">Đăng nhập</Link>
        </nav>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}
