import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Package, LayoutDashboard, History, Settings, Users, LogOut, 
  Search, Plus, Minus, Trash2, Edit2, Check, X, Truck, Store, Download, 
  AlertTriangle, ImagePlus, Save, TrendingUp, Cloud, Droplet
} from 'lucide-react';

const DEFAULT_PRICES = {
  shipping: 5,
  lowStockThreshold: 10
};

const TABS = [
  { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
  { id: 'pos', label: 'Vender', icon: ShoppingCart },
  { id: 'inventory', label: 'Inventario', icon: Package },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'history', label: 'Historial', icon: History },
  { id: 'settings', label: 'Ajustes', icon: Settings }
];

const getLocalDateString = (dateInput = new Date()) => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

const getProductVariants = (item) => {
  if (item.variants && Array.isArray(item.variants)) return item.variants;
  return [];
};

const getRecipeForVariant = (sizeName) => {
  const s = sizeName.toLowerCase();
  if (s.includes('30ml')) return { alcohol: 20, fijador: 1, esencia: 9 };
  if (s.includes('50ml')) return { alcohol: 35, fijador: 2, esencia: 13 };
  if (s.includes('100ml')) return { alcohol: 70, fijador: 4, esencia: 26 };
  return { alcohol: 0, fijador: 0, esencia: 0 };
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const [isRegisteringSale, setIsRegisteringSale] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('saas_users_db');
    return saved ? JSON.parse(saved) : [];
  });

  const [appLogo, setAppLogo] = useState("https://placehold.co/400x400/000000/FFC107?text=Tu+Logo");
  const [appName, setAppName] = useState("Tu Negocio Aquí");
  const [inventory, setInventory] = useState([]);
  const [prices, setPrices] = useState(DEFAULT_PRICES);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [globalMaterials, setGlobalMaterials] = useState({ alcohol: 0, fijador: 0 });

  useEffect(() => {
    localStorage.setItem('saas_users_db', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      const prefix = `saas_data_${currentUser}_`;
      localStorage.setItem(prefix + 'inventory', JSON.stringify(inventory));
      localStorage.setItem(prefix + 'sales', JSON.stringify(sales));
      localStorage.setItem(prefix + 'customers', JSON.stringify(customers));
      localStorage.setItem(prefix + 'prices', JSON.stringify(prices));
      localStorage.setItem(prefix + 'appName', appName);
      localStorage.setItem(prefix + 'appLogo', appLogo);
      localStorage.setItem(prefix + 'globalMaterials', JSON.stringify(globalMaterials));
    }
  }, [inventory, sales, customers, prices, appName, appLogo, globalMaterials, isLoggedIn, currentUser]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  const loadUserData = (userEmail, isNew = false) => {
    const prefix = `saas_data_${userEmail}_`;
    
    if (isNew) {
      const defaultInv = Array.from({length: 10}, (_, i) => ({
        id: `aroma_${i+1}`,
        name: `Producto de Prueba ${String(i+1).padStart(2, '0')}`,
        esencia: 1000,
        variants: [
          { name: '30ml', stock: 25, cost: 2, price: 6, recipe: { alcohol: 20, fijador: 1, esencia: 9 } },
          { name: '50ml', stock: 25, cost: 3.5, price: 10, recipe: { alcohol: 35, fijador: 2, esencia: 13 } },
          { name: '100ml', stock: 25, cost: 7.5, price: 20, recipe: { alcohol: 70, fijador: 4, esencia: 26 } }
        ]
      }));
      setInventory(defaultInv);
      setPrices(DEFAULT_PRICES);
      setAppName("Tu Negocio Aquí");
      setAppLogo("https://placehold.co/400x400/000000/FFC107?text=Tu+Logo");
      setSales([]);
      setCustomers([]);
      setGlobalMaterials({ alcohol: 5000, fijador: 500 });
    } else {
      const sInv = localStorage.getItem(prefix + 'inventory');
      setInventory(sInv ? JSON.parse(sInv) : []);
      const sSales = localStorage.getItem(prefix + 'sales');
      setSales(sSales ? JSON.parse(sSales) : []);
      const sCust = localStorage.getItem(prefix + 'customers');
      setCustomers(sCust ? JSON.parse(sCust) : []);
      const sPrices = localStorage.getItem(prefix + 'prices');
      setPrices(sPrices ? JSON.parse(sPrices) : DEFAULT_PRICES);
      const sName = localStorage.getItem(prefix + 'appName');
      setAppName(sName ? sName : "Tu Negocio Aquí");
      const sLogo = localStorage.getItem(prefix + 'appLogo');
      setAppLogo(sLogo ? sLogo : "https://placehold.co/400x400/000000/FFC107?text=Tu+Logo");
      const sMat = localStorage.getItem(prefix + 'globalMaterials');
      setGlobalMaterials(sMat ? JSON.parse(sMat) : { alcohol: 0, fijador: 0 });
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !password) return showError("Por favor ingresa correo y contraseña.");
    if (!emailRegex.test(email)) return showError("Formato de correo electrónico inválido.");
    
    if (isRegistering) {
      if (password.length < 6) return showError("La contraseña debe tener al menos 6 caracteres.");
      if (registeredUsers.find(u => u.email === email)) return showError("Ya existe una cuenta. Inicia sesión.");
      
      setRegisteredUsers([...registeredUsers, { email, password }]);
      loadUserData(email, true);
      setIsLoggedIn(true);
      setCurrentUser(email);
      showNotification("¡Cuenta creada! Bienvenido al sistema SaaS.");
    } else {
      const user = registeredUsers.find(u => u.email === email && u.password === password);
      if (user) {
        loadUserData(email, false);
        setIsLoggedIn(true);
        setCurrentUser(email);
        showNotification("Conectado exitosamente.");
      } else {
        showError("Credenciales incorrectas o cuenta no registrada.");
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setEmail('');
    setPassword('');
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!email || !newPassword) return showError("Ingresa tu correo y una nueva contraseña.");
    if (newPassword.length < 6) return showError("La contraseña debe tener al menos 6 caracteres.");

    const userIndex = registeredUsers.findIndex(u => u.email === email);
    if (userIndex > -1) {
      const newUsers = [...registeredUsers];
      newUsers[userIndex].password = newPassword;
      setRegisteredUsers(newUsers);
      showNotification("Contraseña actualizada con éxito. Inicia sesión.");
      setIsRecovering(false);
      setPassword('');
      setNewPassword('');
    } else {
      showError("El correo no coincide con ninguna cuenta registrada.");
    }
  };

  const [posCustomer, setPosCustomer] = useState({ id: null, name: '', whatsapp: '', address: '', origin: 'Local' });
  const [posCart, setPosCart] = useState([]);
  const [posCurrentItem, setPosCurrentItem] = useState({ aromaId: '', size: '', qty: 1, priceOverride: '' });
  const [posDiscount, setPosDiscount] = useState(0);
  const [posShipping, setPosShipping] = useState(prices.shipping);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [posProductSearch, setPosProductSearch] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

  const [dashStartDate, setDashStartDate] = useState(getLocalDateString());
  const [dashEndDate, setDashEndDate] = useState(getLocalDateString());
  const [dashOrigin, setDashOrigin] = useState('Todos');

  const [histStartDate, setHistStartDate] = useState(getLocalDateString());
  const [histEndDate, setHistEndDate] = useState(getLocalDateString());
  const [histOrigin, setHistOrigin] = useState('Todos');
  
  const [custOrigin, setCustOrigin] = useState('Todos');
  const [custDirSearch, setCustDirSearch] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', whatsapp: '', address: '', origin: 'Local' });
  const [editingCustomerId, setEditingCustomerId] = useState(null);

  const [invFilterLowStock, setInvFilterLowStock] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const openProductModal = (product = null) => {
    if (product) {
      const cloned = JSON.parse(JSON.stringify(product));
      cloned.variants = getProductVariants(cloned);
      setEditingProduct(cloned);
    } else {
      setEditingProduct({
        id: `prod_${Date.now()}`,
        name: '',
        esencia: 0,
        variants: [
          { name: 'Nueva Presentación', stock: 0, cost: 0, price: 0, recipe: { alcohol: 0, fijador: 0, esencia: 0 } }
        ]
      });
    }
    setShowProductModal(true);
  };

  const saveProductModal = () => {
    if (!editingProduct.name.trim()) return showError("El nombre es obligatorio");
    if (editingProduct.variants.length === 0) return showError("Debe tener al menos una presentación/característica");
    
    setInventory(prev => {
      const exists = prev.find(i => i.id === editingProduct.id);
      if (exists) return prev.map(i => i.id === editingProduct.id ? editingProduct : i);
      return [editingProduct, ...prev];
    });
    
    setShowProductModal(false);
    showNotification("Producto guardado exitosamente");
  };

  const updateInventoryStock = (id, variantName, change) => {
    setInventory(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newVars = [...item.variants];
      const vIndex = newVars.findIndex(v => v.name === variantName);
      if (vIndex > -1) newVars[vIndex].stock = Math.max(0, newVars[vIndex].stock + change);
      return { ...item, variants: newVars };
    }));
  };

  const handleDirectStockChange = (id, variantName, val) => {
    setInventory(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newVars = [...item.variants];
      const vIndex = newVars.findIndex(v => v.name === variantName);
      if (vIndex > -1) newVars[vIndex].stock = Math.max(0, val);
      return { ...item, variants: newVars };
    }));
  };

  const handleDeleteAroma = (id) => {
    setInventory(prev => prev.filter(i => i.id !== id));
    showNotification('Producto eliminado de forma segura');
  };

  const handleSaveInventory = () => {
    showNotification('Cambios en el inventario guardados');
  };

  const handleSaveCustomer = () => {
    if (!newCustomer.name || !newCustomer.whatsapp) return showError('Nombre y WhatsApp son obligatorios');
    if (editingCustomerId) {
      setCustomers(prev => prev.map(c => c.id === editingCustomerId ? { ...c, ...newCustomer } : c));
      showNotification('Cliente actualizado');
    } else {
      setCustomers(prev => [{ id: `cust_${Date.now()}`, ...newCustomer, totalSales: 0, totalSpent: 0 }, ...prev]);
      showNotification('Cliente agregado exitosamente');
    }
    setShowAddCustomer(false);
    setEditingCustomerId(null);
    setNewCustomer({ name: '', whatsapp: '', address: '', origin: 'Local' });
  };

  const handleDeleteCustomer = (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    showNotification('Cliente eliminado');
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchCustomer(val);
    setPosCustomer(prev => ({ ...prev, name: val, id: null }));
    setShowCustomerSuggestions(val.length > 1);
  };

  const selectCustomer = (c) => {
    setPosCustomer({ id: c.id, name: c.name, whatsapp: c.whatsapp, address: c.address, origin: c.origin || 'Local' });
    setSearchCustomer(c.name);
    setShowCustomerSuggestions(false);
  };

  const addToCart = () => {
    if (!posCurrentItem.aromaId) return showError("Selecciona un producto");
    if (posCurrentItem.qty < 1) return showError("Cantidad inválida");
    const aroma = inventory.find(i => i.id === posCurrentItem.aromaId);
    const variants = getProductVariants(aroma);
    const selectedVariant = variants.find(v => v.name === posCurrentItem.size) || variants[0];
    
    const itemPrice = selectedVariant ? selectedVariant.price : 0;
    const priceToUse = posCurrentItem.priceOverride !== '' ? parseFloat(posCurrentItem.priceOverride) : itemPrice;
    
    setPosCart(prev => [...prev, {
      id: `cart_${Date.now()}`, aromaId: aroma.id, aromaName: aroma.name,
      size: selectedVariant.name, qty: parseInt(posCurrentItem.qty), price: priceToUse
    }]);
    
    setPosCurrentItem({ aromaId: aroma.id, size: selectedVariant.name, qty: 1, priceOverride: '' });
    setPosProductSearch('');
  };

  const removeFromCart = (id) => setPosCart(prev => prev.filter(item => item.id !== id));

  const registerSale = () => {
    if (!posCustomer.name || !posCustomer.whatsapp) return showError("Datos del cliente incompletos");
    if (posCart.length === 0) return showError("Carrito vacío");
    if (isRegisteringSale) return;
    
    setIsRegisteringSale(true);

    const subtotal = posCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shippingCost = parseFloat(posShipping || 0);
    const total = subtotal + shippingCost - parseFloat(posDiscount || 0);

    const saleRecord = {
      id: `sale_${Date.now()}`, date: new Date().toISOString(),
      customerName: posCustomer.name, customerWhatsApp: posCustomer.whatsapp, customerAddress: posCustomer.address,
      saleType: posCustomer.origin, cart: posCart, subtotal, shipping: shippingCost, discount: parseFloat(posDiscount || 0), total
    };

    setSales(prev => [saleRecord, ...prev]);

    // Lógica para descontar Stock físico y Fórmulas
    let totalAlcoholDeduction = 0;
    let totalFijadorDeduction = 0;

    setInventory(prev => prev.map(invItem => {
      const cartItemsForThis = posCart.filter(c => c.aromaId === invItem.id);
      if (cartItemsForThis.length === 0) return invItem;
      
      const newVars = [...invItem.variants];
      let esenciaDeduction = 0;

      cartItemsForThis.forEach(cartItem => {
        const vIndex = newVars.findIndex(v => v.name === cartItem.size);
        if (vIndex > -1) {
          newVars[vIndex].stock = Math.max(0, newVars[vIndex].stock - cartItem.qty);
          const recipe = newVars[vIndex].recipe || getRecipeForVariant(cartItem.size);
          totalAlcoholDeduction += ((recipe.alcohol || 0) * cartItem.qty);
          totalFijadorDeduction += ((recipe.fijador || 0) * cartItem.qty);
          esenciaDeduction += ((recipe.esencia || 0) * cartItem.qty);
        }
      });
      return { ...invItem, variants: newVars, esencia: Math.max(0, (invItem.esencia || 0) - esenciaDeduction) };
    }));

    setGlobalMaterials(prev => ({
      alcohol: Math.max(0, prev.alcohol - totalAlcoholDeduction),
      fijador: Math.max(0, prev.fijador - totalFijadorDeduction)
    }));

    setCustomers(prev => {
      let existingCust = null;
      if (posCustomer.id) {
        existingCust = prev.find(c => c.id === posCustomer.id);
      } else {
        existingCust = prev.find(c => c.whatsapp && posCustomer.whatsapp && c.whatsapp === posCustomer.whatsapp);
      }

      if (existingCust) {
        return prev.map(c => c.id === existingCust.id ? {
          ...c, totalSales: (c.totalSales || 0) + 1, totalSpent: (c.totalSpent || 0) + total, origin: posCustomer.origin 
        } : c);
      } else {
        return [{
          id: `cust_${Date.now()}`, name: posCustomer.name, whatsapp: posCustomer.whatsapp, address: posCustomer.address,
          origin: posCustomer.origin, totalSales: 1, totalSpent: total
        }, ...prev];
      }
    });

    setPosCart([]);
    setPosCustomer({ id: null, name: '', whatsapp: '', address: '', origin: 'Local' });
    setPosDiscount(0);
    setSearchCustomer('');
    showNotification('¡Venta registrada con éxito!');
    setIsRegisteringSale(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAppLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = () => {
    showNotification('Configuración guardada exitosamente');
  };

  const dashStats = useMemo(() => {
    let totalStock = 0, totalCost = 0, expectedProfit = 0, lowStockCount = 0;

    inventory.forEach(item => {
      const vars = getProductVariants(item);
      vars.forEach(v => {
        const qty = v.stock || 0;
        const itemCost = v.cost || 0;
        const itemPrice = v.price || 0;
        totalStock += qty;
        totalCost += (qty * itemCost);
        expectedProfit += (qty * (itemPrice - itemCost));
        if (qty <= (prices.lowStockThreshold || 0)) lowStockCount++;
      });
    });

    const filteredSales = sales.filter(s => {
      const d = getLocalDateString(s.date);
      const matchDate = d >= dashStartDate && d <= dashEndDate;
      const matchOrigin = dashOrigin === 'Todos' || s.saleType === dashOrigin;
      return matchDate && matchOrigin;
    });

    const periodSales = filteredSales.reduce((sum, s) => sum + s.total, 0);
    const periodCount = filteredSales.length;

    let periodProfit = 0;
    filteredSales.forEach(s => {
      let cogs = 0; 
      s.cart.forEach(cartItem => {
        const invItem = inventory.find(i => i.id === cartItem.aromaId);
        if(invItem) {
           const vars = getProductVariants(invItem);
           const v = vars.find(variant => variant.name === cartItem.size);
           if(v) cogs += cartItem.qty * (v.cost || 0);
        }
      });
      const netRevenue = s.subtotal - s.discount; 
      periodProfit += (netRevenue - cogs);
    });

    return { totalStock, totalCost, expectedProfit, lowStockCount, periodSales, periodCount, periodProfit };
  }, [inventory, prices, sales, dashStartDate, dashEndDate, dashOrigin]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-400 text-black text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">SaaS Cloud Sim</div>
          <div className="flex flex-col items-center mb-8 mt-4">
            <div className="w-24 h-24 bg-gray-50 rounded-full mb-4 flex items-center justify-center border border-gray-200">
              <Cloud size={40} className="text-gray-400" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight text-center">Plataforma SaaS</h1>
            <p className="text-amber-500 font-bold text-sm mt-1 uppercase tracking-widest">Multi-Usuario</p>
          </div>
          
          {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium text-center mb-4">{errorMsg}</div>}

          {isRecovering ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-sm text-gray-600 text-center mb-4">Ingresa tu correo registrado para asignar una nueva contraseña.</div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50" placeholder="usuario@empresa.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nueva Contraseña</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50" placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full bg-black text-amber-400 font-bold p-3.5 rounded-xl hover:bg-gray-800 transition mt-4 flex justify-center items-center">
                Guardar nueva contraseña
              </button>
              <div className="text-center mt-5">
                <button type="button" onClick={() => setIsRecovering(false)} className="text-sm text-gray-500 hover:text-black font-semibold transition">
                  Volver al inicio de sesión
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50" placeholder="usuario@empresa.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50" placeholder="••••••••" />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => { setIsRecovering(true); setIsRegistering(false); }} className="text-xs text-gray-500 hover:text-black font-semibold transition">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <button type="submit" className="w-full bg-black text-amber-400 font-bold p-3.5 rounded-xl hover:bg-gray-800 transition mt-4 shadow-md flex justify-center items-center">
                {isRegistering ? 'Crear mi espacio seguro' : 'Ingresar al Sistema'}
              </button>
              <div className="text-center mt-5">
                <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-gray-500 hover:text-black font-semibold transition">
                  {isRegistering ? '¿Ya tienes una cuenta? Inicia sesión' : '¿Nuevo usuario? Crea tu cuenta SaaS aquí'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Panel de Control</h2>
        
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center gap-3">
          <button onClick={() => { const today = getLocalDateString(); setDashStartDate(today); setDashEndDate(today); }} className="bg-amber-100 text-amber-800 font-bold px-4 py-2 rounded-lg hover:bg-amber-200 text-sm">Hoy</button>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-2 bg-gray-50">
            <span className="text-xs font-bold text-gray-500">Desde:</span>
            <input type="date" value={dashStartDate} onChange={e => setDashStartDate(e.target.value)} className="p-0 outline-none text-sm bg-transparent w-full font-bold" />
          </div>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-2 bg-gray-50">
            <span className="text-xs font-bold text-gray-500">Hasta:</span>
            <input type="date" value={dashEndDate} onChange={e => setDashEndDate(e.target.value)} className="p-0 outline-none text-sm bg-transparent w-full font-bold" />
          </div>
          <select value={dashOrigin} onChange={e => setDashOrigin(e.target.value)} className="p-2 border border-gray-200 rounded-lg outline-none bg-white text-sm font-bold text-gray-700">
            <option value="Todos">Todos</option>
            <option value="Local">Local</option>
            <option value="Publicidad">Publicidad</option>
          </select>
        </div>
      </div>

      {dashStats.lowStockCount > 0 && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-3 shadow-sm">
          <AlertTriangle className="flex-shrink-0" />
          <div>
            <h4 className="font-bold">¡Alerta de Inventario!</h4>
            <p className="text-sm">Tienes {dashStats.lowStockCount} presentaciones de productos con stock bajo o agotado.</p>
          </div>
        </div>
      )}

      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest border-b pb-2">Rendimiento del Periodo Seleccionado</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black text-white p-6 rounded-xl shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><History size={64}/></div>
          <div className="text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Ventas Realizadas</div>
          <div className="text-4xl font-black text-amber-400">{dashStats.periodCount}</div>
        </div>
        <div className="bg-amber-400 text-black p-6 rounded-xl shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><ShoppingCart size={64}/></div>
          <div className="text-gray-800 text-xs font-bold mb-1 uppercase tracking-wider">Ingresos Brutos</div>
          <div className="text-4xl font-black">${dashStats.periodSales.toFixed(2)}</div>
        </div>
        <div className="bg-white text-gray-900 p-6 rounded-xl shadow-md border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp size={64}/></div>
          <div className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-wider">Ganancia Neta</div>
          <div className="text-4xl font-black text-green-600">${dashStats.periodProfit.toFixed(2)}</div>
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest border-b pb-2 pt-4">Estado Global del Inventario</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Unidades Totales</div><div className="text-3xl font-black text-gray-800">{dashStats.totalStock}</div></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Costo Invertido</div><div className="text-3xl font-black text-gray-800">${dashStats.totalCost.toFixed(2)}</div></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-amber-400"><div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Ganancia Proyectada</div><div className="text-3xl font-black text-amber-500">${dashStats.expectedProfit.toFixed(2)}</div></div>
      </div>
    </div>
  );

  const renderPOS = () => {
    const posSubtotal = posCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const posTotal = posSubtotal + parseFloat(posShipping || 0) - parseFloat(posDiscount || 0);
    const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(searchCustomer.toLowerCase()) || (c.whatsapp && c.whatsapp.includes(searchCustomer)));

    const selectedProduct = inventory.find(i => i.id === posCurrentItem.aromaId);
    const posVariants = selectedProduct ? getProductVariants(selectedProduct) : [];

    return (
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-black text-gray-900 mb-4 border-b border-gray-100 pb-3 flex items-center"><Users size={18} className="mr-2 text-gray-400"/> Datos del Cliente</h3>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Buscar o Crear Cliente</label>
                <div className="flex relative shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={16} className="text-gray-400"/></span>
                  <input type="text" value={searchCustomer} onChange={handleSearchChange} onFocus={() => {if(searchCustomer.length > 1) setShowCustomerSuggestions(true)}} className="w-full p-3 pl-10 border border-gray-300 rounded-lg outline-none bg-gray-50 focus:bg-white" placeholder="Nombre o teléfono..." />
                </div>
                {showCustomerSuggestions && searchCustomer.trim() && filteredCustomers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {filteredCustomers.map(c => (
                      <div key={c.id} onClick={() => selectCustomer(c)} className="p-3 hover:bg-amber-50 cursor-pointer border-b border-gray-100">
                        <div className="font-bold text-sm">{c.name}</div><div className="text-xs text-gray-500">{c.whatsapp} - {c.origin}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">WhatsApp</label><input type="text" value={posCustomer.whatsapp} onChange={e => setPosCustomer({...posCustomer, whatsapp: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg outline-none bg-gray-50 focus:bg-white" /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Dirección</label><textarea value={posCustomer.address} onChange={e => setPosCustomer({...posCustomer, address: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg outline-none resize-none h-20 bg-gray-50 focus:bg-white" /></div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Canal de Venta</label>
                <div className="flex gap-2">
                  <button onClick={() => setPosCustomer({...posCustomer, origin: 'Local'})} className={`flex-1 py-3 rounded-lg text-sm font-black flex justify-center items-center border ${posCustomer.origin === 'Local' ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-white border-gray-200'}`}><Store size={16} className="mr-1"/> Local</button>
                  <button onClick={() => setPosCustomer({...posCustomer, origin: 'Publicidad'})} className={`flex-1 py-3 rounded-lg text-sm font-black flex justify-center items-center border ${posCustomer.origin === 'Publicidad' ? 'bg-black border-black text-amber-400' : 'bg-white border-gray-200'}`}><Truck size={16} className="mr-1"/> Publicidad</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-black text-gray-900 mb-4 border-b border-gray-100 pb-3">Seleccionar Productos</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
              <div className="md:col-span-4 relative">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Buscar Producto</label>
                <div className="flex relative shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={14} className="text-gray-400"/></span>
                  <input type="text" value={posProductSearch} onChange={e => { setPosProductSearch(e.target.value); setShowProductSuggestions(e.target.value.length > 0); }} onFocus={() => {if(posProductSearch.length > 0) setShowProductSuggestions(true)}} className="w-full p-3 pl-9 border border-gray-300 rounded-lg outline-none bg-gray-50 focus:bg-white" placeholder="Escriba nombre..." />
                </div>
                {showProductSuggestions && posProductSearch.trim() && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {inventory.filter(i => i.name.toLowerCase().includes(posProductSearch.toLowerCase())).map(item => (
                      <div key={item.id} onClick={() => { 
                        const vars = getProductVariants(item);
                        setPosCurrentItem({ aromaId: item.id, size: vars.length > 0 ? vars[0].name : '', qty: 1, priceOverride: '' }); 
                        setPosProductSearch(item.name); 
                        setShowProductSuggestions(false); 
                      }} className="p-3 hover:bg-amber-50 cursor-pointer text-sm font-bold text-gray-800">{item.name}</div>
                    ))}
                  </div>
                )}
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Presentación</label>
                <select value={posCurrentItem.size} onChange={e => {
                  const v = posVariants.find(variant => variant.name === e.target.value);
                  setPosCurrentItem({...posCurrentItem, size: e.target.value, priceOverride: v ? v.price : ''});
                }} className="w-full p-3 border border-gray-300 rounded-lg outline-none bg-gray-50">
                  {posVariants.length === 0 && <option value="">---</option>}
                  {posVariants.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">P. Unit ($)</label>
                <input type="number" step="0.01" value={posCurrentItem.priceOverride} onChange={e => setPosCurrentItem({...posCurrentItem, priceOverride: e.target.value})} placeholder={posCurrentItem.aromaId && posVariants.find(v=>v.name===posCurrentItem.size) ? posVariants.find(v=>v.name===posCurrentItem.size).price.toFixed(2) : "0.00"} className="w-full p-3 border border-gray-300 rounded-lg outline-none bg-gray-50" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cant.</label>
                <input type="number" min="1" value={posCurrentItem.qty} onChange={e => setPosCurrentItem({...posCurrentItem, qty: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg text-center bg-gray-50" />
              </div>
              <div className="md:col-span-2 mt-6">
                <button onClick={addToCart} className="w-full bg-amber-400 text-black font-black p-3 rounded-lg hover:bg-amber-500 h-[46px]">Añadir</button>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col">
            <h3 className="font-black text-gray-900 mb-4 border-b border-gray-100 pb-3 flex items-center justify-between"><span className="flex items-center"><ShoppingCart size={18} className="mr-2 text-gray-400"/> Resumen del Pedido</span><span className="bg-black text-amber-400 px-3 py-1 rounded-full text-xs font-bold">{posCart.length} ÍTEMS</span></h3>
            <div className="flex-1 overflow-y-auto mb-4 border border-gray-100 rounded-lg min-h-[200px] bg-gray-50/50">
              {posCart.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0 hover:bg-white">
                  <div><div className="font-bold text-gray-800">{item.aromaName}</div><div className="text-xs font-bold text-gray-500 bg-gray-100 inline-block px-2 py-0.5 rounded mt-1">{item.size}</div></div>
                  <div className="font-black text-gray-700">{item.qty} x ${item.price.toFixed(2)}</div>
                  <div className="font-black text-lg text-gray-900">${(item.qty * item.price).toFixed(2)}</div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
            <div className="bg-white p-5 rounded-xl space-y-4 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center text-sm"><span className="font-bold text-gray-500">Subtotal:</span><span className="font-black">${posSubtotal.toFixed(2)}</span></div>
              <div className="flex justify-between items-center text-sm"><span className="font-bold text-gray-500 flex items-center"><Truck size={14} className="mr-1.5"/> Costo de Envío:</span><input type="number" step="0.01" value={posShipping} onChange={e => setPosShipping(e.target.value)} className="w-24 p-2 border border-gray-300 rounded-lg text-right font-black outline-none" /></div>
              <div className="flex justify-between items-center text-sm"><span className="font-bold text-gray-500">Descuento:</span><input type="number" step="0.01" value={posDiscount} onChange={e => setPosDiscount(e.target.value)} className="w-24 p-2 border border-gray-300 rounded-lg text-right font-black text-red-600 outline-none" /></div>
              <div className="border-t pt-4 flex justify-between items-center"><span className="text-lg font-black text-gray-800">TOTAL A COBRAR:</span><span className="text-3xl font-black text-amber-500">${posTotal.toFixed(2)}</span></div>
            </div>
            <button onClick={registerSale} disabled={isRegisteringSale} className={`w-full mt-5 font-black py-4 rounded-xl shadow-lg flex justify-center text-lg transition-all ${isRegisteringSale ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-amber-400 hover:bg-gray-900'}`}>
              {isRegisteringSale ? <span className="animate-pulse">Registrando...</span> : <><Check size={24} className="mr-2" /> Registrar Venta</>}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderInventory = () => {
    const downloadInventoryCSV = () => {
      let rows = [];
      inventory.forEach(item => {
         const vars = getProductVariants(item);
         vars.forEach(v => {
            rows.push(`"${item.name}","${item.esencia || 0}","${v.name}",${v.stock},${v.cost},${v.price},${v.recipe?.alcohol||0},${v.recipe?.fijador||0},${v.recipe?.esencia||0}`);
         });
      });
      const csvContent = "data:text/csv;charset=utf-8,Producto,Esencia Disponible(ml),Presentacion,Stock Físico,Costo,Precio,Usa Alcohol(ml),Usa Fijador(ml),Usa Esencia(ml)\n" + rows.join("\n");
      const link = document.createElement("a"); link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", "inventario_y_recetas.csv"); document.body.appendChild(link); link.click();
    };

    return (
      <div className="max-w-6xl mx-auto space-y-6 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Inventario y Formulación</h2>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center space-x-2 text-sm font-bold bg-white p-2.5 rounded-lg border cursor-pointer"><input type="checkbox" checked={invFilterLowStock} onChange={e => setInvFilterLowStock(e.target.checked)} className="rounded text-amber-500 w-4 h-4" /><span>Alerta de Stock</span></label>
            <button onClick={downloadInventoryCSV} className="bg-gray-800 text-white px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 text-sm"><Download size={16}/> Exportar Excel</button>
            <button onClick={() => openProductModal()} className="bg-amber-400 text-black px-4 py-2.5 rounded-lg font-black flex items-center gap-2 text-sm"><Plus size={16}/> Añadir Producto</button>
            <button onClick={handleSaveInventory} className="bg-black text-amber-400 px-4 py-2.5 rounded-lg font-black flex items-center gap-2 text-sm"><Save size={16}/> Guardar Cambios</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-6 mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-blue-100 p-3 rounded-full"><Droplet className="text-blue-600" size={24}/></div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Alcohol Global Disponible (ml)</label>
              <input type="number" value={globalMaterials.alcohol} onChange={e => setGlobalMaterials({...globalMaterials, alcohol: parseFloat(e.target.value)||0})} className="block w-full font-black text-xl outline-none bg-transparent border-b border-gray-200 focus:border-blue-500"/>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-purple-100 p-3 rounded-full"><Droplet className="text-purple-600" size={24}/></div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Fijador Global Disponible (ml)</label>
              <input type="number" value={globalMaterials.fijador} onChange={e => setGlobalMaterials({...globalMaterials, fijador: parseFloat(e.target.value)||0})} className="block w-full font-black text-xl outline-none bg-transparent border-b border-gray-200 focus:border-purple-500"/>
            </div>
          </div>
        </div>

        {showProductModal && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="p-5 border-b bg-gray-50 flex justify-between items-center"><h3 className="font-black text-lg">Configurar Producto y Receta</h3><button onClick={() => setShowProductModal(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20}/></button></div>
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold uppercase mb-2 text-gray-500">Nombre del Producto</label><input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} placeholder="Ej: Perfume 05, Crema..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-black text-gray-800 outline-none focus:ring-2 focus:ring-amber-400" /></div>
                  <div><label className="block text-xs font-bold uppercase mb-2 text-gray-500">Esencia Exclusiva Disponible (ml)</label><input type="number" value={editingProduct.esencia || 0} onChange={e => setEditingProduct({...editingProduct, esencia: parseFloat(e.target.value)||0})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-black text-amber-600 outline-none focus:ring-2 focus:ring-amber-400" /></div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><label className="block text-xs font-bold uppercase text-gray-500">Presentaciones y Formulación (Receta por unidad)</label><button onClick={() => setEditingProduct({...editingProduct, variants: [...editingProduct.variants, {name: 'Nueva', stock: 0, cost: 0, price: 0, recipe: {alcohol:0, fijador:0, esencia:0}}]})} className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100">+ Añadir Presentación</button></div>
                  {editingProduct.variants.map((v, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-end relative group shadow-sm">
                      <div className="md:col-span-3"><label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Nombre (Ej: 30ml)</label><input type="text" value={v.name} onChange={e => { const newVars = [...editingProduct.variants]; newVars[idx].name = e.target.value; if(!v.recipe) newVars[idx].recipe = getRecipeForVariant(e.target.value); setEditingProduct({...editingProduct, variants: newVars}); }} className="w-full p-2.5 bg-gray-50 border rounded-lg font-bold outline-none" /></div>
                      <div className="md:col-span-2"><label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Stock Físico</label><input type="number" value={v.stock} onChange={e => { const newVars = [...editingProduct.variants]; newVars[idx].stock = parseInt(e.target.value)||0; setEditingProduct({...editingProduct, variants: newVars}); }} className="w-full p-2.5 bg-gray-50 border rounded-lg font-black text-center outline-none" /></div>
                      <div className="md:col-span-2"><label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">P.V.P ($)</label><input type="number" step="0.01" value={v.price} onChange={e => { const newVars = [...editingProduct.variants]; newVars[idx].price = parseFloat(e.target.value)||0; setEditingProduct({...editingProduct, variants: newVars}); }} className="w-full p-2.5 bg-gray-50 border rounded-lg font-black text-amber-600 text-center outline-none" /></div>
                      <div className="md:col-span-5 bg-gray-50 p-2 rounded-lg border border-gray-200 grid grid-cols-3 gap-2">
                         <div className="col-span-3 text-[9px] font-black uppercase text-gray-400 text-center mb-1">Fórmula (Descuento automático)</div>
                         <div><label className="block text-[9px] font-bold uppercase text-gray-500 mb-1 text-center">Alcohol</label><input type="number" value={v.recipe?.alcohol||0} onChange={e => { const newVars = [...editingProduct.variants]; newVars[idx].recipe = {...newVars[idx].recipe, alcohol: parseFloat(e.target.value)||0}; setEditingProduct({...editingProduct, variants: newVars}); }} className="w-full p-1 border rounded text-center text-xs font-bold outline-none" title="ml de alcohol"/></div>
                         <div><label className="block text-[9px] font-bold uppercase text-gray-500 mb-1 text-center">Fijador</label><input type="number" value={v.recipe?.fijador||0} onChange={e => { const newVars = [...editingProduct.variants]; newVars[idx].recipe = {...newVars[idx].recipe, fijador: parseFloat(e.target.value)||0}; setEditingProduct({...editingProduct, variants: newVars}); }} className="w-full p-1 border rounded text-center text-xs font-bold outline-none" title="ml de fijador"/></div>
                         <div><label className="block text-[9px] font-bold uppercase text-gray-500 mb-1 text-center">Esencia</label><input type="number" value={v.recipe?.esencia||0} onChange={e => { const newVars = [...editingProduct.variants]; newVars[idx].recipe = {...newVars[idx].recipe, esencia: parseFloat(e.target.value)||0}; setEditingProduct({...editingProduct, variants: newVars}); }} className="w-full p-1 border rounded text-center text-xs font-bold outline-none text-amber-600" title="ml de esencia"/></div>
                      </div>
                      <button onClick={() => { const newVars = editingProduct.variants.filter((_, i) => i !== idx); setEditingProduct({...editingProduct, variants: newVars}); }} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full shadow-sm md:opacity-0 group-hover:opacity-100 transition"><X size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 border-t bg-gray-50 flex justify-end gap-3"><button onClick={saveProductModal} className="bg-black text-amber-400 px-8 py-3 rounded-xl font-black shadow-lg"><Save size={18} className="inline mr-2"/> Guardar Producto</button></div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b">
              <tr><th className="p-4 text-left font-bold uppercase text-xs w-1/4">Producto / Esencia Base</th><th className="p-4 text-left font-bold uppercase text-xs">Presentaciones / Stock (Clic para editar)</th><th className="p-4 text-center font-bold uppercase text-xs w-24">Acciones</th></tr>
            </thead>
            <tbody>
              {inventory.filter(item => {
                if(!invFilterLowStock) return true;
                const vars = getProductVariants(item);
                return vars.some(v => v.stock <= (prices.lowStockThreshold || 0));
              }).map(item => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4"><span className="font-black text-gray-800 block text-base">{item.name}</span><span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block">Esencia: {item.esencia || 0} ml</span></td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {getProductVariants(item).map((v, idx) => {
                        const isLow = v.stock <= (prices.lowStockThreshold || 0);
                        return (
                          <div key={idx} className={`flex items-center gap-1 border p-1 rounded-lg ${isLow ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 shadow-sm'}`} title={`Fórmula: ${v.recipe?.alcohol||0} A, ${v.recipe?.fijador||0} F, ${v.recipe?.esencia||0} E`}>
                            <span className="text-[11px] font-black w-16 truncate uppercase text-gray-500 pl-1">{v.name}:</span>
                            <button onClick={() => updateInventoryStock(item.id, v.name, -1)} className="p-1.5 bg-gray-100 rounded hover:bg-gray-200 text-gray-600"><Minus size={12}/></button>
                            <input type="number" value={v.stock} onChange={(e) => handleDirectStockChange(item.id, v.name, parseInt(e.target.value)||0)} className={`w-12 text-center text-sm font-black bg-transparent outline-none ${isLow ? 'text-red-600' : 'text-gray-900'}`} />
                            <button onClick={() => updateInventoryStock(item.id, v.name, 1)} className="p-1.5 bg-gray-100 rounded hover:bg-gray-200 text-gray-600"><Plus size={12}/></button>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button onClick={() => openProductModal(item)} className="p-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-400 hover:text-black transition" title="Editar configuraciones y receta"><Edit2 size={16}/></button>
                      <button onClick={() => handleDeleteAroma(item.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {inventory.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-gray-400 font-bold">Inventario vacío. Añade tu primer producto.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCustomers = () => {
    const downloadCustomersCSV = () => {
      const rows = customers.map(c => `"${c.name}","${c.whatsapp}","${c.address || ''}","${c.origin}",${c.totalSales || 0},${c.totalSpent || 0}`);
      const csvContent = "data:text/csv;charset=utf-8,Nombre,WhatsApp,Direccion,Canal Preferido,Total Pedidos,Total Comprado\n" + rows.join("\n");
      const link = document.createElement("a"); link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", "directorio_clientes.csv"); document.body.appendChild(link); link.click();
    };

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-black tracking-tight">Directorio de Clientes</h2>
          <div className="flex gap-2">
            <button onClick={downloadCustomersCSV} className="bg-gray-800 text-white font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm"><Download size={16}/> Exportar Excel</button>
            <button onClick={() => {setShowAddCustomer(!showAddCustomer); setEditingCustomerId(null); setNewCustomer({name:'', whatsapp:'', address:'', origin:'Local'})}} className="bg-amber-400 font-black px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm"><Plus size={16}/> Añadir Cliente</button>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative"><span className="absolute inset-y-0 left-0 pl-3 flex items-center"><Search size={16} className="text-gray-400"/></span><input type="text" value={custDirSearch} onChange={e => setCustDirSearch(e.target.value)} placeholder="Buscar por nombre o teléfono..." className="w-full p-2.5 pl-10 border border-gray-200 rounded-lg bg-gray-50 outline-none font-bold text-sm" /></div>
          <select value={custOrigin} onChange={e => setCustOrigin(e.target.value)} className="p-2.5 border border-gray-200 rounded-lg bg-gray-50 font-bold text-sm outline-none"><option value="Todos">Todos los Canales</option><option value="Local">Local</option><option value="Publicidad">Publicidad</option></select>
        </div>
        
        {showAddCustomer && (
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6 shadow-inner">
            <h3 className="font-black mb-5 border-b pb-3 text-gray-800">{editingCustomerId ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
              <div><label className="block text-xs font-bold uppercase mb-1 text-gray-500">Nombre Completo</label><input type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full p-3 border rounded-lg bg-white outline-none" /></div>
              <div><label className="block text-xs font-bold uppercase mb-1 text-gray-500">WhatsApp</label><input type="text" value={newCustomer.whatsapp} onChange={e => setNewCustomer({...newCustomer, whatsapp: e.target.value})} className="w-full p-3 border rounded-lg bg-white outline-none" /></div>
              <div><label className="block text-xs font-bold uppercase mb-1 text-gray-500">Canal Principal</label><select value={newCustomer.origin} onChange={e => setNewCustomer({...newCustomer, origin: e.target.value})} className="w-full p-3 border rounded-lg bg-white outline-none font-bold"><option value="Local">Local</option><option value="Publicidad">Publicidad</option></select></div>
              <div className="md:col-span-3"><label className="block text-xs font-bold uppercase mb-1 text-gray-500">Dirección Completa</label><input type="text" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} className="w-full p-3 border rounded-lg bg-white outline-none" /></div>
              <div><button onClick={handleSaveCustomer} className="w-full bg-black text-amber-400 font-black p-3 rounded-lg shadow-md hover:bg-gray-900 h-[46px]">Guardar Cliente</button></div>
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr><th className="p-4 text-left font-bold uppercase text-gray-500 text-xs">Cliente</th><th className="p-4 text-left font-bold uppercase text-gray-500 text-xs">Contacto</th><th className="p-4 text-center font-bold uppercase text-gray-500 text-xs">Canal</th><th className="p-4 text-center font-bold uppercase text-gray-500 text-xs">Compras</th><th className="p-4 text-center font-bold uppercase text-gray-500 text-xs">Acciones</th></tr></thead>
            <tbody>
              {customers.filter(c => (custOrigin === 'Todos' || c.origin === custOrigin) && (c.name.toLowerCase().includes(custDirSearch.toLowerCase()) || c.whatsapp.includes(custDirSearch))).map(c => (
                <tr key={c.id} className="border-b hover:bg-gray-50/50">
                  <td className="p-4 font-black text-gray-800 text-base">{c.name}</td>
                  <td className="p-4"><div className="font-bold text-gray-700">{c.whatsapp}</div><div className="text-xs text-gray-400 mt-1">{c.address}</div></td>
                  <td className="p-4 text-center"><span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${c.origin==='Publicidad' ? 'bg-black text-amber-400' : 'bg-gray-200 text-gray-700'}`}>{c.origin}</span></td>
                  <td className="p-4 text-center"><div className="font-black text-amber-600 text-lg">${(c.totalSpent||0).toFixed(2)}</div></td>
                  <td className="p-4 text-center"><button onClick={() => {setNewCustomer(c); setEditingCustomerId(c.id); setShowAddCustomer(true);}} className="p-2 bg-amber-50 text-amber-600 rounded-lg mr-2 hover:bg-amber-400 hover:text-black transition"><Edit2 size={16}/></button><button onClick={() => handleDeleteCustomer(c.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"><Trash2 size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    const downloadHistoryCSV = () => {
      const rows = sales.filter(s => getLocalDateString(s.date) >= histStartDate && getLocalDateString(s.date) <= histEndDate && (histOrigin === 'Todos' || s.saleType === histOrigin)).map(s => {
         const date = new Date(s.date).toLocaleString([], {dateStyle:'short', timeStyle:'short'});
         const cartDetails = s.cart.map(i => `${i.qty}x ${i.aromaName} (${i.size})`).join(" | ");
         return `"${date}","${s.customerName}","${s.customerWhatsApp}","${s.saleType}","${cartDetails}",${s.subtotal},${s.shipping},${s.discount},${s.total}`;
      });
      const csvContent = "data:text/csv;charset=utf-8,Fecha,Cliente,WhatsApp,Canal,Pedido,Subtotal,Envio,Descuento,Total\n" + rows.join("\n");
      const link = document.createElement("a"); link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", `ventas_${histStartDate}_al_${histEndDate}.csv`); document.body.appendChild(link); link.click();
    };

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-black tracking-tight">Historial de Ventas</h2>
          <button onClick={downloadHistoryCSV} className="bg-gray-800 text-white font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm"><Download size={16}/> Exportar Excel</button>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center gap-3">
          <button onClick={() => { const today = getLocalDateString(); setHistStartDate(today); setHistEndDate(today); }} className="bg-amber-100 text-amber-800 font-bold px-4 py-2.5 rounded-lg text-sm">Hoy</button>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-2 bg-gray-50 flex-1"><span className="text-xs font-bold text-gray-500 pl-1">Desde:</span><input type="date" value={histStartDate} onChange={e => setHistStartDate(e.target.value)} className="bg-transparent font-bold outline-none text-sm w-full" /></div>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-2 bg-gray-50 flex-1"><span className="text-xs font-bold text-gray-500 pl-1">Hasta:</span><input type="date" value={histEndDate} onChange={e => setHistEndDate(e.target.value)} className="bg-transparent font-bold outline-none text-sm w-full" /></div>
          <select value={histOrigin} onChange={e => setHistOrigin(e.target.value)} className="p-2.5 border border-gray-200 rounded-lg bg-gray-50 font-bold text-sm outline-none flex-1"><option value="Todos">Todos</option><option value="Local">Local</option><option value="Publicidad">Publicidad</option></select>
        </div>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr><th className="p-4 text-left font-bold uppercase text-xs text-gray-500">Fecha</th><th className="p-4 text-left font-bold uppercase text-xs text-gray-500">Cliente</th><th className="p-4 text-center font-bold uppercase text-xs text-gray-500">Canal</th><th className="p-4 text-left font-bold uppercase text-xs text-gray-500">Detalle del Pedido</th><th className="p-4 text-right font-bold uppercase text-xs text-gray-500">Cobro Total</th></tr></thead>
            <tbody>
              {sales.filter(s => getLocalDateString(s.date) >= histStartDate && getLocalDateString(s.date) <= histEndDate && (histOrigin === 'Todos' || s.saleType === histOrigin)).map(sale => (
                <tr key={sale.id} className="border-b hover:bg-gray-50/50">
                  <td className="p-4 text-gray-500 font-bold text-xs whitespace-nowrap">{new Date(sale.date).toLocaleString([], {dateStyle:'short', timeStyle:'short'})}</td>
                  <td className="p-4"><div className="font-black text-gray-800 text-sm">{sale.customerName}</div><div className="text-xs text-gray-400 mt-1">{sale.customerWhatsApp}</div></td>
                  <td className="p-4 text-center"><span className={`text-[9px] font-black px-2 py-1 rounded uppercase ${sale.saleType==='Publicidad' ? 'bg-black text-amber-400' : 'bg-gray-200 text-gray-700'}`}>{sale.saleType}</span></td>
                  <td className="p-4 text-xs"><ul className="space-y-1.5">{sale.cart.map((i, idx) => <li key={idx}><span className="font-black bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{i.qty}x</span> <span className="font-semibold text-gray-800">{i.aromaName}</span> <span className="text-gray-500">({i.size})</span></li>)}</ul></td>
                  <td className="p-4 text-right"><div className="font-black text-amber-600 text-lg">${sale.total.toFixed(2)}</div></td>
                </tr>
              ))}
              {sales.filter(s => getLocalDateString(s.date) >= histStartDate && getLocalDateString(s.date) <= histEndDate && (histOrigin === 'Todos' || s.saleType === histOrigin)).length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-400 font-bold">No hay ventas registradas en este periodo.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <h2 className="text-2xl font-black text-gray-900 tracking-tight">Configuración del Sistema</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-black mb-5 pb-3 border-b flex items-center text-gray-800"><ImagePlus className="mr-2 text-amber-500"/> Personalización de Marca</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div><label className="block text-xs font-bold uppercase mb-2 text-gray-500">Nombre del Negocio</label><input type="text" value={appName} onChange={e => setAppName(e.target.value)} className="w-full p-3.5 bg-gray-50 border rounded-lg font-black outline-none focus:ring-2 focus:ring-amber-400" /></div>
          <div className="flex items-center gap-5">
            <img src={appLogo} alt="Logo" className="w-24 h-24 rounded-2xl shadow-md border-2 p-1 bg-white object-cover" />
            <div className="flex-1"><label className="block text-xs font-bold uppercase mb-2 text-gray-500">Subir Logo</label><input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-xs font-black uppercase text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" /></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"><h3 className="font-black mb-4 pb-3 border-b flex items-center text-gray-800"><Truck className="mr-2 text-amber-500"/> Logística Base</h3><div><label className="block text-xs font-bold uppercase mb-2 text-gray-500">Costo de Envío Global ($)</label><p className="text-[11px] text-gray-400 mb-3 font-medium">Se aplicará por defecto en tus ventas.</p><input type="number" step="0.01" value={prices.shipping} onChange={e => setPrices({...prices, shipping: parseFloat(e.target.value)||0})} className="w-full p-3.5 bg-gray-50 border rounded-lg font-black outline-none focus:ring-2 focus:ring-amber-400" /></div></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"><h3 className="font-black mb-4 pb-3 border-b flex items-center text-gray-800"><AlertTriangle className="mr-2 text-amber-500"/> Alertas</h3><div><label className="block text-xs font-bold uppercase mb-2 text-gray-500">Límite de Stock Bajo</label><p className="text-[11px] text-gray-400 mb-3 font-medium">Recibirás un aviso si algún producto llega a este límite.</p><input type="number" value={prices.lowStockThreshold} onChange={e => setPrices({...prices, lowStockThreshold: parseInt(e.target.value)||0})} className="w-full p-3.5 bg-gray-50 border rounded-lg font-black text-red-600 outline-none focus:ring-2 focus:ring-amber-400" /></div></div>
      </div>
      <div className="flex justify-end pt-4"><button onClick={handleSaveSettings} className="bg-black text-amber-400 px-8 py-4 rounded-xl font-black shadow-lg text-lg hover:bg-gray-900 transition"><Save className="inline mr-2"/> Confirmar Configuración</button></div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden selection:bg-amber-400 selection:text-black">
      {notification && <div className="fixed top-4 right-4 bg-black text-amber-400 px-6 py-4 rounded-xl shadow-2xl z-[70] flex items-center gap-3 font-bold"><Check size={20}/> {notification}</div>}
      {errorMsg && <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl z-[70] flex items-center gap-3 font-bold"><AlertTriangle size={20} /> {errorMsg}</div>}

      <aside className="w-72 bg-white border-r border-gray-200 hidden md:flex flex-col z-10">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50"><img src={appLogo} alt="Logo" className="w-12 h-12 rounded-xl border bg-white p-0.5 object-cover" /><div className="flex-1 min-w-0"><h1 className="font-black text-lg truncate">{appName}</h1><span className="text-[10px] uppercase font-black text-amber-500 block">SaaS Dashboard</span></div></div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">{TABS.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-black transition-all ${activeTab === tab.id ? 'bg-black text-amber-400 shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}><tab.icon size={20} className={`mr-3 ${activeTab === tab.id ? 'text-amber-400' : 'text-gray-400'}`} />{tab.label}</button>))}</nav>
        <div className="p-5 border-t bg-gray-50"><button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-3.5 rounded-xl text-sm font-black text-gray-600 bg-white border hover:bg-red-50 hover:text-red-600 transition"><LogOut size={18} className="mr-2" /> Cerrar Sesión</button></div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative bg-gray-50">
        <header className="bg-white border-b p-4 md:hidden flex justify-between items-center z-10"><div className="flex items-center gap-3"><img src={appLogo} alt="Logo" className="w-9 h-9 rounded-lg border p-0.5 object-cover" /><h1 className="font-black truncate">{appName}</h1></div><button onClick={handleLogout} className="text-gray-400"><LogOut size={22}/></button></header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'pos' && renderPOS()}
          {activeTab === 'inventory' && renderInventory()}
          {activeTab === 'customers' && renderCustomers()}
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-between px-1 pt-2 pb-8 z-[100] shadow-[0_-4px_15px_rgba(0,0,0,0.08)]">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex flex-col items-center justify-center p-1 rounded-lg transition-colors ${activeTab === tab.id ? 'text-black' : 'text-gray-400'}`}>
            <tab.icon size={22} className={`mb-1 ${activeTab === tab.id ? 'text-amber-500' : ''}`} />
            <span className={`text-[8px] sm:text-[9px] uppercase tracking-wider truncate w-full text-center ${activeTab === tab.id ? 'font-black' : 'font-bold'}`}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
