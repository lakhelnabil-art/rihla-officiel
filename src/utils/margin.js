export function applyDiscountWithMarginProtection(
  prixAchat, prixVente, requestedDiscount,
  isManager = false, margeMinimale = 10
) {
  const maxDiscount = Math.max(
    0,
    (1 - prixAchat / (prixVente * (1 - margeMinimale / 100))) * 100
  )

  let finalDiscount = requestedDiscount
  let warning = null
  let blockedByMargin = false

  if (requestedDiscount > maxDiscount && !isManager) {
    finalDiscount = Math.floor(maxDiscount * 10) / 10
    blockedByMargin = true
    warning = `Réduction limitée à ${finalDiscount}% pour préserver la marge minimale de ${margeMinimale}%.`
  }

  if (requestedDiscount > maxDiscount && isManager) {
    finalDiscount = requestedDiscount
    warning = `⚠️ Marge en dessous du seuil minimum (${margeMinimale}%). Dérogation manager appliquée.`
  }

  const prixFinal = prixVente * (1 - finalDiscount / 100)
  const margeMAD  = prixFinal - prixAchat
  const margePct  = (margeMAD / prixFinal) * 100

  return {
    prixAchat,
    prixVente,
    discountRequested: requestedDiscount,
    discountApplied:   finalDiscount,
    prixFinal:         Math.round(prixFinal),
    margeMAD:          Math.round(margeMAD),
    margePct:          margePct.toFixed(1),
    blockedByMargin,
    warning,
    maxAllowableDiscount: Math.floor(maxDiscount * 10) / 10,
  }
}
