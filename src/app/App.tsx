import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ContentProvider } from './content/ContentContext';

export default function App() {
  return (
    <ContentProvider>
      <RouterProvider router={router} />
    </ContentProvider>
  );
}
