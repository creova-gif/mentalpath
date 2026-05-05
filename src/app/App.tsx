import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { UserProvider } from './context/UserContext';
import '../i18n/config';

function App() {
  return (
    <UserProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton />
    </UserProvider>
  );
}

export default App;
