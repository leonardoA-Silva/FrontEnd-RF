interface BuyerPreview {
  request(method: string, url: string, params?: Record<string, string | undefined>, body?: unknown): Promise<unknown>;
  socketRequest(event: string, payload?: Record<string, unknown>, userId?: string): Promise<unknown>;
  createSocket(userId?: string): {
    connected: boolean;
    on(event: string, listener: (payload?: unknown) => void): void;
    off(event: string, listener: (payload?: unknown) => void): void;
    connect(): void;
    disconnect(): void;
    timeout(milliseconds: number): { emit(event: string, payload: unknown, callback: (error: Error | null, response: unknown) => void): void };
  };
}

export function createBuyerPreview(): BuyerPreview;
export function isBuyerPreviewPath(pathname: string): boolean;
export const buyerPreview: BuyerPreview;
export const buyerPreviewUser: { readonly id: string; readonly role: string; readonly name: string; readonly email: string; readonly cellphone: string; readonly status: string; readonly birthday: string; readonly created_in: string };
