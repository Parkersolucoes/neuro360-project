
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SQLConnection {
  id: string;
  name: string;
  server: string;
  database: string;
  username: string;
  password: string;
  port: string;
  status: "connected" | "disconnected" | "testing";
}

interface SQLConnectionContextType {
  connections: SQLConnection[];
  setConnections: React.Dispatch<React.SetStateAction<SQLConnection[]>>;
}

const SQLConnectionContext = createContext<SQLConnectionContextType | undefined>(undefined);

export const SQLConnectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connections, setConnections] = useState<SQLConnection[]>([
    {
      id: "1",
      name: "Principal",
      server: "localhost",
      database: "vendas_db",
      username: "sa",
      password: "****",
      port: "1433",
      status: "connected"
    }
  ]);

  return (
    <SQLConnectionContext.Provider value={{ connections, setConnections }}>
      {children}
    </SQLConnectionContext.Provider>
  );
};

export const useSQLConnections = () => {
  const context = useContext(SQLConnectionContext);
  if (context === undefined) {
    throw new Error('useSQLConnections must be used within a SQLConnectionProvider');
  }
  return context;
};
