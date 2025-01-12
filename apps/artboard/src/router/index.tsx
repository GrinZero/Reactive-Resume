import {
  createBrowserRouter,
  createHashRouter,
  createRoutesFromChildren,
  Route,
} from "react-router-dom";

import { ArtboardPage } from "../pages/artboard";
import { BuilderLayout } from "../pages/builder";
import { PreviewLayout } from "../pages/preview";
import { Providers } from "../providers";

export const routes = createRoutesFromChildren(
  <Route element={<Providers />}>
    <Route path="artboard" element={<ArtboardPage />}>
      <Route path="builder" element={<BuilderLayout />} />
      <Route path="preview" element={<PreviewLayout />} />
    </Route>
  </Route>,
);

const createAppRouter = import.meta.env.DEV ? createBrowserRouter : createHashRouter;
export const router = createAppRouter(routes);
