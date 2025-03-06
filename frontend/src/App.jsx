import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import HomePage from './Pages/HomePage'
import ChatPage from './Pages/ChatPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='App'>
      
      <Routes>
        <Route path='/' element={<HomePage />} exact/>
        <Route path='/chats' element={<ChatPage />} exact/>
      </Routes>
    </div>
  )
}

export default App
