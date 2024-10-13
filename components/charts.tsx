import { HTMLAttributes } from "react";
import SVGCircle from "./svgs/circle";

export function TextBrText(props: {
  title: string,
  value?: string,
  unit?: string,
}) {
  return <div className="text-zinc-400">
    <div className="text-13 mr-12 mb-2" style={{ marginBottom: "2px" }}>
      {props.title}
    </div>
    <div>
      {props.value ? <span className="text-zinc-100">{props.value}</span> : '--'}
      <span className="text-13 ml-1">{props.unit}</span>
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
    <div className="mx-auto mb-1">
      <SVGCircle radius={radius} strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset}
        strokeColor={strokeColor} dataAngle={percentage} text={value} textFormat={format} />
    </div>
    <div>{name}</div>
    <div>{textinfo}</div>
  </div>

}