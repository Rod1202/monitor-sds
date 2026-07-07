import { useState } from 'react';
import { Container, Box } from '@mui/material';
import Header from './components/layout/Header';
import EstatusView from './views/EstatusView';
import AlertasView from './views/AlertasView';
import LoginView from './views/LoginView';
import CustomerSummaryDialog from './components/dialogs/CustomerSummaryDialog';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [searchKey, setSearchKey] = useState(0);

  if (!authenticated) {
    return <LoginView onAuthenticated={() => setAuthenticated(true)} />;
  }

  function handleCustomerSelect(id: number, name: string) {
    setCustomerId(id);
    setCustomerName(name);
    setSummaryOpen(true);
  }

  function handleCloseSummary() {
    setSummaryOpen(false);
    setCustomerId(null);
    setCustomerName('');
    setSearchKey(k => k + 1);
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header
        tabValue={tabValue}
        onTabChange={(_event, newValue) => setTabValue(newValue)}
        onCustomerSelect={handleCustomerSelect}
        searchKey={searchKey}
      />
      <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, md: 3 } }}>
        {tabValue === 0 ? <EstatusView /> : <AlertasView />}
      </Container>
      <CustomerSummaryDialog
        open={summaryOpen}
        onClose={handleCloseSummary}
        customerId={customerId}
        customerName={customerName}
      />
    </Box>
  );
}

export default App;
