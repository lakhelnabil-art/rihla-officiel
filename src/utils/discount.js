export function calculateDiscount(client, reservationAmount, manualTriggers = {}) {
  const loyaltyVoyages = client.totalReservations || 0

  let loyaltyDiscount = 0, loyaltyLabel = ''
  if (loyaltyVoyages >= 10) { loyaltyDiscount = 8; loyaltyLabel = 'Fidélité VIP' }
  else if (loyaltyVoyages >= 5) { loyaltyDiscount = 5; loyaltyLabel = 'Fidélité Fidèle' }
  else if (loyaltyVoyages >= 2) { loyaltyDiscount = 3; loyaltyLabel = 'Fidélité Régulier' }

  let amountDiscount = 0, amountLabel = ''
  if (reservationAmount >= 30000) { amountDiscount = 6; amountLabel = 'Commande +30K MAD' }
  else if (reservationAmount >= 15000) { amountDiscount = 4; amountLabel = 'Commande +15K MAD' }
  else if (reservationAmount >= 5000)  { amountDiscount = 2; amountLabel = 'Commande +5K MAD' }

  let manualDiscount = 0, manualLabel = ''
  if (manualTriggers.groupe)       { manualDiscount = 7; manualLabel = 'Groupe' }
  else if (manualTriggers.anticipe){ manualDiscount = 5; manualLabel = 'Anticipée' }
  else if (manualTriggers.anniversaire) { manualDiscount = 3; manualLabel = 'Anniversaire' }
  else if (manualTriggers.parrainage)   { manualDiscount = 2; manualLabel = 'Parrainage' }

  const allDiscounts = [
    { value: loyaltyDiscount,  label: loyaltyLabel,  source: 'loyalty' },
    { value: amountDiscount,   label: amountLabel,   source: 'amount'  },
    { value: manualDiscount,   label: manualLabel,   source: 'manual'  },
  ]
  const best = allDiscounts.reduce((a, b) => a.value >= b.value ? a : b)
  const finalDiscount = Math.min(best.value, 10)

  return {
    percentage:   finalDiscount,
    label:        best.label,
    source:       best.source,
    amountSaved:  (reservationAmount * finalDiscount) / 100,
    finalAmount:  reservationAmount * (1 - finalDiscount / 100),
    // All candidates (for display)
    loyalty:  { value: loyaltyDiscount, label: loyaltyLabel },
    amount:   { value: amountDiscount,  label: amountLabel  },
    manual:   { value: manualDiscount,  label: manualLabel  },
  }
}
