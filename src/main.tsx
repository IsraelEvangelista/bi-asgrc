import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error('Elemento root não encontrado');
    throw new Error('Root element not found');
  }
  
  // Criar containers para os portals do FixedLayout
  const createPortalContainer = (id: string) => {
    if (!document.getElementById(id)) {
      const container = document.createElement('div');
      container.id = id;
      document.body.appendChild(container);
    }
  };
  
  createPortalContainer('header-portal');
  createPortalContainer('navbar-portal');
  
  createRoot(rootElement).render(
    <App />
  );
  
  
} catch (error) {
  console.error('Erro ao inicializar aplicação:', error);
}
