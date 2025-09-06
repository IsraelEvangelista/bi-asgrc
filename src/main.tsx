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
  
  
  
  createRoot(rootElement).render(
    <App />
  );
  
  
} catch (error) {
  console.error('Erro ao inicializar aplicação:', error);
}
