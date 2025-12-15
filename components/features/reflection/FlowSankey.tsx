'use client'

export default function FlowSankey({ data }: { data: any }) {
  const { planned, adHoc, flows } = data
  // Safety: Prevent divide by zero
  const total = Math.max(planned + adHoc, 1)

  // Internal coordinate system for the SVG (keeps math simple)
  const viewHeight = 200
  const viewWidth = 100

  // Helper to calculate height proportional to total volume
  const getH = (val: number) => Math.max((val / total) * viewHeight, 2) // Min 2px

  // LEFT SIDE (Inputs)
  const hPlanned = getH(planned)
  const hAdHoc = getH(adHoc)

  // RIGHT SIDE (Outputs)
  // Re-calculate totals based on actual flows to ensure alignment
  const totalCompleted = flows.plannedToCompleted + flows.adHocToCompleted
  const totalRolled = flows.plannedToRolled + flows.adHocToRolled

  const hCompleted = getH(totalCompleted)
  const hRolled = getH(totalRolled)

  // Spacing Logic: Distribute the available vertical space
  // If heights exceed viewHeight (due to min-heights), scale down or accept overlap
  // We use a simple gap strategy here
  const gap = 10

  // Calculate Y positions (centered vertically)
  const contentHeightLeft = hPlanned + hAdHoc + gap
  const offsetLeft = (viewHeight - contentHeightLeft) / 2
  const yPlanned = offsetLeft
  const yAdHoc = yPlanned + hPlanned + gap

  const contentHeightRight = hCompleted + hRolled + gap
  const offsetRight = (viewHeight - contentHeightRight) / 2
  const yCompleted = offsetRight
  const yRolled = yCompleted + hCompleted + gap

  // PATH GENERATOR (Bézier Curves)
  const drawFlow = (
    yStart: number,
    hStart: number,
    yEnd: number,
    hEnd: number,
    color: string,
    opacity: number,
  ) => {
    if (hStart <= 0 || hEnd <= 0) return null

    // Control points for smooth S-curve
    const c1x = 50
    const c2x = 50

    const path = `
      M 0 ${yStart}
      C ${c1x} ${yStart}, ${c2x} ${yEnd}, 100 ${yEnd}
      L 100 ${yEnd + hEnd}
      C ${c2x} ${yEnd + hEnd}, ${c1x} ${yStart + hStart}, 0 ${yStart + hStart}
      Z
    `
    return (
      <path
        d={path}
        fill={color}
        opacity={opacity}
        className="transition-opacity duration-300 hover:opacity-80"
      />
    )
  }

  // Calculate internal flow heights
  // We need to know "how much of the Planned node is specifically for Completed?"
  const hP_C = getH(flows.plannedToCompleted)
  const hP_R = getH(flows.plannedToRolled)
  const hA_C = getH(flows.adHocToCompleted)
  const hA_R = getH(flows.adHocToRolled)

  return (
    <div className="flex h-full min-h-[320px] flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-[#262626]">
      {/* HEADER */}
      <div className="mb-4 flex flex-none items-start justify-between">
        <div>
          <h3 className="text-xs font-bold tracking-widest text-stone-500 uppercase">
            Flow Analysis
          </h3>
          <p className="text-[10px] text-stone-400">Intent vs. Reality</p>
        </div>
        {/* Simple Legend */}
        <div className="flex flex-col gap-1 text-[9px] text-stone-400">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Planned Strategy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>Ad-Hoc / Chaos
          </span>
        </div>
      </div>

      {/* CHART AREA (Flexible Height) */}
      <div className="relative flex flex-1 items-center gap-4">
        {/* LEFT LABELS */}
        <div className="flex h-[200px] w-16 flex-none flex-col justify-between py-4 text-right">
          <div className="flex flex-col justify-center" style={{ flex: hPlanned }}>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Planned
            </span>
            <span className="text-[9px] text-stone-400">{planned}</span>
          </div>
          <div className="h-4"></div> {/* Spacer for gap */}
          <div className="flex flex-col justify-center" style={{ flex: hAdHoc }}>
            <span className="text-xs font-bold text-orange-500">Ad-Hoc</span>
            <span className="text-[9px] text-stone-400">{adHoc}</span>
          </div>
        </div>

        {/* SVG (The River) */}
        <div className="relative h-[200px] flex-1">
          <svg
            viewBox={`0 0 ${viewWidth} ${viewHeight}`}
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
          >
            {/* Nodes Left */}
            <rect x="0" y={yPlanned} width="3" height={hPlanned} fill="#10b981" rx="1.5" />
            <rect x="0" y={yAdHoc} width="3" height={hAdHoc} fill="#f97316" rx="1.5" />

            {/* Flows - Planned */}
            {drawFlow(yPlanned, hP_C, yCompleted, hP_C, '#10b981', 0.25)}
            {drawFlow(yPlanned + hP_C, hP_R, yRolled, hP_R, '#10b981', 0.1)}

            {/* Flows - AdHoc */}
            {/* Note: Start Y is offset by the previous flow ending */}
            {drawFlow(yAdHoc, hA_C, yCompleted + hP_C, hA_C, '#f97316', 0.25)}
            {drawFlow(yAdHoc + hA_C, hA_R, yRolled + hP_R, hA_R, '#f97316', 0.1)}

            {/* Nodes Right */}
            <rect x="97" y={yCompleted} width="3" height={hCompleted} fill="#3b82f6" rx="1.5" />
            <rect x="97" y={yRolled} width="3" height={hRolled} fill="#78716c" rx="1.5" />
          </svg>
        </div>

        {/* RIGHT LABELS */}
        <div className="flex h-[200px] w-16 flex-none flex-col justify-between py-4 text-left">
          <div className="flex flex-col justify-center" style={{ flex: hCompleted }}>
            <span className="text-xs font-bold text-blue-500">Done</span>
            <span className="text-[9px] text-stone-400">{totalCompleted}</span>
          </div>
          <div className="h-4"></div>
          <div className="flex flex-col justify-center" style={{ flex: hRolled }}>
            <span className="text-xs font-bold text-stone-500">Rolled</span>
            <span className="text-[9px] text-stone-400">{totalRolled}</span>
          </div>
        </div>
      </div>

      {/* FOOTER NOTE */}
      <div className="mt-4 flex items-start gap-2 border-t border-stone-100 pt-3 dark:border-stone-800">
        <div className="mt-0.5 rounded bg-stone-100 p-1 text-stone-400 dark:bg-stone-800">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <p className="text-[10px] leading-relaxed text-stone-400">
          <span className="font-bold text-stone-600 dark:text-stone-300">Interpretation:</span>{' '}
          ideally, you want thick <span className="text-emerald-500">Green lines</span> flowing to
          Blue. If you see lots of <span className="text-orange-500">Orange</span>, you were
          reactive (fighting fires) instead of executing your plan.
        </p>
      </div>
    </div>
  )
}
