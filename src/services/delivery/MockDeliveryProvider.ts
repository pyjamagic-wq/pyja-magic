import { DeliveryProvider, CreateParcelInput, ParcelResult, TrackingInfo } from './DeliveryProvider';

export class MockDeliveryProvider implements DeliveryProvider {
  name = 'Simulateur Yalidine Express (Mode Test)';

  async createParcel(data: CreateParcelInput): Promise<ParcelResult> {
    // Generate realistic Algerian tracking number
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const trackingNumber = `yal-dz-${randomDigits}`;

    return {
      success: true,
      trackingNumber,
      labelUrl: `https://yalidine.app/print/slip/${trackingNumber}`,
      courierStatus: 'Bordereau créé — En attente de ramassage',
      message: `Bordereau Yalidine généré avec succès pour ${data.customerFirstName} ${data.customerLastName} (${data.wilayaName}).`,
    };
  }

  async trackParcel(trackingNumber: string): Promise<TrackingInfo | null> {
    const now = new Date();
    return {
      trackingNumber,
      status: 'En cours de distribution',
      lastUpdate: now.toISOString(),
      location: 'Hub Principal Yalidine — Alger & Régions',
      history: [
        {
          status: 'Pris en charge',
          description: 'Colis réceptionné au centre logistique',
          timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
        },
        {
          status: 'Expédié vers Wilaya',
          description: 'En transit inter-wilayas',
          timestamp: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
        },
        {
          status: 'En livraison',
          description: 'Affecté au livreur du secteur',
          timestamp: now.toISOString(),
        },
      ],
    };
  }

  async cancelParcel(_trackingNumber: string): Promise<boolean> {
    return true;
  }

  async syncOrderStatus(_trackingNumber: string): Promise<{ pyjaMagicStatus: string; rawStatus: string } | null> {
    return {
      pyjaMagicStatus: 'en_livraison',
      rawStatus: 'En cours de livraison au client',
    };
  }
}
