export interface AccountResponse {
  code: AccountCode
  message: string
}
export type AccountCode =
  | '108000'
  | '108001'
  | '108002'
  | '108003'
  | '108004'
  | '108005'
  | '108006'
  | '108007'
  | '108008'
  | '108009'
  | '108010'
  | '108011'
  | '108012'
  | '108013'
  | '108014'
  | '108015'
export const ACCOUNT_MESSAGE: { [key in AccountCode]: string } = {
  '108000': 'None',
  '108001': 'Account not found',
  '108002': 'Account already exists',
  '108003': 'Email is not valid',
  '108004': 'Password is not valid',
  '108005': 'Email field is required',
  '108006': 'Password field is required',
  '108007': 'Unknown error',
  '108008': 'Account register successfully',
  '108009': 'Account login successfully',
  '108010': 'Token is not valid',
  '108011': 'Refresh token successfully',
  '108012': 'New password is like old password',
  '108013': 'New password is not valid',
  '108014': 'New password is updated',
  '108015': 'Token is not found'
}
