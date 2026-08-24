export type ApiErrorKind = "network" | "http" | "contract" | "not-found"

export type ApiError = {
  kind: ApiErrorKind
  message: string
  status?: number
}

export function apiError(kind: ApiErrorKind, message: string, status?: number): ApiError {
  return status === undefined ? { kind, message } : { kind, message, status }
}
