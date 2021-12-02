import React from 'react';
import GlobalStyles from './styles/global'
import {BrowserRouter} from 'react-router-dom'
import Header from './components/Headers'
import Routes from './Routes';
import { CartProvider } from './hooks/useCart';
import { ToastContainer } from 'react-toastify';

const App = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <GlobalStyles />
        <Header />
        <Routes />
        <ToastContainer autoClose={3000}/>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
