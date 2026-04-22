export function isValidPhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

export function isValidLoginPassword(password) {
  if (!password || password.length < 8 || password.length > 20) return false
  let typeCount = 0
  if (/[A-Z]/.test(password)) typeCount++
  if (/[a-z]/.test(password)) typeCount++
  if (/\d/.test(password)) typeCount++
  if (typeCount < 2) return false
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i+1] && password[i] === password[i+2]) return false
  }
  return true
}

export function isValidCardNo(cardNo) {
  return /^\d{13,19}$/.test(cardNo)
}

export function maskCardNo(cardNo) {
  if (!cardNo || cardNo.length <= 8) return '****' + cardNo.slice(-4)
  return '**** **** **** ' + cardNo.slice(-4)
}
