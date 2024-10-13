import { TServersEntity } from "./type";


export function parseServer(e: TServersEntity) {
  const protocol = (() => {
    if (e.online4 && e.online6) {
      return "双栈"
    } else if (e.online4) {
      return "IPV4"
    } else if (e.online6) {
      return "IPV6"
    } else {
      return undefined
    }
  })()
  return {
    protocol,
    cpuUsage: e.cpu ? e.cpu * 0.01 : undefined,
    memoryUsage: e.memory_total && e.memory_used ? e.memory_used / e.memory_total : undefined,
    memoryTotal: convertKByte(e.memory_total),
    memoryUsed: convertKByte(e.memory_used),
    hddUsage: e.hdd_total && e.hdd_used ? e.hdd_used / e.hdd_total : undefined,
    hddTotal: convertKByte(mB2kB(e.hdd_total)),
    hddUsed: convertKByte(mB2kB(e.hdd_used)),
    netDown: convertNetworkByte(e.network_rx),
    netUp: convertNetworkByte(e.network_tx),
    netMonthDown: e.network_in && e.last_network_in ? convertNetworkByte(e.network_in - e.last_network_in) : undefined,
    netMonthUp: e.network_out && e.last_network_out ? convertNetworkByte(e.network_out - e.last_network_out) : undefined,
    netTotalDown: convertNetworkByte(e.network_in),
    netTotalUp: convertNetworkByte(e.network_out),
  }
}

function mB2kB(byte?: number | null) {
  if (!byte && typeof byte !== 'number') return undefined
  return byte * 1024
}


function convertKByte(kbyte?: number | null) {
  if (!kbyte && typeof kbyte !== 'number') return undefined
  if (kbyte < 1000) {
    return {
      value: kbyte.toString(),
      unit: "K"
    }
  }
  const mbyte = kbyte / 1024
  if (mbyte < 1024) {
    return {
      value: Math.round(mbyte).toString(),
      unit: "M"
    }
  }
  const gbyte = mbyte / 1024
  if (gbyte < 1024) {
    return {
      value: gbyte.toFixed(1),
      unit: "G"
    }
  }
  const tbyte = gbyte / 1024
  return {
    value: tbyte.toFixed(1),
    unit: "T"
  }
}

function convertNetworkByte(byte?: number | null) {
  if (!byte && typeof byte !== 'number') return undefined

  if (byte < 1024) {
    return {
      value: byte.toString(),
      unit: "B"
    }
  }
  const kbyte = byte / 1024
  if (kbyte < 1024) {
    return {
      value: kbyte.toFixed(1),
      unit: "K"
    }
  }
  return convertKByte(kbyte)
}