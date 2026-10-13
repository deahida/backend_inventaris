import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { InventoryProvider } from '@/contexts/InventoryContext';
import { AppRoutes } from '@/routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import { AttendanceProvider } from '@/contexts/AttendanceContext';

function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <AttendanceProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </AttendanceProvider>
      </InventoryProvider>
    </AuthProvider>
  );
}

export default App;
