import './App.css';
import { Navigate, Route, Routes } from "react-router-dom";
import Cadastro from './components/cadastro';
import Dashboard from './components/Dashboard';
import GlobalRequestLoader from './components/GlobalRequestLoader';
import Landing from "./components/Landing";
import Login from "./components/Login";
import Products from "./components/Products";
import Sales from "./components/Sales";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/ativacao-conta" element={<Cadastro />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Dashboard />} />
          <Route path="/dashboard" element={<Navigate to="/home" replace />} />
          <Route path="/produtos" element={<Products />} />
          <Route path="/produtos/cadastro" element={<Products />} />
          <Route path="/produtos/edicao/:productId" element={<Products />} />
          <Route path="/vendas" element={<Sales />} />
          <Route path="/vendas/cadastro" element={<Sales />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <GlobalRequestLoader />
    </>
  );
}

export default App;
