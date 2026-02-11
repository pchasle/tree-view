import { StrictMode } from 'react'
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient();

ReactDOM.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
  document.getElementById("root"),
);
