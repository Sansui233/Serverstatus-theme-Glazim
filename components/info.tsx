export function TextBrText(props: {
  title: string,
  value: string,
  unit?: string,
}) {
  return <div className="min-w-16">
    <div className="text-13 text-zinc-400" style={{ marginBottom: "2px" }}>
      {props.title}
    </div>
    <div>
      {props.value}
      <span className="text-13 text-zinc-400 ml-1">{props.unit}</span>
    </div>

  </div>
}

export function CircleChart(props: {
  name: string,
  percentage?: number,
  textinfo: string,
}) {

  let value = 0;
  let strokeColor = "#65a30d"

  if (props.percentage) {
    value = props.percentage * 100
    strokeColor = (() => {
      if (value >= 80) return "#b91c1c"
      if (value >= 60) return "#eab308"
      return "#65a30d"
    })()
  }

  const radius = 30
  const strokeDashArray = 2 * Math.PI * radius
  const strokeDashOffset = props.percentage
    ? strokeDashArray * (1 - props.percentage)
    : strokeDashArray

  return <div className="text-center text-zinc-400 text-13 mt-4 mr-4">
    {/* circle */}
    <div className="mx-auto mb-1">
      <svg className="inline-block" role="progressbar" width="72" height="72" viewBox="0 0 72 72">
        <circle
          cx="50%"
          cy="50%"
          r={radius.toString()}
          shape-rendering="geometricPrecision"
          fill="none"
          stroke="#ffffff1a"
          stroke-width="10"
        />
        <circle
          className="origin-center -rotate-90"
          cx="50%"
          cy="50%"
          r={radius.toString()}
          shape-rendering="geometricPrecision"
          fill="none"
          stroke-width="10"
          stroke-dashoffset={strokeDashOffset}
          stroke-dasharray={strokeDashArray}
          stroke-linecap="round"
          style={{ transform: 'rotate(-90deg);transform-origin: 50% 50%;' }}
          stroke={strokeColor}
          data-angel={value}
        />
        <text
          style={{ fontSize: "15px" }}
          x="50%"
          y="50%"
          text-anchor="middle"
          dy="0.35em"
        >
          <tspan className="pie-percent-13 fill-zinc-200">{value}</tspan>
          <tspan className="text-xs fill-zinc-400">%</tspan>
        </text>
      </svg>
    </div>
    {/* name */}
    <div>
      {props.name}
    </div>
    <div>
      {props.textinfo}
    </div>
  </div>

}