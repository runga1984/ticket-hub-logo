import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ticket, InventoryItem, DashboardStats, AppSettings } from '@/types';
import { DEMO_USERS } from './AuthContext';

interface DataContextType {
  tickets: Ticket[];
  inventory: InventoryItem[];
  settings: AppSettings;
  addTicket: (ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>) => void;
  updateTicket: (id: number, updates: Partial<Ticket>) => void;
  deleteTicket: (id: number) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'created_at'>) => void;
  updateInventoryItem: (id: number, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: number) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  getStats: () => DashboardStats;
  getDepartments: () => { id: number; name: string }[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
  logoUrl: '',
  organizationName: 'CDCE Anzoátegui',
  systemName: 'Sistema de Gestión Integral'
};

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 1,
    user_id: 2,
    title: 'Falla en impresora de red',
    description: 'La impresora HP del piso 3 no responde a trabajos de impresión desde ninguna estación.',
    priority: 'Alta',
    category: 'Hardware',
    status: 'Abierto',
    department_name: 'Atención al ciudadano',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 2,
    user_id: 3,
    title: 'Actualización de sistema operativo',
    description: 'Solicitud de actualización de Windows en equipos del departamento.',
    priority: 'Media',
    category: 'Software',
    status: 'En Progreso',
    admin_response: 'Actualizaciones programadas para el viernes después de las 5pm.',
    department_name: 'Seguro Social',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: 3,
    user_id: 4,
    title: 'Sin conexión a internet',
    description: 'Desde esta mañana no hay conexión a internet en todo el piso.',
    priority: 'Critica',
    category: 'Redes',
    status: 'Resuelto',
    admin_response: 'Se reinició el switch principal y se restableció la conexión.',
    department_name: 'Supervisión Educativa',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString()
  }
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 1, name: 'Laptop Dell Latitude 5520', type: 'Hardware', serial_number: 'DL5520-001', status: 'Activo', stock: 15, description: 'Portátiles para personal administrativo', created_at: new Date().toISOString() },
  { id: 2, name: 'Monitor LG 24"', type: 'Periferico', serial_number: 'LG24-001', status: 'Activo', stock: 25, description: 'Monitores de escritorio', created_at: new Date().toISOString() },
  { id: 3, name: 'Microsoft Office 365', type: 'Software', serial_number: 'MS365-LIC-001', status: 'Activo', stock: 50, description: 'Licencias anuales', created_at: new Date().toISOString() },
  { id: 4, name: 'Impresora HP LaserJet Pro', type: 'Hardware', serial_number: 'HP-LJ-003', status: 'Mantenimiento', stock: 3, description: 'Impresoras de red', created_at: new Date().toISOString() },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('cdce_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('cdce_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('cdce_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('cdce_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('cdce_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('cdce_settings', JSON.stringify(settings));
  }, [settings]);

  const addTicket = (ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>) => {
    const newTicket: Ticket = {
      ...ticket,
      id: Math.max(0, ...tickets.map(t => t.id)) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const updateTicket = (id: number, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
    ));
  };

  const deleteTicket = (id: number) => {
    setTickets(prev => prev.filter(t => t.id !== id));
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'created_at'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Math.max(0, ...inventory.map(i => i.id)) + 1,
      created_at: new Date().toISOString()
    };
    setInventory(prev => [...prev, newItem]);
  };

  const updateInventoryItem = (id: number, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(i => 
      i.id === id ? { ...i, ...updates } : i
    ));
  };

  const deleteInventoryItem = (id: number) => {
    setInventory(prev => prev.filter(i => i.id !== id));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getStats = (): DashboardStats => ({
    abiertos: tickets.filter(t => t.status === 'Abierto').length,
    progreso: tickets.filter(t => t.status === 'En Progreso').length,
    resueltos: tickets.filter(t => t.status === 'Resuelto').length
  });

  const getDepartments = () => {
    return DEMO_USERS
      .filter(u => u.role === 'departamento')
      .map(u => ({ id: u.id, name: u.department_name }));
  };

  return (
    <DataContext.Provider value={{ 
      tickets, 
      inventory, 
      settings, 
      addTicket, 
      updateTicket,
      deleteTicket,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      updateSettings, 
      getStats,
      getDepartments 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
