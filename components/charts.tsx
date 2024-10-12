import { HTMLAttributes } from "react";

export function TextBrText(props: {
  title: string,
  value: string,
  unit?: string,
}) {
  return <div>
    <div className="text-13 text-zinc-400 mr-12 mb-2" style={{ marginBottom: "2px" }}>
      {props.title}
    </div>
    <div>
      {props.value}
      <span className="text-13 text-zinc-400 ml-1">{props.unit}</span>
    </div>

  </div>
}


export function CircleChart({ name, value, format = "percentage", textinfo, ...otherprops }: {
  name: string,
  value?: number,
  format?: "text" | "percentage",
  textinfo: string | number | undefined | null,
} & HTMLAttributes<HTMLDivElement>) {

  let percentage = 0;
  let strokeColor = "#16a34a"

  if (value) {
    percentage = Math.round(value * 100)
    strokeColor = (() => {
      if (percentage >= 80) return "#b91c1c"
      if (percentage >= 60) return "#eab308"
      return "#16a34a"
    })()
  }

  const radius = 30
  const strokeDasharray = 2 * Math.PI * radius
  const strokeDashoffset = value
    ? strokeDasharray * (1 - value)
    : strokeDasharray

  return <div {...otherprops} className="text-center text-zinc-400 text-13 mt-4 mr-4" >
    {/* circle */}
    <div className="mx-auto mb-1">
      <svg className="inline-block" role="progressbar" width="72" height="72" viewBox="0 0 72 72">
        <circle
          cx="50%"
          cy="50%"
          r={radius.toString()}
          shapeRendering="geometricPrecision"
          fill="none"
          stroke="#ffffff1a"
          strokeWidth="10"
        />
        <circle
          className="origin-center -rotate-90"
          cx="50%"
          cy="50%"
          r={radius.toString()}
          shapeRendering="geometricPrecision"
          fill="none"
          strokeWidth="10"
          strokeDashoffset={strokeDashoffset}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: "50% 50%" }}
          stroke={strokeColor}
          data-angel={percentage}
        />
        <text
          style={{ fontSize: "15px" }}
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="0.35em"
        >
          <tspan className="fill-zinc-200">{format === "text" ? value : percentage}</tspan>
          {format === "percentage" && <tspan className="text-xs fill-zinc-400">%</tspan>}
        </text>
      </svg>
    </div>
    {/* name */}
    <div>
      {name}
    </div>
    <div>
      {textinfo}
    </div>
  </div>

}