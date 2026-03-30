import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'

export default function App() {
  return(
    <>
    <BrowserRouter>
    <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/home" element={<h1>Home</h1>} />
    </Routes>
    </BrowserRouter>
    
    </>
  )
}
