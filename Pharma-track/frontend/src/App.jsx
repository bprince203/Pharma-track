import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import ManufacturerDashboard from './pages/manufacturer/Dashboard'

export default function App() {
  return(
    <>
    <BrowserRouter>
    <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/manufacturers/" element={<ManufacturerDashboard} />
    </Routes>
    </BrowserRouter>
    
    </>
  )
}
