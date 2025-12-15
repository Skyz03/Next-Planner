'use client'

export default function FlowSankey({ data }: { data: any }) {
    const { planned, adHoc, flows } = data
    // Safety: Prevent divide by zero
    const total = Math.max((planned + adHoc), 1)

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
    const drawFlow = (yStart: number, hStart: number, yEnd: number, hEnd: number, color: string, opacity: number) => {
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
        return <path d={path} fill={color} opacity={opacity} className="hover:opacity-80 transition-opacity duration-300" />
    }

    // Calculate internal flow heights
    // We need to know "how much of the Planned node is specifically for Completed?"
    const hP_C = getH(flows.plannedToCompleted)
    const hP_R = getH(flows.plannedToRolled)
    const hA_C = getH(flows.adHocToCompleted)
    const hA_R = getH(flows.adHocToRolled)

    return (
        <div className="bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm h-full flex flex-col min-h-[320px]">

            {/* HEADER */}
            <div className="flex justify-between items-start mb-4 flex-none">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500">Flow Analysis</h3>
                    <p className="text-[10px] text-stone-400">Intent vs. Reality</p>
                </div>
                {/* Simple Legend */}
                <div className="flex flex-col gap-1 text-[9px] text-stone-400">
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Planned Strategy</span>
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>Ad-Hoc / Chaos</span>
                </div>
            </div>

            {/* CHART AREA (Flexible Height) */}
            <div className="flex-1 flex items-center gap-4 relative">

                {/* LEFT LABELS */}
                <div className="flex flex-col justify-between h-[200px] py-4 w-16 flex-none text-right">
                    <div className="flex flex-col justify-center" style={{ flex: hPlanned }}>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Planned</span>
                        <span className="text-[9px] text-stone-400">{planned}</span>
                    </div>
                    <div className="h-4"></div> {/* Spacer for gap */}
                    <div className="flex flex-col justify-center" style={{ flex: hAdHoc }}>
                        <span className="text-xs font-bold text-orange-500">Ad-Hoc</span>
                        <span className="text-[9px] text-stone-400">{adHoc}</span>
                    </div>
                </div>

                {/* SVG (The River) */}
                <div className="flex-1 h-[200px] relative">
                    <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
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
                <div className="flex flex-col justify-between h-[200px] py-4 w-16 flex-none text-left">
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
            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-start gap-2">
                <div className="p-1 bg-stone-100 dark:bg-stone-800 rounded text-stone-400 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                </div>
                <p className="text-[10px] text-stone-400 leading-relaxed">
                    <span className="font-bold text-stone-600 dark:text-stone-300">Interpretation:</span> ideally, you want thick <span className="text-emerald-500">Green lines</span> flowing to Blue.
                    If you see lots of <span className="text-orange-500">Orange</span>, you were reactive (fighting fires) instead of executing your plan.
                </p>
            </div>

        </div>
    )
}