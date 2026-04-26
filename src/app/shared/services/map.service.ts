import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

type GoogleMapInstance = unknown;

interface GoogleMarkerLike {
  addListener(eventName: string, handler: () => void): void;
}

interface GoogleInfoWindowLike {
  open(map: unknown, anchor?: unknown): void;
}

interface GoogleMapsNamespace {
  Map: new (
    element: HTMLElement,
    options: Record<string, unknown>,
  ) => GoogleMapInstance;
  Marker: new (options: Record<string, unknown>) => GoogleMarkerLike;
  InfoWindow: new (options: { content: string }) => GoogleInfoWindowLike;
  Animation: {
    DROP: unknown;
  };
}

// إعلان نوع للكائن window ليسمح بالوصول الديناميكي
declare global {
  interface Window {
    google?: {
      maps?: GoogleMapsNamespace;
    };
    initGoogleMap?: () => void;
  }
}

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private apiLoaded = new BehaviorSubject<boolean>(false);
  private apiKey = environment.apiKeys.googleMaps; // الحصول على مفتاح API من ملف البيئة

  /**
   * تحميل Google Maps API إن لم تكن محملة بالفعل
   * @returns Observable<boolean> تشير إلى جاهزية Google Maps API
   */
  loadGoogleMapsApi(): Observable<boolean> {
    // إذا كانت API محملة بالفعل، أعد قيمة حالية بـ true
    if (window.google?.maps) {
      console.log('[MapService] Google Maps API already loaded');
      this.apiLoaded.next(true);
      return this.apiLoaded.asObservable();
    }

    // إذا كان هناك script موجود بالفعل، انتظر حتى يتم تحميله
    if (document.getElementById('google-maps-api')) {
      console.log(
        '[MapService] Google Maps API script already exists in DOM, waiting for it to load',
      );
      return this.apiLoaded.asObservable();
    }

    console.log(
      '[MapService] Loading Google Maps API with key: ' +
        this.getMaskedApiKey(),
    );

    // أضف script Google Maps API
    const script = document.createElement('script');
    script.id = 'google-maps-api';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}`;
    script.async = true;
    script.defer = true;

    // استمع إلى أحداث الشبكة للكشف عن أخطاء API Key
    window.addEventListener('error', this.handleMapScriptError);

    // عند اكتمال تحميل script
    script.onload = () => {
      console.log('[MapService] Google Maps API loaded successfully');
      window.removeEventListener('error', this.handleMapScriptError);
      this.apiLoaded.next(true);
    };

    // عند حدوث خطأ في تحميل script
    script.onerror = () => {
      console.error('[MapService] Failed to load Google Maps API script');
      window.removeEventListener('error', this.handleMapScriptError);
      this.apiLoaded.next(false);
      this.checkApiKeyAndLogError();
    };

    // أضف script إلى head
    document.head.appendChild(script);

    return this.apiLoaded.asObservable();
  }

  /**
   * التعامل مع أخطاء تحميل Google Maps API
   */
  private handleMapScriptError = (event: ErrorEvent) => {
    if (
      event.message &&
      (event.message.includes('google') ||
        event.message.includes('maps') ||
        event.message.includes('Map') ||
        event.message.includes('ApiKey') ||
        event.message.includes('MapsApiKey') ||
        event.message.includes('InvalidKey'))
    ) {
      console.error('[MapService] Error in Google Maps script:', event.message);
      this.checkApiKeyAndLogError();
    }
  };

  /**
   * فحص مفتاح API وطباعة رسائل واضحة للمشاكل المحتملة
   */
  private checkApiKeyAndLogError(): void {
    console.error('=== GOOGLE MAPS API TROUBLESHOOTING ===');

    if (!this.apiKey || this.apiKey.trim() === '') {
      console.error(
        '🔑 ERROR: API Key is empty! You must provide a valid Google Maps API key.',
      );
    } else if (this.apiKey === 'AIzaSyA4KWFc0F76RtQwNGZW9RrPb-zAqxsyDXU') {
      console.error(
        '🔑 WARNING: You are using the default API key from the code example.',
      );
      console.error(
        '    This key may not work. Replace it with your own API key from Google Cloud Console.',
      );
    } else if (this.apiKey.length < 20) {
      console.error(
        "🔑 ERROR: API Key is too short! This doesn't look like a valid Google Maps API key.",
      );
    }

    console.error('❓ Common API key issues:');
    console.error('  1. The API key is invalid or incorrectly formatted');
    console.error('  2. Billing is not enabled on your Google Cloud account');
    console.error(
      '  3. Maps JavaScript API is not enabled in your Google Cloud Console',
    );
    console.error(
      '  4. The API key has restrictions that prevent its use from your domain/IP',
    );

    console.error('🛠️ How to fix:');
    console.error('  1. Go to https://console.cloud.google.com/');
    console.error('  2. Create a project or select an existing one');
    console.error('  3. Enable the "Maps JavaScript API" from the API Library');
    console.error('  4. Create an API key from Credentials page');
    console.error('  5. Setup billing if required');
    console.error(
      '  6. Update the apiKey value in map.service.ts with your new key',
    );

    console.error('=======================================');
  }

  /**
   * إخفاء جزء من مفتاح API عند طباعته في السجلات للأمان
   */
  private getMaskedApiKey(): string {
    if (!this.apiKey || this.apiKey.length < 8) return '******';
    return (
      this.apiKey.substring(0, 4) +
      '...' +
      this.apiKey.substring(this.apiKey.length - 4)
    );
  }

  /**
   * إنشاء خريطة في عنصر DOM معين
   * @param elementId معرف عنصر DOM الذي سيحتوي على الخريطة
   * @param latitude خط العرض
   * @param longitude خط الطول
   * @param zoom مستوى التكبير/التصغير
   * @param title عنوان العلامة (الماركر)
   * @returns كائن يحتوي على الخريطة والعلامة
   */
  createMap(
    elementId: string,
    latitude: number,
    longitude: number,
    zoom = 15,
    title = '',
  ): { map: GoogleMapInstance; marker: GoogleMarkerLike } | null {
    if (!window.google?.maps) {
      console.error(
        '[MapService] ERROR: Google Maps API is not loaded. Cannot create map.',
      );
      return null;
    }

    const mapElement = document.getElementById(elementId);
    if (!(mapElement instanceof HTMLElement)) {
      console.error(
        `[MapService] ERROR: Element with ID "${elementId}" does not exist in the DOM.`,
      );
      return null;
    }

    console.log(
      `[MapService] Creating map at coordinates [${latitude}, ${longitude}] with zoom ${zoom}`,
    );

    try {
      const position = { lat: latitude, lng: longitude };
      const googleMaps = window.google.maps;

      // إنشاء خريطة جديدة
      const map = new googleMaps.Map(mapElement, {
        center: position,
        zoom,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
        zoomControl: true,
      });

      // إضافة علامة (ماركر)
      const marker = new googleMaps.Marker({
        position,
        map,
        title,
        animation: googleMaps.Animation.DROP,
      });

      // إضافة نافذة معلومات إذا كان هناك عنوان
      if (title) {
        const infoWindow = new googleMaps.InfoWindow({
          content: `<div style="padding: 8px;"><strong>${title}</strong></div>`,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        // فتح نافذة المعلومات افتراضيًا
        infoWindow.open(map, marker);
      }

      console.log('[MapService] Map created successfully');
      return { map, marker };
    } catch (error) {
      console.error('[MapService] ERROR creating map:', error);

      // فحص ما إذا كان الخطأ مرتبطًا بـ API Key
      if (error instanceof Error) {
        const errorMessage = error.toString().toLowerCase();
        if (
          (errorMessage.includes('api') && errorMessage.includes('key')) ||
          errorMessage.includes('apinotactivatedmaperror') ||
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('permission')
        ) {
          this.checkApiKeyAndLogError();
        }
      }

      return null;
    }
  }
}
