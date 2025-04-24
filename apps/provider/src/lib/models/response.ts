export interface APIResponse<T = null> {
  error?: string;
  data?: T;
}
