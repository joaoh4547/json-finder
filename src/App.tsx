import {HashRouter, Route, Routes} from "react-router-dom";
import {RootLayout} from "@/layouts/main.tsx";
import {JsonTransformPage} from "@/pages/json-transform.tsx";


function App() {
  return (
    <HashRouter>
      <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<JsonTransformPage />}/>
          </Route>
      </Routes>
    </HashRouter >
  )
}

export default App
