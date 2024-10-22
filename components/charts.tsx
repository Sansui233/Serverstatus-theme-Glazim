import { parseServer } from "@/utils/parse";
import { TServersEntity } from "@/utils/type";
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
  name?: string,
  value?: number,
  format?: "text" | "percentage",
  textinfo?: string | number | null,
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

  return <div {...otherprops} className={"text-center text-zinc-400 text-13 mt-4 mr-4 " + otherprops.className} >
    <div className="mx-auto mb-1">
      <SVGCircle radius={radius} strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset}
        strokeColor={strokeColor} dataAngle={percentage} text={value} textFormat={format} />
    </div>
    <div>{name}</div>
    <div>{textinfo}</div>
  </div>

}

export function ChartBlock({ title, twColor = "bg-zinc-600", children, ...otherprops }: {
  title: string
  twColor?: string
} & HTMLAttributes<HTMLDivElement>) {
  return <div className={"min-w-16 " + otherprops.className} {...otherprops}>
    <div className="flex items-center">
      <div className={"inline-block mr-2 w-2 h-4 rounded-full " + twColor}></div>
      <span className="text-sm text-zinc-400">{title}</span>
    </div>
    {children}
  </div>
}

export function getColorclass(value: number | null | undefined, break1: number, break2: number) {

  if (typeof value !== "number" && !value) return "text-zinc-500"
  return value < break1 ? "text-green-500"
    : value >= break2 ? "text-red-500"
      : "text-yellow-500"
}

export function getBgclass(value: number | null | undefined, break1: number, break2: number) {

  if (typeof value !== "number" && !value) return "bg-zinc-500"
  return value < break1 ? "bg-green-500"
    : value >= break2 ? "bg-red-500"
      : "bg-yellow-500"
}


export function StatusDots({ server, d }: { server: TServersEntity, d: ReturnType<typeof parseServer> }) {
  return <>
    {d.protocol && <span className="inline-block ml-4">
      {(
        [
          d.cpuUsage,
          d.memoryUsage,
          server.load_1,
          d.hddUsage,
        ]
      ).map((v, i) => (
        <span className={"inline-block w-2 h-2 rounded-full ml-2px " + getBgclass(v, 0.6, 0.8)} key={i} />
      ))}
    </span>}
    {d.protocol && <span className="inline-block ml-2">
      {(
        [
          server.ping_189,
          server.ping_10086,
          server.ping_10010
        ]
      ).map((v, i) => (
        <span className={"inline-block w-2 h-2 rounded-full ml-2px " + getBgclass(v, 10, 20)} key={i} />
      ))}
    </span>}
  </>
}