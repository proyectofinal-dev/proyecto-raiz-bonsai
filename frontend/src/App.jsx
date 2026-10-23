import { useEffect } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Catalogo from './pages/Catalogo.jsx'
import DetalleBonsai from './pages/DetalleBonsai.jsx'
import Contacto from './pages/Contacto.jsx'
import Login from './pages/admin/Login.jsx'
import Panel from './pages/admin/Panel.jsx'
import RutaProtegida from './components/admin/RutaProtegida.jsx'
import NoEncontrada from './pages/NoEncontrada.jsx'

// Al cambiar de página el navegador conserva el scroll anterior; esto vuelve arriba.
function ScrollArriba() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// HashRouter (URLs tipo /#/catalogo) porque GitHub Pages solo sirve archivos
// estáticos: con BrowserRouter, recargar /catalogo daría 404 en el servidor.
export default function App() {
  return (
    <HashRouter>
      <ScrollArriba />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/bonsai/:id" element={<DetalleBonsai />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<RutaProtegida><Panel /></RutaProtegida>} />
            <Route path="*" element={<NoEncontrada />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </HashRouter>
  )
}
