export function getWeekDays(dateInWeek: Date = new Date()) {
  const week = []

  // Clone the date to avoid mutating the original
  const current = new Date(dateInWeek)

  // Get current day number (0 = Sunday, 1 = Monday, ... 6 = Saturday)
  const day = current.getDay()

  // Calculate distance to the previous Monday
  // If today is Sunday (0), Monday was 6 days ago.
  // Else, Monday was (day - 1) days ago.
  const diff = current.getDate() - day + (day === 0 ? -6 : 1)

  // Set date to that Monday
  const monday = new Date(current.setDate(diff))

  // Generate the 7 days starting from Monday
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday)
    nextDay.setDate(monday.getDate() + i)
    week.push(nextDay)
  }

  return week
}

export function formatDate(date: Date) {
  return date.toISOString().split('T')[0]
}

export function isSameDay(d1: Date, d2: Date) {
  return formatDate(d1) === formatDate(d2)
}
