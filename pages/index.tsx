import { CircleChart, TextBrText } from "@/components/charts"
import { parseServer } from "@/utils/parse"
import { TServersEntity, TStat } from "@/utils/type"
import { ArrowDown, ArrowUp, Server } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

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

  const updatedAt = useCallback((date: number) => {
    if (date == 0) return "从未.";
    var seconds = Math.floor(((new Date()).getTime() - 1000 * date) / 1000);
    var interval = Math.floor(seconds / 60);
    return interval > 1 ? interval + " 分钟前" : "几秒前";
  }, [])

  return (
    <main className="sm:p-16 pb-4 pt-16 min-h-screen">
      <div className="w-fit mx-auto max-container-width">
        <div className="flex items-end mb-8">
          <h1 className="text-2xl font-medium flex items-center -mb-05">
            <Server size={"1em"} className="mr-2" />
            <span>My Servers</span>
          </h1>
          <span className="text-13 text-zinc-400 ml-4">
            最近更新：{data ? updatedAt(parseInt(data.updated)) : updatedAt(0)}
          </span>
        </div>
        {err && <div className="container bg-red-500 bg-opacity-20 p-4 rounded-2xl border border-red-500 border-opacity-40">
          <span className="text-red-600">错误：</span>
          <span className="text-zinc-300">{err}</span>
        </div>}
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
    {/* content */}
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
          <div className="font-semibold text-lg text-zinc-100 mb-4">
            网络
          </div>
          <div className="text-sm text-zinc-500">
            {([
              ["上行", d.netUp],
              ["下行", d.netDown]
            ] as const).map(([name, data]) => (

              <div className="last:mt-4">
                <div>{name}</div>
                <div className="mt-1 flex items-center">
                  <ArrowUp className="stroke-white mr-1" size={"1em"} />
                  {data ? <><span className="mr-1 text-zinc-300">{data.value}</span>{data.unit}</> : "-"}/s
                </div>
              </div>

            ))}
          </div>
        </div>
        {/* delay */}
        <div className="row-span-2">
          <div className="font-semibold text-lg text-zinc-100 mb-4">
            延迟/丢包
          </div>
          <div className="grid grid-cols-5-auto grid-rows-3 text-zinc-500 text-sm gap-y-1">
            {
              ([
                ["电信", server.time_189, server.ping_189],
                ["移动", server.time_10086, server.ping_10086],
                ["联通", server.time_10010, server.ping_10010],
              ] as const).map(([name, delay, loss]) => (
                <>
                  <div>{name}</div>
                  <div className={"ml-2 text-right mr-1 " + delayColor(delay)}>{delay}</div>ms
                  <div className={"ml-2 text-right " + lossColor(loss)}>{loss}</div>%
                </>
              ))
            }
          </div>
        </div>
        {/* traffic */}
        {([
          ["月流量", d.netMonthUp, d.netMonthDown],
          ["总流量", d.netTotalUp, d.netTotalDown]
        ] as const).map(([name, up, down]) => (

          <div className="row-span-2">
            <div className="font-semibold text-lg text-zinc-100 mb-4">{name}</div>
            {([
              [up, <ArrowUp className="stroke-white mr-1" size={"1em"} />],
              [down, <ArrowDown className="stroke-white mr-1" size={"1em"} />]
            ] as const).map(([data, Icon]) => (

              <div className="mt-1 flex items-center text-sm">
                {Icon}
                <div>
                  {data ? data.value : "--"}
                  <span className="text-zinc-500 ml-1">{up?.unit}</span>
                </div>
              </div>

            ))}
          </div>

        ))}

      </div>
    </div>
  </div>
}


