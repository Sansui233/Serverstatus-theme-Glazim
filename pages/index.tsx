import { CircleChart, TextBrText } from "@/components/info"
import { parseServer } from "@/utils/parse"
import { TServersEntity, TStat } from "@/utils/type"
import { Cloudy } from "lucide-react"
import { useEffect, useState } from "react"

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
    <main className="p-16 bg-zinc-950 text-slate-100 min-h-screen">
      <h1 className="text-4xl font-semibold mb-8 flex">
        <Cloudy size={"1em"} className="mr-2" />
        <span>云监控</span>
      </h1>
      {err && <div className="container">{err}</div>}
      {!err && data?.servers && data.servers.map((d, i) => {
        return <ServerCard server={d} key={i} />
      })}
    </main>
  );
}


function ServerCard(props: {
  server: TServersEntity
} & React.HTMLAttributes<HTMLDivElement>) {

  const { server, ...otherProps } = props
  const d = parseServer(server)

  return <div {...otherProps} className="container rounded-2xl bg-zinc-900 px-6 py-4 my-4 min-h-16">
    {/* title */}
    <div className="flex items-center">
      <div className={"inline-block rounded-full w-2 h-2 mr-2" + (d.protocol !== "--" ? " bg-green-500" : " bg-red-600")} />
      <div className="font-bold">
        {server.name}
      </div>
    </div>
    {/* content */}
    <div className="flex flex-grow flex-shrink-0 mx-4 mt-3">
      {/* col1 */}
      <div className="flex flex-col">
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
            percentage={d.cpu}
            textinfo=""
          />
        </div>
      </div>
      {/* col2 */}
      <div> </div>
    </div>
  </div>
}


