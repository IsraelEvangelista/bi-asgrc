import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock all the hooks first
jest.mock('../hooks/useActionsMinimal', () => ({
  useActionsMinimal: () => ({
    actions: [],
    loading: false,
    error: null,
    refetch: jest.fn()
  })
}));

jest.mock('../hooks/useAreasExecutoras', () => ({
  useAreasExecutoras: () => ({
    areas: [],
    loading: false,
    error: null
  })
}));

jest.mock('../hooks/useRiskBarChart', () => ({
  useRiskBarChart: () => ({
    data: [],
    loading: false,
    error: null
  })
}));

jest.mock('../hooks/useRiskActionsData', () => ({
  useRiskActionsData: () => ({
    data: [],
    loading: false,
    error: null
  })
}));

jest.mock('../hooks/useActionsChartData', () => ({
  useActionsChartData: () => ({
    statusData: [],
    prazoData: [],
    statusCardsData: [],
    loading: false,
    error: null
  })
}));

jest.mock('../hooks/useAlerts', () => ({
  useOverdueActionAlerts: () => ({
    alerts: [],
    loading: false,
    error: null
  })
}));

// Mock the supabase client
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    })),
    auth: {
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

// Mock all components
jest.mock('../components/Layout', () => {
  return function MockLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="layout">{children}</div>;
  };
});

jest.mock('../components/AlertBanner', () => {
  return function MockAlertBanner() {
    return <div data-testid="alert-banner">Alert Banner</div>;
  };
});

jest.mock('../components/StatusCards', () => {
  return function MockStatusCards() {
    return <div data-testid="status-cards">Status Cards</div>;
  };
});

jest.mock('../components/HorizontalBarChart', () => {
  return function MockHorizontalBarChart() {
    return <div data-testid="horizontal-bar-chart">Bar Chart</div>;
  };
});

jest.mock('../components/DonutChart', () => {
  return function MockDonutChart() {
    return <div data-testid="donut-chart">Donut Chart</div>;
  };
});

jest.mock('../components/ActionTable', () => {
  return function MockActionTable() {
    return <div data-testid="action-table">Action Table</div>;
  };
});

jest.mock('../components/ActionFilters', () => {
  return function MockActionFilters() {
    return <div data-testid="action-filters">Action Filters</div>;
  };
});

jest.mock('../components/ActionModal', () => {
  return function MockActionModal() {
    return <div data-testid="action-modal">Action Modal</div>;
  };
});

jest.mock('../components/ActionStats', () => {
  return function MockActionStats() {
    return <div data-testid="action-stats">Action Stats</div>;
  };
});

// Now import the component
import Actions from '../pages/Actions';

describe('Actions Component Simple Test', () => {
  it('should render without crashing', () => {
    render(
      <BrowserRouter>
        <Actions />
      </BrowserRouter>
    );
  });
});