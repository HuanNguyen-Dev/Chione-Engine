import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import './App.css'
// components

// pages
import Home from './pages/home'

// react router
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { CurrentUser, RecentlyViewed } from "./Context/Context";
// npm install
// npm install react-router-dom
// npm install ag-grid-react@32.3.3
// npm install bootstrap reactstrap
// npm install react-chartjs-2 chart.js

function App() {
  const NotFound = () =>{
    return <h2 className='centered_container'>404: Page not Found</h2>
  }
  return (
    <BrowserRouter>
      <div className="App">
        {/* <CurrentUser id="nm0005772">
          <RecentlyViewed> */}
            {/* <Header /> */}
            {/* the content */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path= "*" element={<NotFound />} />
            </Routes>
            {/* <Footer /> */}
          {/* </RecentlyViewed>
        </CurrentUser> */}
      </div>
    </BrowserRouter>
  )
}

export default App
