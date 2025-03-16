import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import Home from "./component/Home";
import Login from "./component/Login";
import Register from "./component/Register";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route exact path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  </BrowserRouter>
);

export default App;
