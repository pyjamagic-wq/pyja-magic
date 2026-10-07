export interface CreateParcelInput {
  orderNumber: string;
  customerFirstName: string;
  customerLastName: string;
  phone: string;
  wilayaName: string;
  wilayaCode: string;
  commune: string;
  address: string;
  deliveryType: 'domicile' | 'stopdesk';
  totalToCollect: number; // Montant COD en DA
  declaredValue?: number;
  productDescription: string;
  orderWeightKg?: number;
}

export interface ParcelResult {
  success: boolean;
  trackingNumber: string;
  labelUrl?: string;
  courierStatus: string;
  message?: string;
}

export interface TrackingInfo {
  trackingNumber: string;
  status: string;
  lastUpdate: string;
  location?: string;
  history: Array<{
    status: string;
    description: string;
    timestamp: string;
  }>;
}

export interface DeliveryProvider {
  name: string;
  createParcel(data: CreateParcelInput): Promise<ParcelResult>;
  trackParcel(trackingNumber: string): Promise<TrackingInfo | null>;
  cancelParcel(trackingNumber: string): Promise<boolean>;
  syncOrderStatus(trackingNumber: string): Promise<{ pyjaMagicStatus: string; rawStatus: string } | null>;
}
