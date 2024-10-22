import { ChartBlock, CircleChart, TextBrText } from "@/components/charts"
import { parseServer } from "@/utils/parse"
import { throttle } from "@/utils/throttle"
import { TServersEntity, TStat } from "@/utils/type"
import { ArrowDown, ArrowUp } from "lucide-react"
import React, { useCallback, useEffect, useRef, useState } from "react"

// DONE 联合滚动
// DONE svg过渡动画
// TODO 点击的详情 Model 带图片保存与分享按钮（草）
// TODO 其他主题切换（pr 时再做）
export default function Home() {

  const [data, setData] = useState<TStat | null>(null)
  const [err, setErr] = useState(null)
  const refs = useRef<(HTMLDivElement | undefined | null)[]>([null, null, null])
  const [isModel, setModel] = useState<false | TServersEntity>(false)

  useEffect(() => {

    const getData = () => {
      console.debug("fetch data...")
      fetch("/json/stats.json")
        .then(resp => resp.json())
        .then(data => {
          setData(data)
        }).catch(reason => {
          setErr(reason)
        })
    }
    const h = setInterval(getData, 1000)

    return () => {
      clearInterval(h)
    }
  }, [])

  const updatedAt = useCallback((date: number) => {
    if (date == 0) return "从未.";
    const seconds = Math.floor(((new Date()).getTime() - 1000 * date) / 1000);
    const interval = Math.floor(seconds / 60);
    return interval > 1 ? interval + " 分钟前" : "几秒前";
  }, [])

  return (
    <main className="p-4 min-h-screen">
      <div className="w-fit mx-auto max-container-width">
        <div className="flex items-end py-2 sticky top-0 backdrop-blur-md">
          <h1 className="flex items-center -mb-05 ">
            {/* <div className="rounded-lg bg-zinc-800 p-2" style={{ width: "35px", height: "35px" }} > */}
            <svg className="mx-2" width="21" height="19" viewBox="0 0 21 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="10.6667" width="20.3636" height="7.75758" rx="3.87879" className="fill-zinc-400" />
              <path fillRule="evenodd" clipRule="evenodd" d="M3.87879 0C1.73659 0 0 1.73659 0 3.87879C0 6.02098 1.73659 7.75758 3.87878 7.75758H16.4848C18.627 7.75758 20.3636 6.02098 20.3636 3.87879C20.3636 1.73659 18.627 0 16.4849 0H3.87879ZM3.42834 5.87878C4.2172 5.87878 4.85669 5.28907 4.85669 4.56163C4.85669 3.83419 4.2172 3.24448 3.42834 3.24448C2.63949 3.24448 2 3.83419 2 4.56163C2 5.28907 2.63949 5.87878 3.42834 5.87878Z" className="fill-zinc-400" />
            </svg>
            {/* </div> */}
            <span className="font-medium text-2xl text-zinc-200">Serverstatus</span>
          </h1>
          <span className="text-13 text-zinc-400 ml-4">
            最近更新：{data ? updatedAt(parseInt(data.updated)) : updatedAt(0)}
          </span>
        </div>
        {err && <div className="container bg-red-500 bg-opacity-20 p-4 rounded-2xl border border-red-500 border-opacity-40">
          <span className="text-red-600">错误：</span>
          <span className="text-zinc-200">{err}</span>
        </div>}
        <div>
          {!err && data?.servers && data.servers.map((d, i) => {
            return <ServerCard server={d} key={i} idx={i}
              reflist={refs} onClick={() => isModel === false ? setModel(d) : d.name === isModel.name ? setModel(false) : setModel(d)} />
          })}
        </div>
      </div>
      {isModel !== false && <ServerModel data={isModel} closeModel={() => setModel(false)} />}
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



const syncScroll = (
  sourcedom: HTMLDivElement,
  refList: React.MutableRefObject<(HTMLDivElement | undefined | null)[]>,
  // idx?: number // debug 用
) => {
  const scrollLeft = sourcedom.scrollLeft;

  if (refList.current) {
    refList.current.forEach((dom) => {
      if (dom && dom !== sourcedom && dom.scrollLeft !== scrollLeft) {
        dom.scrollLeft = scrollLeft;
        console.debug("%% send in sync")
      }
    });
  }
};



function ServerCard(props: {
  server: TServersEntity,
  idx: number,
  reflist: React.MutableRefObject<(HTMLDivElement | undefined | null)[]>
} & React.HTMLAttributes<HTMLDivElement>) {

  const { server, idx, reflist, ...otherProps } = props
  const d = parseServer(server)
  const isMouseInside = useRef(false);

  // 竖向变横向的主动 scroll
  useEffect(() => {

    const dom = reflist && reflist.current[idx] ? reflist.current[idx] : null;
    if (!dom) return

    const handleMouseEnter = () => { isMouseInside.current = true };
    const handleMouseLeave = () => { isMouseInside.current = false };
    if (dom) {
      dom.addEventListener('mouseenter', handleMouseEnter);
      dom.addEventListener('mouseleave', handleMouseLeave);
    }

    // Wheel 触发的单个元素 scroll
    const throttledScrollX = throttle((dom: HTMLDivElement, distance: number) => {
      // setScrollLeft(dom.scrollLeft + distance)
      dom.scrollLeft = dom.scrollLeft + distance
      // console.debug('&& debug sending', idx)
    }, 100)
    const handleWheel = throttle((e: WheelEvent) => {
      if (dom && isMouseInside.current) {
        if ((e.deltaY < 0 && dom.scrollLeft > 0)
          || (e.deltaY > 0 && dom.scrollLeft + dom.clientWidth < dom.scrollWidth)
        ) {
          e.preventDefault()
          throttledScrollX(dom, e.deltaY)
        }
      }
    }, 5)
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel)
      if (dom) {
        dom.removeEventListener('mouseenter', handleMouseEnter);
        dom.removeEventListener('mouseleave', handleMouseLeave);
      }
    }
  }, [reflist, idx])

  // 被动 scroll 与 scroll 扩散
  // 其实这里是有可能和后面的事件监听无限制循环 trigger 的，设备越差越会有
  // 但由于滑动无法确定最早滑动的源，触发方式太多了，最后是通过 throttle 来减轻的
  useEffect(() => {
    const dom = reflist && reflist.current[idx] ? reflist.current[idx] : null;
    if (!dom) return

    const handleScroll = () => {
      // console.debug('&& debug receiving', idx)
      syncScroll(dom, reflist)

    }
    const throttled = throttle(handleScroll, 30)
    dom.addEventListener('scroll', throttled)

    return () => {
      dom.removeEventListener('scroll', throttled)
    }

  }, [reflist, idx])

  return <div {...otherProps} className="rounded-2xl bg-zinc-900 px-6 py-4 my-4 min-h-16 border border-zinc-800 cursor-pointer">
    {/* title */}
    <div className="flex items-center">
      <div className={"inline-block rounded-full w-2 h-2 mr-2" + (d.protocol ? " bg-green-500" : " bg-red-600")} />
      <div className="font-bold text-zinc-200">
        {server.name}
      </div>
      {!d.protocol && <span className="ml-4 px-2 rounded-full text-13 bg-red-950 border border-red-900 text-red-400">离线</span>}
    </div>
    {/* content */}
    <div ref={dom => { reflist.current[idx] = dom }} className="flex mt-4 ml-4 overflow-x-auto scrollbar">
      {/* col1 */}
      <div className="flex-none flex flex-col">
        <div className="flex">
          <TextBrText title="协议" value={d.protocol} />
          <TextBrText title="虚拟化" value={server.type.toUpperCase()} />
          <TextBrText title="位置" value={server.location} />
          <TextBrText title="在线天数"
            value={server.uptime ? server.uptime.split(" ")[0] : ""}
            unit={server.uptime ? "天" : ""} />
        </div>
        {d.protocol && <div className="flex">
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
        </div>}
      </div>
      {/* col2 */}
      {d.protocol && <div className="flex-none grid grid-cols-4-auto grid-rows-2 grid-flow-col auto-cols-min gap-x-8 ml-8">
        {/* network */}
        <div className="row-span-2">
          <div className="font-semibold text-lg text-zinc-200 mb-2">
            网络
          </div>
          <div className="text-sm text-zinc-500">
            {([
              ["上行速度", d.netUp, <ArrowUp key={"aru"} className="stroke-zinc-100 mr-1" size={"1em"} />],
              ["下行速度", d.netDown, <ArrowDown key={"ard"} className="stroke-zinc-100 mr-1" size={"1em"} />]
            ] as const).map(([name, data, Icon], i) => (

              <div className="last:mt-2" key={i}>
                <div className="text-zinc-400">{name}</div>
                <div className="mt-1 flex items-center">
                  {Icon}
                  {data ? <><span className="mr-1 text-zinc-300 inline-block text-right min-w-4ch">{data.value}</span>
                    <span className="">{data.unit}</span></> : "-"}/s
                </div>
              </div>

            ))}
          </div>
        </div>
        {/* delay */}
        <div className="row-span-2">
          <div className="font-semibold text-lg text-zinc-200 mb-2">
            延迟/丢包
          </div>
          <div className="grid grid-cols-5-auto grid-rows-3 text-zinc-500 text-sm gap-y-1">
            {
              ([
                ["电信", server.time_189, server.ping_189],
                ["移动", server.time_10086, server.ping_10086],
                ["联通", server.time_10010, server.ping_10010],
              ] as const).map(([name, delay, loss], i) => (
                <React.Fragment key={i}>
                  <div className="text-zinc-400">{name}</div>
                  <div className={"ml-2 text-right mr-1 min-w-4ch " + delayColor(delay)}>{delay}</div>ms
                  <div className={"ml-2 text-right min-w-3ch " + lossColor(loss)}>{loss}</div>%
                </React.Fragment>
              ))
            }
          </div>
        </div>
        {/* traffic */}
        {([
          ["月流量", d.netMonthUp, d.netMonthDown],
          ["总流量", d.netTotalUp, d.netTotalDown]
        ] as const).map(([name, up, down], i) => (

          <div className="row-span-2" key={i}>
            <div className="font-semibold text-lg text-zinc-200 mb-2">{name}</div>
            {([
              [up, <ArrowUp key="aru" className="stroke-zinc-100 mr-1" size={"1em"} />],
              [down, <ArrowDown key="ard" className="stroke-zinc-100 mr-1" size={"1em"} />]
            ] as const).map(([data, Icon], i) => (

              <div className="mt-1 flex items-center text-sm" key={i}>
                {Icon}
                <div>
                  <span className="inline-block text-right min-w-3ch">{data ? data.value : "--"}</span>
                  <span className="text-zinc-500 ml-1">{up?.unit}</span>
                </div>
              </div>

            ))}
          </div>

        ))}

      </div>}
    </div>
  </div>
}

function ServerModel(props: {
  data: TServersEntity
  closeModel: () => void
} & React.HTMLAttributes<HTMLDivElement>) {
  const { data: server, closeModel, ...otherprops } = props
  const [isBeforeClose, setIsBeforeClose] = useState(false)
  const closeModelDelayed = () => {
    setIsBeforeClose(true)
    setTimeout(closeModel, 300)
  }
  const d = parseServer(server)

  console.debug("data", server)
  return <div className={"fixed top-0 right-0 max-w-md h-full pd:my-4 bg-zinc-900 border-zinc-800 border transition-all duration-300 "
    + (isBeforeClose ? "slide-out-right" : "slide-in-right")}
    {...otherprops}>
    <div className="flex flex-col h-full">
      <div className="flex-1 p-2 pt-0 min-h-0 overflow-auto no-scrollbar">
        {/* Content */}
        <div className="flex p-2 items-center sticky top-0 backdrop-blur-md">
          <div className={"inline-block rounded-full w-2 h-2 mr-2" + (d.protocol ? " bg-green-500" : " bg-red-600")} />
          <div className="font-bold text-zinc-200">
            {server.name}
          </div>
          {!d.protocol && <span className="ml-4 px-2 rounded-full text-13 bg-red-950 border border-red-900 text-red-400">离线</span>}
        </div>
        <div className="px-4 my-4">
          <div className="flex">
            <TextBrText title="协议" value={d.protocol} />
            <TextBrText title="虚拟化" value={server.type.toUpperCase()} />
            <TextBrText title="位置" value={server.location} />
            <TextBrText title="在线天数"
              value={server.uptime ? server.uptime.split(" ")[0] : ""}
              unit={server.uptime ? "天" : ""} />
          </div>
          <div className="flex mt-4 items-center">
            <ChartBlock title="CPU">
              <CircleChart
                value={d.cpuUsage}
              />
            </ChartBlock>
            <ChartBlock title="负载">
              <CircleChart
                value={server.load_1 ? server.load_1 : 0}
                format="text"
              />
            </ChartBlock>
            <div className="grid grid-cols-1 text-sm gap-y-1 ml-2">
              {([
                ["进程", server.process_count],
                ["线程", server.thread_count]
              ] as const).map((d, i) => (
                <div key={i}>
                  <span className="inline-block rounded-full w-2 h-2 mr-2 bg-zinc-600"></span>
                  <span className="inline-block w-12 text-zinc-400">{d[0]}</span>
                  <span className="inline-block w-16">{d[1]}</span>
                </div>
              ))}
            </div>
          </div>
          <ChartBlock title="内存" className="mt-4">
            <div className="flex items-center">
              <CircleChart
                value={d.memoryUsage}
              />
              <div
                className="text-sm text-zinc-400 grid grid-rows-2 gap-y-1"
                style={{ gridTemplateColumns: "repeat(6, auto)" }}>
                {([
                  ["内存", d.memoryUsed, d.memoryTotal],
                  ["虚存", d.swapUsed, d.swapTotal]
                ] as const).map((m, i) => {

                  return <React.Fragment key={i}>
                    <span className={"mr-4"}>{m[0]}</span>
                    <span className={"text-zinc-100 mr-2 text-right"}>{m[1]?.value}</span>
                    <span className={"text-zinc-500 "}>{m[1]?.unit}</span>
                    <span className={"mx-2"}> / </span>
                    <span className={"text-zinc-100 mr-2 text-right"}>{m[2]?.value}</span>
                    <span className={"text-zinc-500 "}>{m[2]?.unit}</span>
                  </React.Fragment>

                })}
              </div>
            </div>
          </ChartBlock>
          <ChartBlock title="硬盘" className="mt-4">
            <div className="flex items-center">
              <CircleChart
                value={d.memoryUsage}
              />
              <div
                className="text-sm text-zinc-400 grid grid-rows-3 gap-y-1"
                style={{ gridTemplateColumns: "repeat(6, auto)" }}>
                {([
                  ["容量", d.hddUsed, d.hddTotal],
                  ["读", d.ioRead],
                  ["写", d.ioWrite]
                ] as const).map((m, i) => {

                  return <React.Fragment key={i}>
                    <span className={"mr-4"}>{m[0]}</span>
                    <span className={"text-zinc-100 mr-2 text-right"}>{m[1]?.value}</span>
                    <span className={"text-zinc-500"}>{m[1]?.unit}</span>
                    <span className={"mx-2"}> {m[2] ? "/" : undefined}</span>
                    <span className={"text-zinc-100 mr-2 text-right"}>{m[2]?.value}</span>
                    <span className={"text-zinc-500"}>{m[2]?.unit}</span>
                  </React.Fragment>

                })}
              </div>
            </div>
          </ChartBlock>
          <div className="grid gap-y-4" style={{ gridTemplateColumns: "repeat(2,auto)" }}>
            <ChartBlock title="网络" className="mt-4">
              <div className="mt-4 ml-4">
                <div className="text-sm text-zinc-500">
                  {([
                    ["上行速度", d.netUp, <ArrowUp key={"aru"} className="stroke-zinc-100 mr-1" size={"1em"} />],
                    ["下行速度", d.netDown, <ArrowDown key={"ard"} className="stroke-zinc-100 mr-1" size={"1em"} />]
                  ] as const).map(([name, data, Icon], i) => (

                    <div className="last:mt-2" key={i}>
                      <div className="text-zinc-400">{name}</div>
                      <div className="mt-1 flex items-center">
                        {Icon}
                        {data ? <><span className="mr-1 text-zinc-300 inline-block text-right min-w-4ch">{data.value}</span>
                          <span className="">{data.unit}</span></> : "-"}/s
                      </div>
                    </div>

                  ))}
                </div>
              </div>
            </ChartBlock>
            <ChartBlock title="延迟、丢包" className="mt-4">
              <div className="mt-4 ml-4">
                <div className="grid grid-cols-5-auto grid-rows-3 text-zinc-500 text-sm gap-y-1">
                  {
                    ([
                      ["电信", server.time_189, server.ping_189],
                      ["移动", server.time_10086, server.ping_10086],
                      ["联通", server.time_10010, server.ping_10010],
                    ] as const).map(([name, delay, loss], i) => (
                      <React.Fragment key={i}>
                        <div className="text-zinc-400">{name}</div>
                        <div className={"ml-2 text-right mr-1 min-w-4ch " + delayColor(delay)}>{delay}</div>ms
                        <div className={"ml-2 text-right min-w-3ch " + lossColor(loss)}>{loss}</div>%
                      </React.Fragment>
                    ))
                  }
                </div>
              </div>

            </ChartBlock>
            {([
              ["月流量", d.netMonthUp, d.netMonthDown],
              ["总流量", d.netTotalUp, d.netTotalDown]
            ] as const).map(([name, up, down], i) => (

              <ChartBlock title={name} key={i}>
                <div className="mt-4 ml-4">
                  {([
                    [up, <ArrowUp key="aru" className="stroke-zinc-100 mr-1" size={"1em"} />],
                    [down, <ArrowDown key="ard" className="stroke-zinc-100 mr-1" size={"1em"} />]
                  ] as const).map(([data, Icon], i) => (

                    <div className="mt-1 flex items-center text-sm" key={i}>
                      {Icon}
                      <div>
                        <span className="inline-block text-right min-w-3ch">{data ? data.value : "--"}</span>
                        <span className="text-zinc-500 ml-1">{up?.unit}</span>
                      </div>
                    </div>

                  ))}
                </div>
              </ChartBlock>

            ))}
          </div>
          <ChartBlock title="Socket" className="mt-4">
            <div className="grid grid-cols-2 mt-4 text-sm ml-4 gap-y-1">
              {([
                ["TCP", server.tcp_count],
                ["UDP", server.udp_count]
              ] as const).map((d, i) => (
                <div key={i}>
                  <span className="inline-block w-12 text-zinc-400">{d[0]}</span>
                  <span className="inline-block w-16">{d[1]}</span>
                </div>
              ))}
            </div>
          </ChartBlock>
        </div>

      </div>
      {/* Bottom */}
      <button onClick={closeModelDelayed} className="block p-2 rounded-full bg-zinc-800 text-zinc-300 m-2 text-center hover:bg-zinc-700">
        关闭
        {/* <CircleX className="stroke-zinc-900 fill-zinc-500 hover:fill-zinc-200" /> */}
      </button>
    </div>
  </div>
}

