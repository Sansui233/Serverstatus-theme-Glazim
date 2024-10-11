export interface TStat {
  servers?: (TServersEntity)[] | null;
  updated: string;
}
export interface TServersEntity {
  name: string;
  type: string;
  host: string;
  location: string;
  online4: boolean;
  online6: boolean;
  uptime?: string | null;
  load_1?: number | null;
  load_5?: number | null;
  load_15?: number | null;
  ping_10010?: number | null;
  ping_189?: number | null;
  ping_10086?: number | null;
  time_10010?: number | null;
  time_189?: number | null;
  time_10086?: number | null;
  tcp_count?: number | null;
  udp_count?: number | null;
  process_count?: number | null;
  thread_count?: number | null;
  network_rx?: number | null;
  network_tx?: number | null;
  network_in?: number | null;
  network_out?: number | null;
  cpu?: number | null;
  memory_total?: number | null;
  memory_used?: number | null;
  swap_total?: number | null;
  swap_used?: number | null;
  hdd_total?: number | null;
  hdd_used?: number | null;
  last_network_in: number;
  last_network_out: number;
  io_read?: number | null;
  io_write?: number | null;
  custom?: string | null;
}
