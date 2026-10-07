import { DeliveryProvider, CreateParcelInput, ParcelResult, TrackingInfo } from './DeliveryProvider';

/**
 * Yalidine Express Official API Provider for Algeria
 * Documentation: https://yalidine.app/developer/docs
 *
 * Headers required by Yalidine:
 * X-API-ID: <Your Yalidine ID>
 * X-API-TOKEN: <Your Yalidine Token>
 */
export class YalidineProvider implements DeliveryProvider {
  name = 'Yalidine Express';
  private apiUrl: string;
  private apiId: string;
  private apiToken: string;

  constructor(apiId?: string, apiToken?: string, apiUrl = 'https://api.yalidine.app/v1') {
    this.apiId = apiId || (typeof process !== 'undefined' ? process.env?.VITE_YALIDINE_API_ID || '' : '');
    this.apiToken = apiToken || (typeof process !== 'undefined' ? process.env?.VITE_YALIDINE_API_TOKEN || '' : '');
    this.apiUrl = apiUrl;
  }

  isConfigured(): boolean {
    return Boolean(this.apiId && this.apiToken);
  }

  async createParcel(data: CreateParcelInput): Promise<ParcelResult> {
    if (!this.isConfigured()) {
      throw new Error("Identifiants API Yalidine non configurés dans l'administration.");
    }

    const payload = {
      order_id: data.orderNumber,
      firstname: data.customerFirstName,
      familyname: data.customerLastName,
      contact_phone: data.phone,
      address: data.address,
      to_commune_name: data.commune,
      to_wilaya_name: data.wilayaName,
      product_list: data.productDescription,
      price: data.totalToCollect,
      freeshipping: false,
      is_stopdesk: data.deliveryType === 'stopdesk',
      has_exchange: false,
    };

    try {
      const response = await fetch(`${this.apiUrl}/parcels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-ID': this.apiId,
          'X-API-TOKEN': this.apiToken,
        },
        body: JSON.stringify([payload]),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur Yalidine (${response.status}): ${errorText}`);
      }

      const resJson = await response.json();
      const parcelData = resJson[data.orderNumber] || resJson[0] || resJson;

      return {
        success: true,
        trackingNumber: parcelData.tracking || parcelData.tracking_code || `yal-${data.orderNumber}`,
        labelUrl: parcelData.label || undefined,
        courierStatus: 'En attente de prise en charge',
        message: 'Colis créé avec succès chez Yalidine.',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue Yalidine';
      console.error('[Yalidine API Error]', msg);
      throw err;
    }
  }

  async trackParcel(trackingNumber: string): Promise<TrackingInfo | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const response = await fetch(`${this.apiUrl}/parcels/${trackingNumber}`, {
        headers: {
          'X-API-ID': this.apiId,
          'X-API-TOKEN': this.apiToken,
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      return {
        trackingNumber,
        status: data.last_status || 'En acheminement',
        lastUpdate: data.updated_at || new Date().toISOString(),
        location: data.current_center_name || 'Centre de tri Yalidine',
        history: Array.isArray(data.histories)
          ? data.histories.map((h: { status: string; reason?: string; date: string }) => ({
              status: h.status,
              description: h.reason || h.status,
              timestamp: h.date,
            }))
          : [],
      };
    } catch (err) {
      console.warn('[Yalidine Track Error]', err);
      return null;
    }
  }

  async cancelParcel(trackingNumber: string): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const response = await fetch(`${this.apiUrl}/parcels/${trackingNumber}`, {
        method: 'DELETE',
        headers: {
          'X-API-ID': this.apiId,
          'X-API-TOKEN': this.apiToken,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async syncOrderStatus(trackingNumber: string): Promise<{ pyjaMagicStatus: string; rawStatus: string } | null> {
    const track = await this.trackParcel(trackingNumber);
    if (!track) return null;

    const raw = (track.status || '').toLowerCase();
    let pyjaMagicStatus = 'expediee';

    if (raw.includes('créé') || raw.includes('reçu au centre')) {
      pyjaMagicStatus = 'preparation';
    } else if (raw.includes('en livraison') || raw.includes('tournée') || raw.includes('livreur')) {
      pyjaMagicStatus = 'en_livraison';
    } else if (raw.includes('livré') || raw.includes('livre')) {
      pyjaMagicStatus = 'livree';
    } else if (raw.includes('refus') || raw.includes('échoué') || raw.includes('annul')) {
      pyjaMagicStatus = 'refusee';
    } else if (raw.includes('retour')) {
      pyjaMagicStatus = 'retour';
    }

    return {
      pyjaMagicStatus,
      rawStatus: track.status,
    };
  }
}
