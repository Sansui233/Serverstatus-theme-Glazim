import { CircleChart, TextBrText } from "@/components/charts"
import { parseServer } from "@/utils/parse"
import { TServersEntity, TStat } from "@/utils/type"
import { ArrowDown, ArrowUp, Cloudy } from "lucide-react"
import { useEffect, useState } from "react"

// TODO 双列布局切换
// TODO 其他主题切换
// TODO 联合滚动
// TODO svg过渡动画
export default function Home() {

  const [data, setData] = useState<TStat | null>(null)
  const [err, setErr] = useState(null)
  useEffect(() => {
    fetch("/json/stats.json")
      .then(resp => resp.json())
      .then(data => {
        setData(data)
      }).catch(reason => {
        setErr(reason)
      })
  }, [])

  return (
    <main className="sm:p-16 p-4 bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="w-fit mx-auto max-container-width">
        <h1 className="text-4xl font-semibold mb-8 flex">
          <Cloudy size={"1em"} className="mr-2" />
          <span>云监控</span>
        </h1>
        {err && <div className="container">{err}</div>}
        {!err && data?.servers && data.servers.map((d, i) => {
          return <ServerCard server={d} key={i} />
        })}
      </div>
    </main>
  );
}


function getColorclass(value: number | null | undefined, break1: number, break2: number) {
  if (typeof value !== "number" && !value) return ""
  return value < break1
    ? "text-green-500" : value >= break2
      ? "text-red-500"
      : "text-yellow-500"
}
const delayColor = (delay: number | null | undefined) => getColorclass(delay, 100, 300)
const lossColor = (loss: number | null | undefined) => getColorclass(loss, 10, 20)


function ServerCard(props: {
  server: TServersEntity
} & React.HTMLAttributes<HTMLDivElement>) {

  const { server, ...otherProps } = props
  const d = parseServer(server)

  return <div {...otherProps} className="rounded-2xl bg-zinc-900 px-6 py-4 my-4 min-h-16">
    {/* title */}
    <div className="flex items-center">
      <div className={"inline-block rounded-full w-2 h-2 mr-2" + (d.protocol !== "--" ? " bg-green-500" : " bg-red-600")} />
      <div className="font-bold">
        {server.name}
      </div>
    </div>
    {/* content pb-2 for scrollbar*/}
    <div className="flex mt-4 overflow-x-auto scrollbar">
      {/* col1 */}
      <div className="flex-none flex flex-col">
        <div className="flex">
          <TextBrText title="协议" value={d.protocol} />
          <TextBrText title="虚拟化" value={server.type.toUpperCase()} />
          <TextBrText title="位置" value={server.location} />
          <TextBrText title="在线天数"
            value={server.uptime ? server.uptime.split(" ")[0] : ""}
            unit={server.uptime ? "天" : "--"} />
        </div>
        <div className="flex">
          <CircleChart
            name="CPU"
            value={d.cpuUsage}
            textinfo={d.cpuUsage ? d.cpuUsage + "" : "--"}
          />
          <CircleChart
            name="内存"
            value={d.memoryUsage}
            textinfo={(d.memoryTotal && d.memoryUsed)
              ? d.memoryUsed.value + d.memoryUsed.unit + " / " + d.memoryTotal.value + d.memoryTotal.unit
              : "- / -"
            }
          />
          <CircleChart
            name="负载"
            value={server.load_1 ? server.load_1 : 0}
            format="text"
            textinfo={server.load_1}
          />
          <CircleChart
            name="硬盘"
            value={d.hddUsage}
            textinfo={(d.hddTotal && d.hddUsed)
              ? d.hddUsed.value + d.hddUsed.unit + " / " + d.hddTotal.value + d.hddTotal.unit
              : "- / -"
            }
          />
        </div>
      </div>
      {/* col2 */}
      <div className="flex-none grid grid-cols-4-auto grid-rows-2 grid-flow-col auto-cols-min gap-x-8 ml-8">
        {/* network */}
        <div className="row-span-2">
          <div className="font-semibold text-lg text-zinc-100 mb-4">网络</div>
          <div className="text-sm text-zinc-500">
            <div>上行</div>
            <div className="mt-1 flex items-center"><ArrowUp className="stroke-white mr-1" size={"1em"} />
              {d.netUp ? <><span className="mr-1 text-zinc-300">{d.netUp.value}</span>{d.netUp.unit}</> : "-"}/s
            </div>
            <div className="mt-4">下行</div>
            <div className="mt-1 flex items-center"><ArrowDown className="stroke-white mr-1" size={"1em"} />
              {d.netDown ? <><span className="mr-1 text-zinc-300">{d.netDown.value}</span>{d.netDown.unit}</> : "-"}/s
            </div>
          </div>
        </div>
        {/* delay */}
        <div className="row-span-2">
          <div className="font-semibold text-lg text-zinc-100 mb-4">延迟/丢包</div>
          <div className="grid grid-cols-5-auto grid-rows-3 text-zinc-500 text-sm gap-y-1">
            <div>电信</div>
            <div className={"ml-2 text-right mr-1 " + delayColor(server.time_189)}>{server.time_189}</div>ms
            <div className={"ml-2 text-right " + lossColor(server.ping_189)}>{server.ping_189}</div>%

            <div>移动</div>
            <div className={"ml-2 text-right mr-1 " + delayColor(server.time_10086)}>{server.time_10086}</div>ms
            <div className={"ml-2 text-right " + lossColor(server.ping_10086)}>{server.ping_10086}</div>%

            <div>联通</div>
            <div className={"ml-2 text-right mr-1 " + delayColor(server.time_10010)}>{server.time_10010}</div>ms
            <div className={"ml-2 text-right " + lossColor(server.ping_10010)}>{server.ping_10010}</div>%
          </div>
        </div>
        {/* traffic */}
        <div className="row-span-2">
          <div className="font-semibold text-lg text-zinc-100 mb-4">月流量</div>
          <div className="mt-1 flex items-center text-sm">
            <ArrowUp className="stroke-white mr-1" size={"1em"} />
            <div>
              {d.netMonthUp ? d.netMonthUp.value : "--"}
              <span className="text-zinc-500 ml-1">{d.netMonthUp?.unit}</span>
            </div>
          </div>
          <div className="mt-1 flex items-center text-sm">
            <ArrowDown className="stroke-white mr-1" size={"1em"} />
            <div>
              {d.netMonthDown ? d.netMonthDown.value : "--"}
              <span className="text-zinc-500 ml-1">{d.netMonthDown?.unit}</span>
            </div>
          </div>
        </div>
        <div className="row-span-2">
          <div className="font-semibold text-lg text-zinc-100 mb-4">总流量</div>
          <div className="mt-1 flex items-center text-sm">
            <ArrowUp className="stroke-white mr-1" size={"1em"} />
            <div>
              {d.netTotalUp ? d.netTotalUp.value : "--"}
              <span className="text-zinc-500 ml-1">{d.netTotalUp?.unit}</span>
            </div>
          </div>
          <div className="mt-1 flex items-center text-sm">
            <ArrowDown className="stroke-white mr-1" size={"1em"} />
            <div>
              {d.netTotalDown ? d.netTotalDown.value : "--"}
              <span className="text-zinc-500 ml-1">{d.netTotalDown?.unit}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
}


