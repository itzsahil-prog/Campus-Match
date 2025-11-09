import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-5xl font-bold text-primary-600 mb-4">
                  💘 CampusMatch
                </h1>
                <p className="text-xl text-gray-600">
                  College Dating Platform - Coming Soon
                </p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
