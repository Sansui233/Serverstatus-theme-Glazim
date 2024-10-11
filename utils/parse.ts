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
      return "--"
    }
  })()
  return {
    protocol,
    cpu: e.cpu ? e.cpu * 0.01 : undefined,
  }
}