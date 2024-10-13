export default function SVGCircle(props: {
  radius: number,
  strokeDashoffset: number
  strokeDasharray: number
  strokeColor: string,
  dataAngle: number,
  textFormat: "text" | "percentage",
  text: string | number | undefined,
}) {
  const { radius, strokeDashoffset, strokeDasharray, strokeColor, dataAngle, textFormat, text } = props

  return <svg className="inline-block" role="progressbar" width="72" height="72" viewBox="0 0 72 72">
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
      className="origin-center -rotate-90 transition-all duration-300"
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
      data-angel={dataAngle}
    />
    <text
      style={{ fontSize: "15px" }}
      x="50%"
      y="50%"
      textAnchor="middle"
      dy="0.35em"
    >
      <tspan className="fill-zinc-200">{textFormat === "text" ? text : dataAngle}</tspan>
      {textFormat === "percentage" && <tspan className="text-xs fill-zinc-400">%</tspan>}
    </text>
  </svg>
}