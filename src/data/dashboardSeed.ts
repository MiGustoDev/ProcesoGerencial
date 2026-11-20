export interface DashboardSupervisor {
  id: string;
  name: string;
  rol: string;
}

export interface DashboardTienda {
  id: string;
  name: string;
  sup: string;
  tags: string[];
}

export interface DashboardThresholds {
  critica: number;
  ok: number;
}

export interface DashboardSeedData {
  exportado: string;
  umbrales: DashboardThresholds;
  config: {
    supervisoras: DashboardSupervisor[];
    tiendas: DashboardTienda[];
  };
  auditorias?: any[];
}

export const DASHBOARD_SEED: DashboardSeedData = {
  exportado: "",
  umbrales: { critica: 70, ok: 85 },
  config: {
    supervisoras: [
      { id: "g-vicentelopez", name: "Gerencia Vicente López", rol: "Gerente Experience" },
      { id: "g-canitas", name: "Gerencia Cañitas", rol: "Gerente Experience" },
      { id: "g-villacrespo", name: "Gerencia Villa Crespo", rol: "Gerente Experience" }
    ],
    tiendas: [
      { id: "t-vicente-lopez", name: "Vicente López", sup: "g-vicentelopez", tags: ["Propia", "Experience"] },
      { id: "t-canitas", name: "Cañitas", sup: "g-canitas", tags: ["Propia", "Experience"] },
      { id: "t-villa-crespo", name: "Villa Crespo", sup: "g-villacrespo", tags: ["Propia", "Experience"] }
    ]
  }
};
