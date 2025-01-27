import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Management from './UploadFormats/Management'
function App() {
  const [count, setCount] = useState(0)

  return (
  <div>
    <Management/>
  </div>
  )
}

export default App
